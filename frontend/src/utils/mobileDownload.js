/**
 * Mobile & Web Safe File Downloader
 * 
 * Provides unified file downloading for CSV and document exports.
 * Works seamlessly in standard desktop/mobile browsers, and is prepared
 * for native Capacitor iOS & Android WebViews where blob URLs may be restricted.
 */
export async function downloadFile(param1, param2, mimeType = 'text/csv;charset=utf-8;') {
  try {
    let filename = param1;
    let content = param2;

    // Defensive handling: if caller passed (content, filename) instead of (filename, content)
    if (
      typeof param1 === 'string' &&
      (param1.includes('\n') || param1.length > 120) &&
      typeof param2 === 'string' &&
      !param2.includes('\n')
    ) {
      filename = param2;
      content = param1;
    }

    // Check if running inside native Capacitor environment
    const isNative = typeof window !== 'undefined' && Boolean(
      window.Capacitor?.isNativePlatform?.() ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'ionic:'
    );

    if (isNative && window.Capacitor?.Plugins?.Filesystem) {
      try {
        const { Filesystem, Directory } = window.Capacitor.Plugins;
        await Filesystem.writeFile({
          path: filename,
          data: typeof content === 'string' ? content : await content.text(),
          directory: Directory.Documents,
        });

        if (window.Capacitor?.Plugins?.Share) {
          const uriResult = await Filesystem.getUri({
            directory: Directory.Documents,
            path: filename,
          });
          await window.Capacitor.Plugins.Share.share({
            title: filename,
            url: uriResult.uri,
          });
        }
        return true;
      } catch (nativeErr) {
        console.warn('Native Capacitor save fallback to web blob:', nativeErr);
      }
    }

    // Standard Web & Responsive WebView implementation
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 400);

    return true;
  } catch (err) {
    console.error('File export download error:', err);
    return false;
  }
}

