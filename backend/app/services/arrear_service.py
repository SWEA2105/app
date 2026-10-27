"""
Student Arrear Count Classification Service
============================================
Provides unified, verified arrear calculation, deduplication, and
category classification logic according to official university examination rules.

Classification Rules:
- CATEGORY A (5+ Arrears):  5 to 9 uncleared subjects  -> Amber / Yellow (#f59e0b)
- CATEGORY B (10+ Arrears): 10 to 19 uncleared subjects -> Orange (#f97316)
- CATEGORY C (20+ Arrears): 20 or more uncleared subjects -> Red (#ef4444)
- < 5 arrears: No category badge, excluded from 5+, 10+, 20+ groups.
- Categories are strictly mutually exclusive.
"""

from typing import Optional, Any
from copy import deepcopy

PASS_GRADES = {"O", "A+", "A", "B+", "B", "C", "P", "PASS"}
CONFIRMED_FAIL_GRADES = {"RA", "U", "FAIL"}
SPECIAL_NON_FAIL_GRADES = {"AB", "ABSENT", "WH", "WITHHELD", "I", "INCOMPLETE", "UNKNOWN"}

CATEGORY_5_PLUS = {
    "id": "5_plus",
    "name": "5+ Arrears",
    "label": "5+ Arrears",
    "badge": "5+ Arrears",
    "min": 5,
    "max": 9,
    "color": "amber",
    "hex": "#f59e0b",
    "bgClass": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "textClass": "text-amber-400",
}

CATEGORY_10_PLUS = {
    "id": "10_plus",
    "name": "10+ Arrears",
    "label": "10+ Arrears",
    "badge": "10+ Arrears",
    "min": 10,
    "max": 19,
    "color": "orange",
    "hex": "#f97316",
    "bgClass": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "textClass": "text-orange-400",
}

CATEGORY_20_PLUS = {
    "id": "20_plus",
    "name": "20+ Arrears",
    "label": "20+ Arrears",
    "badge": "20+ Arrears",
    "min": 20,
    "max": 9999,
    "color": "red",
    "hex": "#ef4444",
    "bgClass": "bg-rose-500/10 text-rose-400 border-rose-500/20",
    "textClass": "text-rose-400",
}

ARREAR_CATEGORIES = [CATEGORY_5_PLUS, CATEGORY_10_PLUS, CATEGORY_20_PLUS]


def get_arrear_category(arrear_count: int) -> Optional[dict]:
    """
    Returns the mutually exclusive category dictionary for a given arrear count,
    or None if count < 5.
    """
    if arrear_count >= 20:
        return CATEGORY_20_PLUS
    elif arrear_count >= 10:
        return CATEGORY_10_PLUS
    elif arrear_count >= 5:
        return CATEGORY_5_PLUS
    return None


