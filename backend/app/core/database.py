import uuid
from typing import Optional, Any
from copy import deepcopy

# Initial authentic mock dataset for immediate out-of-the-box operation and Supabase sync
INITIAL_STUDENTS_DATA = [
    {
        "id": "s01",
        "regNo": "710022104001",
        "name": "Aarav Sharma",
        "email": "aarav.sharma@college.edu",
        "department": "CSE",
        "semester": "sem5",
        "section": "A",
        "gender": "Male",
        "attendance": 94.0,
        "cgpa": 8.85,
        "marks": {
            "CS3591": {"ia1": 88.0, "ia2": 94.0},
            "CS3501": {"ia1": 82.0, "ia2": 90.0},
            "CS3551": {"ia1": 85.0, "ia2": 92.0},
            "CS3511": {"ia1": 90.0, "ia2": 95.0},
            "CCS334": {"ia1": 86.0, "ia2": 91.0},
        },
        "semesterHistory": [
            {"sem": 1, "sgpa": 8.6, "passCount": 6, "failCount": 0},
            {"sem": 2, "sgpa": 8.75, "passCount": 6, "failCount": 0},
            {"sem": 3, "sgpa": 8.9, "passCount": 6, "failCount": 0},
            {"sem": 4, "sgpa": 8.85, "passCount": 6, "failCount": 0},
        ],
        "arrears": []
    },
    {
        "id": "s02",
        "regNo": "710022104002",
        "name": "Bhavya Nair",
        "email": "bhavya.nair@college.edu",
        "department": "CSE",
        "semester": "sem5",
        "section": "A",
        "gender": "Female",
        "attendance": 88.0,
        "cgpa": 8.12,
        "marks": {
            "CS3591": {"ia1": 72.0, "ia2": 84.0},
            "CS3501": {"ia1": 76.0, "ia2": 82.0},
            "CS3551": {"ia1": 70.0, "ia2": 78.0},
            "CS3511": {"ia1": 82.0, "ia2": 88.0},
            "CCS334": {"ia1": 75.0, "ia2": 80.0},
        },
        "semesterHistory": [
            {"sem": 1, "sgpa": 8.0, "passCount": 6, "failCount": 0},
            {"sem": 2, "sgpa": 8.1, "passCount": 6, "failCount": 0},
            {"sem": 3, "sgpa": 7.9, "passCount": 6, "failCount": 0},
            {"sem": 4, "sgpa": 8.2, "passCount": 6, "failCount": 0},
        ],
        "arrears": []
    },
    {
        "id": "s03",
        "regNo": "710022104003",
        "name": "Deepak Kumar",
        "email": "deepak.kumar@college.edu",
        "department": "CSE",
        "semester": "sem5",
        "section": "A",
        "gender": "Male",
        "attendance": 72.0,
        "cgpa": 6.45,
        "marks": {
            "CS3591": {"ia1": 65.0, "ia2": 44.0},
            "CS3501": {"ia1": 58.0, "ia2": 38.0},
            "CS3551": {"ia1": 60.0, "ia2": 42.0},
            "CS3511": {"ia1": 70.0, "ia2": 52.0},
            "CCS334": {"ia1": 62.0, "ia2": 46.0},
        },
        "semesterHistory": [
            {"sem": 1, "sgpa": 7.1, "passCount": 6, "failCount": 0},
            {"sem": 2, "sgpa": 6.8, "passCount": 5, "failCount": 1},
            {"sem": 3, "sgpa": 6.2, "passCount": 5, "failCount": 1},
            {"sem": 4, "sgpa": 6.4, "passCount": 6, "failCount": 0},
        ],
        "arrears": [
            {
                "subjectCode": "CS3352",
                "subjectName": "Foundations of Data Science",
                "semester": 3,
                "examSession": "Nov/Dec 2023",
                "status": "CLEARED",
                "clearedInSession": "Apr/May 2024",
                "attempts": 2
            },
            {
                "subjectCode": "MA3354",
                "subjectName": "Discrete Mathematics",
                "semester": 2,
                "examSession": "Apr/May 2023",
                "status": "ACTIVE",
                "clearedInSession": None,
                "attempts": 3
            }
        ]
    },
    {
        "id": "s04",
        "regNo": "710022104004",
        "name": "Divya R",
        "email": "divya.r@college.edu",
        "department": "CSE",
        "semester": "sem5",
        "section": "A",
        "gender": "Female",
        "attendance": 98.0,
        "cgpa": 9.65,
        "marks": {
            "CS3591": {"ia1": 96.0, "ia2": 98.0},
            "CS3501": {"ia1": 94.0, "ia2": 97.0},
            "CS3551": {"ia1": 92.0, "ia2": 95.0},
            "CS3511": {"ia1": 98.0, "ia2": 99.0},
            "CCS334": {"ia1": 95.0, "ia2": 98.0},
        },
        "semesterHistory": [
            {"sem": 1, "sgpa": 9.5, "passCount": 6, "failCount": 0},
            {"sem": 2, "sgpa": 9.7, "passCount": 6, "failCount": 0},
            {"sem": 3, "sgpa": 9.6, "passCount": 6, "failCount": 0},
            {"sem": 4, "sgpa": 9.8, "passCount": 6, "failCount": 0},
        ],
        "arrears": []
    },
    {
        "id": "s05",
        "regNo": "710022104005",
        "name": "Gokul S",
        "email": "gokul.s@college.edu",
        "department": "CSE",
        "semester": "sem5",
        "section": "A",
        "gender": "Male",
        "attendance": 64.0,
        "cgpa": 5.75,
        "marks": {
            "CS3591": {"ia1": 42.0, "ia2": 36.0},
            "CS3501": {"ia1": 38.0, "ia2": 32.0},
            "CS3551": {"ia1": 45.0, "ia2": 40.0},
            "CS3511": {"ia1": 52.0, "ia2": 44.0},
            "CCS334": {"ia1": 46.0, "ia2": 39.0},
        },
        "semesterHistory": [
            {"sem": 1, "sgpa": 6.2, "passCount": 5, "failCount": 1},
            {"sem": 2, "sgpa": 5.8, "passCount": 4, "failCount": 2},
            {"sem": 3, "sgpa": 5.5, "passCount": 4, "failCount": 2},
            {"sem": 4, "sgpa": 5.4, "passCount": 5, "failCount": 1},
        ],
        "arrears": [
            {
                "subjectCode": "MA3151",
                "subjectName": "Matrices and Calculus",
                "semester": 1,
                "examSession": "Jan/Feb 2023",
                "status": "CLEARED",
                "clearedInSession": "Nov/Dec 2023",
                "attempts": 2
            },
            {
                "subjectCode": "CS3491",
                "subjectName": "Artificial Intelligence & ML",
                "semester": 4,
                "examSession": "Apr/May 2024",
                "status": "ACTIVE",
                "clearedInSession": None,
                "attempts": 2
            },
            {
                "subjectCode": "CS3452",
                "subjectName": "Theory of Computation",
                "semester": 4,
                "examSession": "Apr/May 2024",
                "status": "ACTIVE",
                "clearedInSession": None,
                "attempts": 1
            }
        ]
    },
    {
        "id": "s06",
        "regNo": "710022104006",
        "name": "Harini K",
        "email": "harini.k@college.edu",
        "department": "CSE",
        "semester": "sem5",
        "section": "A",
        "gender": "Female",
        "attendance": 92.0,
        "cgpa": 8.52,
        "marks": {
            "CS3591": {"ia1": 84.0, "ia2": 89.0},
            "CS3501": {"ia1": 80.0, "ia2": 86.0},
            "CS3551": {"ia1": 82.0, "ia2": 87.0},
            "CS3511": {"ia1": 85.0, "ia2": 90.0},
            "CCS334": {"ia1": 81.0, "ia2": 85.0},
        },
        "semesterHistory": [
            {"sem": 1, "sgpa": 8.4, "passCount": 6, "failCount": 0},
            {"sem": 2, "sgpa": 8.5, "passCount": 6, "failCount": 0},
            {"sem": 3, "sgpa": 8.6, "passCount": 6, "failCount": 0},
            {"sem": 4, "sgpa": 8.5, "passCount": 6, "failCount": 0},
        ],
        "arrears": []
    },
    {
        "id": "s07",
        "regNo": "710022104007",
        "name": "Imran Khan",
        "email": "imran.khan@college.edu",
        "department": "CSE",
        "semester": "sem5",
        "section": "B",
        "gender": "Male",
        "attendance": 84.0,
        "cgpa": 7.68,
        "marks": {
            "CS3591": {"ia1": 68.0, "ia2": 78.0},
            "CS3501": {"ia1": 64.0, "ia2": 76.0},
            "CS3551": {"ia1": 72.0, "ia2": 80.0},
            "CS3511": {"ia1": 75.0, "ia2": 82.0},
            "CCS334": {"ia1": 70.0, "ia2": 79.0},
        },
        "semesterHistory": [
            {"sem": 1, "sgpa": 7.5, "passCount": 6, "failCount": 0},
            {"sem": 2, "sgpa": 7.6, "passCount": 6, "failCount": 0},
            {"sem": 3, "sgpa": 7.7, "passCount": 6, "failCount": 0},
            {"sem": 4, "sgpa": 7.9, "passCount": 6, "failCount": 0},
        ],
        "arrears": []
    },
    {
        "id": "s11",
        "regNo": "710022104011",
        "name": "Manoj Kumar P",
        "email": "manoj.kumar@college.edu",
        "department": "CSE",
        "semester": "sem5",
        "section": "A",
        "gender": "Male",
        "attendance": 68.0,
        "cgpa": 5.92,
        "marks": {
            "CS3591": {"ia1": 50.0, "ia2": 42.0},
            "CS3501": {"ia1": 45.0, "ia2": 38.0},
            "CS3551": {"ia1": 52.0, "ia2": 46.0},
            "CS3511": {"ia1": 55.0, "ia2": 48.0},
            "CCS334": {"ia1": 48.0, "ia2": 41.0},
        },
        "semesterHistory": [
            {"sem": 1, "sgpa": 6.4, "passCount": 5, "failCount": 1},
            {"sem": 2, "sgpa": 6.0, "passCount": 5, "failCount": 1},
            {"sem": 3, "sgpa": 5.7, "passCount": 4, "failCount": 2},
            {"sem": 4, "sgpa": 5.6, "passCount": 4, "failCount": 2},
        ],
        "arrears": [
            {
                "subjectCode": "CS3401",
                "subjectName": "Algorithms",
                "semester": 4,
                "examSession": "Apr/May 2024",
                "status": "ACTIVE",
                "clearedInSession": None,
                "attempts": 1
            },
            {
                "subjectCode": "MA3354",
                "subjectName": "Discrete Mathematics",
                "semester": 3,
                "examSession": "Nov/Dec 2023",
                "status": "ACTIVE",
                "clearedInSession": None,
                "attempts": 2
            }
        ]
    }
]

