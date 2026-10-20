import pandas as pd
import numpy as np
from app.core.database import db, SUBJECTS_CATALOG
from app.schemas.ia_schema import StudentIARow, SubjectAnalyticsOut

class IAService:
    @staticmethod
    def get_subject_analytics(subject_code: str, department: str = "CSE") -> SubjectAnalyticsOut:
        students = db.get_all_students(department=department)
        rows_data = []

        for s in students:
            marks = s.get("marks", {}).get(subject_code, {"ia1": 0.0, "ia2": 0.0})
            ia1 = float(marks.get("ia1", 0.0))
            ia2 = float(marks.get("ia2", 0.0))
            avg = (ia1 + ia2) / 2.0
            delta = ia2 - ia1
            
            trajectory = "steady"
            if delta >= 5.0:
                trajectory = "improving"
            elif delta <= -5.0:
                trajectory = "declining"

            # Attention criteria
            is_critical = avg < 50.0
            is_declining = delta <= -15.0
            is_low_att = s.get("attendance", 80.0) < 75.0 and avg < 60.0
            needs_attention = is_critical or is_declining or is_low_att

            flag_reason = None
            if is_critical:
                flag_reason = "Scoring < 50% (IA Minimum Criterion Not Met)"
            elif is_declining:
                flag_reason = f"Sharp Decline (-{abs(int(delta))} marks drop in IA-2)"
            elif is_low_att:
                flag_reason = "Attendance < 75% with At-Risk Marks"

            rows_data.append({
                "id": s["id"],
                "regNo": s["regNo"],
                "name": s["name"],
                "department": s["department"],
                "attendance": s.get("attendance", 85.0),
                "ia1": ia1,
                "ia2": ia2,
                "avg": avg,
                "delta": delta,
                "trajectory": trajectory,
                "needsAttention": needs_attention,
                "flagReason": flag_reason,
            })

        if not rows_data:
            return SubjectAnalyticsOut(
                subjectCode=subject_code,
                subjectName=SUBJECTS_CATALOG.get(subject_code, subject_code),
                totalStudents=0,
                subjectAverage=0.0,
                highestMark=0.0,
                lowestMark=0.0,
                passRate=0.0,
                improvingCount=0,
                decliningCount=0,
                atRiskCount=0,
                students=[]
            )

        # Utilize Pandas for statistical aggregation and ranking
        df = pd.DataFrame(rows_data)
        df["rank"] = df["avg"].rank(ascending=False, method="min").astype(int)
        df = df.sort_values(by=["avg", "ia2"], ascending=[False, False])

        subject_avg = float(np.round(df["avg"].mean(), 1))
        highest = float(np.round(df["avg"].max(), 1))
        lowest = float(np.round(df["avg"].min(), 1))
        passed_count = int((df["avg"] >= 50.0).sum())
        pass_rate = float(np.round((passed_count / len(df)) * 100.0, 1))
        improving_count = int((df["trajectory"] == "improving").sum())
        declining_count = int((df["trajectory"] == "declining").sum())
        at_risk_count = int(df["needsAttention"].sum())

        student_rows = [
            StudentIARow(
                id=row["id"],
                regNo=row["regNo"],
                name=row["name"],
                department=row["department"],
                attendance=row["attendance"],
                ia1=row["ia1"],
                ia2=row["ia2"],
                avg=round(row["avg"], 1),
                delta=round(row["delta"], 1),
                trajectory=row["trajectory"],
                rank=int(row["rank"]),
                needsAttention=bool(row["needsAttention"]),
                flagReason=row["flagReason"],
            )
            for _, row in df.iterrows()
        ]

        return SubjectAnalyticsOut(
            subjectCode=subject_code,
            subjectName=SUBJECTS_CATALOG.get(subject_code, subject_code),
            totalStudents=len(df),
            subjectAverage=subject_avg,
            highestMark=highest,
            lowestMark=lowest,
            passRate=pass_rate,
            improvingCount=improving_count,
            decliningCount=declining_count,
            atRiskCount=at_risk_count,
            students=student_rows
        )

ia_service = IAService()