def classify_student_arrears(
    student: dict,
    university_results: Optional[list[dict]] = None
) -> dict:
    """
    Calculates a student's current uncleared arrear count using verified
    examination history with the following strict rules:
    
    1. Count each uncleared subject only ONCE (deduplication by subject code).
    2. Repeated failures in the same subject do NOT increment the count.
    3. Cleared subjects are excluded from the current count while retaining historical attempts.
    4. Only confirmed failures ('FAIL', 'RA', 'U') are counted. Special statuses ('AB', 'WH', etc.)
       are not counted as confirmed failures without official confirmation.
    5. Incomplete records are flagged with 'needsVerification: True'.
    """
    reg_no = student.get("regNo")
    student_arrears = student.get("arrears", [])
    
    # Track subject states: subject_code -> { name, semester, status, attempts, clearedInSession, needsVerification }
    subject_map: dict[str, dict[str, Any]] = {}
    data_incomplete = False
    
    # 1. Process from student's arrear ledger
    for arr in student_arrears:
        code = (arr.get("subjectCode") or "").strip().upper()
        if not code:
            data_incomplete = True
            continue
        
        name = arr.get("subjectName") or code
        sem = arr.get("semester") or 0
        arr_status = (arr.get("status") or "ACTIVE").upper()
        attempts = arr.get("attempts", 1)
        cleared_session = arr.get("clearedInSession")
        
        if code not in subject_map:
            subject_map[code] = {
                "subjectCode": code,
                "subjectName": name,
                "semester": sem,
                "status": arr_status,
                "attempts": attempts,
                "clearedInSession": cleared_session,
                "examSession": arr.get("examSession", "N/A"),
                "needsVerification": False,
            }
        else:
            existing = subject_map[code]
            # Accumulate attempts if multiple entries exist
            existing["attempts"] = max(existing["attempts"], attempts)
            # If any record marks it CLEARED, status becomes CLEARED
            if arr_status == "CLEARED":
                existing["status"] = "CLEARED"
                if cleared_session:
                    existing["clearedInSession"] = cleared_session
    
    # 2. Cross-reference with verified university results if provided
    if university_results and reg_no:
        student_exams = [r for r in university_results if r.get("regNo") == reg_no]
        for exam in student_exams:
            code = (exam.get("subjectCode") or "").strip().upper()
            if not code:
                continue
            
            name = exam.get("subjectName") or code
            grade = (exam.get("grade") or "").strip().upper()
            result = (exam.get("result") or "").strip().upper()
            sem = exam.get("semester") or 5
            session = exam.get("examSession") or "Nov/Dec 2024"
            
            is_pass = grade in PASS_GRADES or result == "PASS"
            is_fail = grade in CONFIRMED_FAIL_GRADES or result == "FAIL"
            is_special = grade in SPECIAL_NON_FAIL_GRADES or result in SPECIAL_NON_FAIL_GRADES
            
            if code not in subject_map:
                if is_fail:
                    subject_map[code] = {
                        "subjectCode": code,
                        "subjectName": name,
                        "semester": sem,
                        "status": "ACTIVE",
                        "attempts": 1,
                        "clearedInSession": None,
                        "examSession": session,
                        "needsVerification": False,
                    }
                elif is_special:
                    # Mark as needs verification, do not count as confirmed failure
                    subject_map[code] = {
                        "subjectCode": code,
                        "subjectName": name,
                        "semester": sem,
                        "status": "VERIFICATION_REQUIRED",
                        "attempts": 1,
                        "clearedInSession": None,
                        "examSession": session,
                        "needsVerification": True,
                    }
            else:
                existing = subject_map[code]
                if is_pass:
                    existing["status"] = "CLEARED"
                    existing["clearedInSession"] = session
                elif is_fail:
                    # Only increment attempts if it was not already cleared
                    if existing["status"] != "CLEARED":
                        existing["status"] = "ACTIVE"
                        existing["attempts"] = max(existing.get("attempts", 1), 1) + 1
    
    # Separate into pending and cleared
    pending_subjects = []
    cleared_subjects = []
    verification_needed = []
    
    for sub in subject_map.values():
        if sub["status"] == "CLEARED":
            cleared_subjects.append(sub)
        elif sub["status"] == "ACTIVE":
            pending_subjects.append(sub)
        elif sub["needsVerification"] or sub["status"] == "VERIFICATION_REQUIRED":
            verification_needed.append(sub)
    
    # Sort pending subjects by semester then subject code
    pending_subjects.sort(key=lambda s: (s["semester"], s["subjectCode"]))
    cleared_subjects.sort(key=lambda s: (s["semester"], s["subjectCode"]))
    
    uncleared_count = len(pending_subjects)
    cleared_count = len(cleared_subjects)
    total_distinct_backlogs = uncleared_count + cleared_count
    
    category = get_arrear_category(uncleared_count)
    category_id = category["id"] if category else None
    category_label = category["label"] if category else None
    category_color = category["color"] if category else None
    
    return {
        "studentId": student.get("id"),
        "regNo": reg_no,
        "studentName": student.get("name"),
        "department": student.get("department"),
        "currentSemester": student.get("semester"),
        "section": student.get("section", "A"),
        "cgpa": student.get("cgpa", 0.0),
        "attendance": student.get("attendance", 0.0),
        "totalUnclearedCount": uncleared_count,
        "clearedCount": cleared_count,
        "totalHistoricalBacklogs": total_distinct_backlogs,
        "category": category_id,
        "categoryLabel": category_label,
        "categoryBadge": category["badge"] if category else None,
        "categoryColor": category_color,
        "categoryMeta": category,
        "pendingSubjects": pending_subjects,
        "clearedSubjects": cleared_subjects,
        "verificationRequiredSubjects": verification_needed,
        "hasIncompleteData": data_incomplete or len(verification_needed) > 0,
        "statusMessage": "Needs verification" if (data_incomplete or len(verification_needed) > 0) else "Verified",
    }


def get_cohort_arrear_classification(
    students: list[dict],
    university_results: Optional[list[dict]] = None
) -> dict:
    """
    Classifies all students in the cohort and aggregates category counts
    and distributions.
    """
    classified_students = [
        classify_student_arrears(st, university_results)
        for st in students
    ]
    
    cat_5_plus = [s for s in classified_students if s["category"] == "5_plus"]
    cat_10_plus = [s for s in classified_students if s["category"] == "10_plus"]
    cat_20_plus = [s for s in classified_students if s["category"] == "20_plus"]
    under_5 = [s for s in classified_students if s["category"] is None]
    
    total_students = len(classified_students)
    total_with_arrears = len([s for s in classified_students if s["totalUnclearedCount"] > 0])
    all_clear_count = len([s for s in classified_students if s["totalUnclearedCount"] == 0])
    
    distribution = [
        {
            "category": "5+ Arrears",
            "range": "5 - 9",
            "count": len(cat_5_plus),
            "percentage": round((len(cat_5_plus) / total_students) * 100.0, 1) if total_students else 0.0,
            "color": "#f59e0b",
        },
        {
            "category": "10+ Arrears",
            "range": "10 - 19",
            "count": len(cat_10_plus),
            "percentage": round((len(cat_10_plus) / total_students) * 100.0, 1) if total_students else 0.0,
            "color": "#f97316",
        },
        {
            "category": "20+ Arrears",
            "range": "20+",
            "count": len(cat_20_plus),
            "percentage": round((len(cat_20_plus) / total_students) * 100.0, 1) if total_students else 0.0,
            "color": "#ef4444",
        },
    ]
    
    return {
        "summary": {
            "totalStudents": total_students,
            "allClearCount": all_clear_count,
            "totalWithArrears": total_with_arrears,
            "fivePlusCount": len(cat_5_plus),
            "tenPlusCount": len(cat_10_plus),
            "twentyPlusCount": len(cat_20_plus),
            "underFiveCount": len(under_5),
        },
        "distribution": distribution,
        "students": classified_students,
        "categories": {
            "fivePlus": cat_5_plus,
            "tenPlus": cat_10_plus,
            "twentyPlus": cat_20_plus,
            "underFive": under_5,
        }
    }