INITIAL_UNIVERSITY_RESULTS = [
    {"id": "ur01", "regNo": "710022104001", "name": "Aarav Sharma", "subjectCode": "CS3591", "subjectName": "Computer Networks", "grade": "O", "credits": 4, "result": "PASS", "semester": 5, "examSession": "Nov/Dec 2024"},
    {"id": "ur02", "regNo": "710022104001", "name": "Aarav Sharma", "subjectCode": "CS3501", "subjectName": "Compiler Design", "grade": "A+", "credits": 4, "result": "PASS", "semester": 5, "examSession": "Nov/Dec 2024"},
    {"id": "ur03", "regNo": "710022104001", "name": "Aarav Sharma", "subjectCode": "CS3551", "subjectName": "Distributed Systems", "grade": "A+", "credits": 3, "result": "PASS", "semester": 5, "examSession": "Nov/Dec 2024"},
    {"id": "ur04", "regNo": "710022104002", "name": "Bhavya Nair", "subjectCode": "CS3591", "subjectName": "Computer Networks", "grade": "A", "credits": 4, "result": "PASS", "semester": 5, "examSession": "Nov/Dec 2024"},
    {"id": "ur05", "regNo": "710022104002", "name": "Bhavya Nair", "subjectCode": "CS3501", "subjectName": "Compiler Design", "grade": "A", "credits": 4, "result": "PASS", "semester": 5, "examSession": "Nov/Dec 2024"},
    {"id": "ur06", "regNo": "710022104003", "name": "Deepak Kumar", "subjectCode": "CS3591", "subjectName": "Computer Networks", "grade": "RA", "credits": 4, "result": "FAIL", "semester": 5, "examSession": "Nov/Dec 2024"},
    {"id": "ur07", "regNo": "710022104003", "name": "Deepak Kumar", "subjectCode": "CS3501", "subjectName": "Compiler Design", "grade": "RA", "credits": 4, "result": "FAIL", "semester": 5, "examSession": "Nov/Dec 2024"},
    {"id": "ur08", "regNo": "710022104004", "name": "Divya R", "subjectCode": "CS3591", "subjectName": "Computer Networks", "grade": "O", "credits": 4, "result": "PASS", "semester": 5, "examSession": "Nov/Dec 2024"},
    {"id": "ur09", "regNo": "710022104004", "name": "Divya R", "subjectCode": "CS3501", "subjectName": "Compiler Design", "grade": "O", "credits": 4, "result": "PASS", "semester": 5, "examSession": "Nov/Dec 2024"},
    {"id": "ur10", "regNo": "710022104005", "name": "Gokul S", "subjectCode": "CS3591", "subjectName": "Computer Networks", "grade": "RA", "credits": 4, "result": "FAIL", "semester": 5, "examSession": "Nov/Dec 2024"},
    {"id": "ur11", "regNo": "710022104005", "name": "Gokul S", "subjectCode": "CS3501", "subjectName": "Compiler Design", "grade": "RA", "credits": 4, "result": "FAIL", "semester": 5, "examSession": "Nov/Dec 2024"},
    {"id": "ur12", "regNo": "710022104006", "name": "Harini K", "subjectCode": "CS3591", "subjectName": "Computer Networks", "grade": "A+", "credits": 4, "result": "PASS", "semester": 5, "examSession": "Nov/Dec 2024"},
]

