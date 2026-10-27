import React from 'react';
import './NeonRings.css';

/**
 * Three independent neon rings surrounding the login form.
 * - Ring 1: vivid hot pink (#ff2457)
 * - Ring 2: bright neon green (#39ff14)
 * - Ring 3: luminous yellow (#fff94a)
 * 
 * Uses organic CSS border-radius morphing keyframes and distinct initial rotation/scaling.
 */
export default function NeonRings() {
  return (
    <>
      <div className="neon-ring ring-pink" aria-hidden="true" />
      <div className="neon-ring ring-green" aria-hidden="true" />
      <div className="neon-ring ring-yellow" aria-hidden="true" />
    </>
  );
}
