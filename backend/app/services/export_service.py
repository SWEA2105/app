import io
import pandas as pd
from app.core.database import db

class ExportService:
    @staticmethod
    def generate_ia_roster_csv(department: str = "CSE", subject_code: str = "CS3591") -> bytes:
        students = db.get_all_students(department=department)
        data = []
        for s in students:
            marks = s.get("marks", {}).get(subject_code, {"ia1": 0.0, "ia2": 0.0})
            ia1 = marks.get("ia1", 0.0)
            ia2 = marks.get("ia2", 0.0)
            avg = (ia1 + ia2) / 2.0
            data.append({
                "Register Number": s["regNo"],
                "Student Name": s["name"],
                "Department": s["department"],
                "Subject Code": subject_code,
                "IA-1 (100)": ia1,
                "IA-2 (100)": ia2,
                "Average (%)": round(avg, 1),
                "Status": "Needs Attention" if avg < 50.0 else "Satisfactory"
            })
        df = pd.DataFrame(data)
        output = io.StringIO()
        df.to_csv(output, index=False)
        return output.getvalue().encode("utf-8")

    @staticmethod
    def generate_arrear_ledger_csv(department: str = "CSE") -> bytes:
        students = db.get_all_students(department=department)
        data = []
        for s in students:
            for arr in s.get("arrears", []):
                data.append({
                    "Register Number": s["regNo"],
                    "Student Name": s["name"],
                    "Department": s["department"],
                    "Subject Code": arr["subjectCode"],
                    "Subject Name": arr["subjectName"],
                    "Semester Failed": arr["semester"],
                    "Original Session": arr["examSession"],
                    "Attempts": arr["attempts"],
                    "Status": arr["status"],
                    "Cleared In Session": arr.get("clearedInSession") or "N/A"
                })
        df = pd.DataFrame(data) if data else pd.DataFrame(columns=["Register Number", "Student Name", "Subject Code", "Status"])
        output = io.StringIO()
        df.to_csv(output, index=False)
        return output.getvalue().encode("utf-8")

export_service = ExportService()