SUBJECTS_CATALOG = {
    "CS3591": "Computer Networks",
    "CS3501": "Compiler Design",
    "CS3551": "Distributed Systems",
    "CS3511": "Data Mining & Warehousing",
    "CCS334": "Big Data Analytics",
    "MA3354": "Discrete Mathematics",
    "CS3401": "Algorithms",
    "CS3491": "Artificial Intelligence & ML",
    "CS3452": "Theory of Computation",
    "MA3151": "Matrices and Calculus",
    "CS3352": "Foundations of Data Science"
}

class InMemoryDatabase:
    def __init__(self):
        self.students = deepcopy(INITIAL_STUDENTS_DATA)
        self.university_results = deepcopy(INITIAL_UNIVERSITY_RESULTS)

    def get_all_students(self, department: Optional[str] = None, semester: Optional[str] = None):
        res = self.students
        if department:
            res = [s for s in res if s["department"].lower() == department.lower()]
        if semester:
            res = [s for s in res if s["semester"].lower() == semester.lower()]
        return res

    def get_student_by_id(self, student_id: str):
        return next((s for s in self.students if s["id"] == student_id), None)

    def get_student_by_reg_no(self, reg_no: str):
        return next((s for s in self.students if s["regNo"] == reg_no), None)

    def add_student(self, student_data: dict):
        new_id = student_data.get("id") or f"s{len(self.students) + 1:02d}"
        student_data["id"] = new_id
        student_data.setdefault("marks", {})
        student_data.setdefault("arrears", [])
        student_data.setdefault("semesterHistory", [])
        self.students.append(student_data)
        return student_data

    def update_student(self, student_id: str, updates: dict):
        student = self.get_student_by_id(student_id)
        if not student:
            return None
        for k, v in updates.items():
            if v is not None:
                student[k] = v
        return student

    def update_ia_mark(self, student_id: str, subject_code: str, ia_type: str, mark: float):
        student = self.get_student_by_id(student_id)
        if not student:
            return None
        if subject_code not in student["marks"]:
            student["marks"][subject_code] = {"ia1": 0.0, "ia2": 0.0}
        student["marks"][subject_code][ia_type] = float(mark)
        return student

    def get_all_university_results(self, semester: Optional[int] = None):
        if semester:
            return [r for r in self.university_results if r["semester"] == semester]
        return self.university_results

    def add_university_results(self, new_records: list[dict]):
        for r in new_records:
            if "id" not in r:
                r["id"] = f"ur_{uuid.uuid4().hex[:8]}"
            self.university_results.append(r)
            # If failed, add to student's arrear ledger if student exists
            if r.get("grade") == "RA" or r.get("result") == "FAIL":
                st = self.get_student_by_reg_no(r["regNo"])
                if st:
                    existing_arr = next((a for a in st["arrears"] if a["subjectCode"] == r["subjectCode"] and a["status"] == "ACTIVE"), None)
                    if existing_arr:
                        existing_arr["attempts"] += 1
                    else:
                        st["arrears"].append({
                            "subjectCode": r["subjectCode"],
                            "subjectName": r.get("subjectName") or SUBJECTS_CATALOG.get(r["subjectCode"], r["subjectCode"]),
                            "semester": r.get("semester", 5),
                            "examSession": r.get("examSession", "Nov/Dec 2024"),
                            "status": "ACTIVE",
                            "clearedInSession": None,
                            "attempts": 1
                        })
        return len(new_records)

    def clear_arrear(self, reg_no: str, subject_code: str, cleared_session: str):
        st = self.get_student_by_reg_no(reg_no)
        if not st:
            return False
        cleared = False
        for arr in st.get("arrears", []):
            if arr["subjectCode"] == subject_code and arr["status"] == "ACTIVE":
                arr["status"] = "CLEARED"
                arr["clearedInSession"] = cleared_session
                cleared = True
        return cleared

db = InMemoryDatabase()
