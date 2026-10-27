"""
Automated Test Suite for Student Arrear Count Classification
============================================================
Tests covering:
- 0, 3, 4, 5, 9, 10, 19, 20, and 22 arrears
- Strict mutual exclusivity (22 arrears appears ONLY in 20+)
- Repeated failed attempts in the same subject (deduplication)
- Failed and later cleared subject (cleared status precedence)
- Multiple semesters backlog accumulation
- Incomplete examination history and special grade handling (AB, WH)
- Department and semester filtering
- Cross-module consistency (Arrear History, Student Profiles, University Results)
- API endpoint integration
"""

import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.services.arrear_service import (
    classify_student_arrears,
    get_arrear_category,
    get_cohort_arrear_classification,
    CATEGORY_5_PLUS,
    CATEGORY_10_PLUS,
    CATEGORY_20_PLUS,
)
from app.core.database import db


class TestArrearClassificationService(unittest.TestCase):
    """Unit tests for the core Arrear Classification service logic."""

    def test_category_boundaries_and_mutual_exclusivity(self):
        """
        Verify boundary conditions: 0, 3, 4, 5, 9, 10, 19, 20, 22 arrears.
        Ensure mutually exclusive classification.
        """
        # 0 Arrears
        cat_0 = get_arrear_category(0)
        self.assertIsNone(cat_0, "0 arrears must not have a category badge")

        # 3 Arrears
        cat_3 = get_arrear_category(3)
        self.assertIsNone(cat_3, "3 arrears must not appear in 5+, 10+, or 20+")

        # 4 Arrears
        cat_4 = get_arrear_category(4)
        self.assertIsNone(cat_4, "4 arrears must not appear in 5+, 10+, or 20+")

        # 5 Arrears -> Category A (Amber)
        cat_5 = get_arrear_category(5)
        self.assertIsNotNone(cat_5)
        self.assertEqual(cat_5["id"], "5_plus")
        self.assertEqual(cat_5["badge"], "5+ Arrears")
        self.assertEqual(cat_5["color"], "amber")

        # 9 Arrears -> Category A (Amber)
        cat_9 = get_arrear_category(9)
        self.assertIsNotNone(cat_9)
        self.assertEqual(cat_9["id"], "5_plus")
        self.assertEqual(cat_9["badge"], "5+ Arrears")

        # 10 Arrears -> Category B (Orange)
        cat_10 = get_arrear_category(10)
        self.assertIsNotNone(cat_10)
        self.assertEqual(cat_10["id"], "10_plus")
        self.assertEqual(cat_10["badge"], "10+ Arrears")
        self.assertEqual(cat_10["color"], "orange")

        # 19 Arrears -> Category B (Orange)
        cat_19 = get_arrear_category(19)
        self.assertIsNotNone(cat_19)
        self.assertEqual(cat_19["id"], "10_plus")
        self.assertEqual(cat_19["badge"], "10+ Arrears")

        # 20 Arrears -> Category C (Red)
        cat_20 = get_arrear_category(20)
        self.assertIsNotNone(cat_20)
        self.assertEqual(cat_20["id"], "20_plus")
        self.assertEqual(cat_20["badge"], "20+ Arrears")
        self.assertEqual(cat_20["color"], "red")

        # 22 Arrears -> Category C (Red)
        cat_22 = get_arrear_category(22)
        self.assertIsNotNone(cat_22)
        self.assertEqual(cat_22["id"], "20_plus")
        self.assertEqual(cat_22["badge"], "20+ Arrears")
        self.assertEqual(cat_22["color"], "red")

        # Verify mutual exclusivity: 22 must NEVER match 5_plus or 10_plus
        self.assertNotEqual(cat_22["id"], "5_plus")
        self.assertNotEqual(cat_22["id"], "10_plus")

    def test_repeated_failed_attempts_in_same_subject(self):
        """
        Verify that repeated failed attempts in the SAME subject are deduplicated
        and counted as ONLY 1 arrear.
        """
        student = {
            "id": "test_rep",
            "regNo": "99001",
            "name": "Repeat Test Student",
            "department": "CSE",
            "semester": "sem5",
            "arrears": [
                # 3 entries or 3 attempts for CS3591
                {"subjectCode": "CS3591", "subjectName": "Computer Networks", "semester": 3, "status": "ACTIVE", "attempts": 3},
                {"subjectCode": "CS3591", "subjectName": "Computer Networks", "semester": 4, "status": "ACTIVE", "attempts": 2},
            ]
        }
        res = classify_student_arrears(student)
        self.assertEqual(res["totalUnclearedCount"], 1, "Repeated failures in same subject must count as 1 arrear")
        self.assertEqual(res["pendingSubjects"][0]["subjectCode"], "CS3591")
        self.assertIsNone(res["category"], "1 arrear should have no category badge")

    def test_failed_then_cleared_subject(self):
        """
        Verify that when a failed subject is subsequently cleared, it is removed
        from the current uncleared count while retaining history.
        """
        student = {
            "id": "test_cleared",
            "regNo": "99002",
            "name": "Cleared Test Student",
            "department": "CSE",
            "semester": "sem5",
            "arrears": [
                {"subjectCode": "CS3352", "subjectName": "Data Science", "semester": 3, "status": "CLEARED", "clearedInSession": "Apr/May 2024", "attempts": 2},
                {"subjectCode": "MA3354", "subjectName": "Discrete Math", "semester": 2, "status": "ACTIVE", "attempts": 1},
            ]
        }
        res = classify_student_arrears(student)
        self.assertEqual(res["totalUnclearedCount"], 1, "Only MA3354 should be active")
        self.assertEqual(res["clearedCount"], 1, "CS3352 should be recorded as cleared")
        self.assertEqual(res["totalHistoricalBacklogs"], 2, "Total historical records should be 2")

    def test_multiple_semesters_backlog_accumulation(self):
        """
        Verify backlogs accumulated across semesters 1, 2, 3, 4.
        """
        arrears_list = [
            {"subjectCode": f"SUB_S1_{i}", "subjectName": f"Sem 1 Paper {i}", "semester": 1, "status": "ACTIVE"} for i in range(3)
        ] + [
            {"subjectCode": f"SUB_S2_{i}", "subjectName": f"Sem 2 Paper {i}", "semester": 2, "status": "ACTIVE"} for i in range(3)
        ] + [
            {"subjectCode": f"SUB_S3_{i}", "subjectName": f"Sem 3 Paper {i}", "semester": 3, "status": "ACTIVE"} for i in range(3)
        ] + [
            {"subjectCode": f"SUB_S4_{i}", "subjectName": f"Sem 4 Paper {i}", "semester": 4, "status": "ACTIVE"} for i in range(3)
        ]
        # Total = 12 uncleared subjects across 4 semesters
        student = {
            "id": "test_multi",
            "regNo": "99003",
            "name": "Multi Sem Student",
            "department": "CSE",
            "semester": "sem5",
            "arrears": arrears_list
        }
        res = classify_student_arrears(student)
        self.assertEqual(res["totalUnclearedCount"], 12)
        self.assertEqual(res["category"], "10_plus")
        self.assertEqual(res["categoryBadge"], "10+ Arrears")
        self.assertEqual(res["categoryColor"], "orange")

    def test_incomplete_examination_history_and_special_grades(self):
        """
        Verify that Absent (AB), Withheld (WH), and missing codes do not count
        as confirmed failures and trigger verification flags.
        """
        student = {
            "id": "test_inc",
            "regNo": "99004",
            "name": "Incomplete Student",
            "department": "CSE",
            "semester": "sem5",
            "arrears": [
                {"subjectCode": "", "subjectName": "Unknown", "semester": 1, "status": "ACTIVE"}
            ]
        }
        uni_results = [
            {"regNo": "99004", "subjectCode": "CS3591", "subjectName": "Networks", "grade": "AB", "result": "ABSENT", "semester": 5},
            {"regNo": "99004", "subjectCode": "CS3501", "subjectName": "Compiler", "grade": "WH", "result": "WITHHELD", "semester": 5},
        ]
        res = classify_student_arrears(student, uni_results)
        self.assertTrue(res["hasIncompleteData"])
        self.assertEqual(res["statusMessage"], "Needs verification")
        # AB and WH should NOT be counted as confirmed failures
        self.assertEqual(res["totalUnclearedCount"], 0, "Non-confirmed grades AB/WH must not count as confirmed failures")

    def test_cohort_aggregation_and_distribution(self):
        """
        Verify cohort summary metrics, including 5+, 10+, and 20+ bucket counts.
        """
        all_students = db.get_all_students()
        cohort = get_cohort_arrear_classification(all_students)
        summary = cohort["summary"]

        self.assertGreaterEqual(summary["fivePlusCount"], 1)
        self.assertGreaterEqual(summary["tenPlusCount"], 1)
        self.assertGreaterEqual(summary["twentyPlusCount"], 1)

        # Ensure sum of categories is consistent
        categorized_sum = summary["fivePlusCount"] + summary["tenPlusCount"] + summary["twentyPlusCount"] + summary["underFiveCount"]
        self.assertEqual(categorized_sum, summary["totalStudents"])

        # Check distribution items
        distribution = cohort["distribution"]
        self.assertEqual(len(distribution), 3)
        self.assertEqual(distribution[0]["category"], "5+ Arrears")
        self.assertEqual(distribution[1]["category"], "10+ Arrears")
        self.assertEqual(distribution[2]["category"], "20+ Arrears")


class TestCrossModuleConsistency(unittest.TestCase):
    """
    Verifies that the same student has the exact same current arrear count
    and category across Arrear History, Student Profiles, and University Results.
    """

    def setUp(self):
        self.client = TestClient(app)

    def test_student_arrear_count_consistency_across_all_modules(self):
        """
        Compare the computed current arrear count for students:
        1. From /api/arrears/classified-students (Module A)
        2. From /api/students/{id}/dossier (Module B)
        3. From /api/university-results/analytics (Module C)
        """
        # Module A response
        res_a = self.client.get("/api/arrears/classified-students?department=CSE")
        self.assertEqual(res_a.status_code, 200)
        data_a = res_a.json()["data"]["students"]
        arrear_map_a = {s["regNo"]: s["totalUnclearedCount"] for s in data_a}
        category_map_a = {s["regNo"]: s["category"] for s in data_a}

        # Module B response (check all students)
        res_b = self.client.get("/api/students?department=CSE")
        self.assertEqual(res_b.status_code, 200)
        data_b = res_b.json()["data"]
        arrear_map_b = {s["regNo"]: s["currentArrearCount"] for s in data_b}
        category_map_b = {s["regNo"]: s["arrearCategory"] for s in data_b}

        # Module C response
        res_c = self.client.get("/api/university-results/analytics?semester=5")
        self.assertEqual(res_c.status_code, 200)
        category_students_c = res_c.json()["data"]["categoryStudents"]
        arrear_map_c = {s["regNo"]: s["arrearCount"] for s in category_students_c}
        category_map_c = {s["regNo"]: s["category"] for s in category_students_c}

        # Verify Module A and Module B agree for every student
        for reg_no, count_a in arrear_map_a.items():
            self.assertIn(reg_no, arrear_map_b, f"Student {reg_no} must exist in Student Profiles")
            self.assertEqual(count_a, arrear_map_b[reg_no], f"Count mismatch between Arrear History and Profiles for {reg_no}")
            self.assertEqual(category_map_a[reg_no], category_map_b[reg_no], f"Category mismatch between Arrear History and Profiles for {reg_no}")

            # If student has arrears (>0), verify Module C agrees as well
            if count_a > 0:
                self.assertIn(reg_no, arrear_map_c, f"Student with arrears {reg_no} must be in University Results")
                self.assertEqual(count_a, arrear_map_c[reg_no], f"Count mismatch between Arrear History and University Results for {reg_no}")
                self.assertEqual(category_map_a[reg_no], category_map_c[reg_no], f"Category mismatch between Arrear History and University Results for {reg_no}")

        # Check known target students
        # s13: Praveen V -> 6 arrears -> 5_plus
        self.assertEqual(arrear_map_a.get("710022104013"), 6)
        self.assertEqual(category_map_a.get("710022104013"), "5_plus")

        # s14: Suresh Kumar -> 12 arrears -> 10_plus
        self.assertEqual(arrear_map_a.get("710022104014"), 12)
        self.assertEqual(category_map_a.get("710022104014"), "10_plus")

        # s15: Vigneshwaran M -> 22 arrears -> 20_plus
        self.assertEqual(arrear_map_a.get("710022104015"), 22)
        self.assertEqual(category_map_a.get("710022104015"), "20_plus")


class TestArrearApiEndpoints(unittest.TestCase):
    """Integration tests for backend endpoints."""

    def setUp(self):
        self.client = TestClient(app)

    def test_arrears_classified_endpoint_filters(self):
        """Test filtering by category, semester, and search query."""
        # Filter by 5_plus category
        res_5 = self.client.get("/api/arrears/classified-students?category=5_plus")
        self.assertEqual(res_5.status_code, 200)
        students_5 = res_5.json()["data"]["students"]
        for s in students_5:
            self.assertEqual(s["category"], "5_plus")
            self.assertTrue(5 <= s["totalUnclearedCount"] <= 9)

        # Filter by 10_plus category
        res_10 = self.client.get("/api/arrears/classified-students?category=10_plus")
        self.assertEqual(res_10.status_code, 200)
        students_10 = res_10.json()["data"]["students"]
        for s in students_10:
            self.assertEqual(s["category"], "10_plus")
            self.assertTrue(10 <= s["totalUnclearedCount"] <= 19)

        # Filter by 20_plus category
        res_20 = self.client.get("/api/arrears/classified-students?category=20_plus")
        self.assertEqual(res_20.status_code, 200)
        students_20 = res_20.json()["data"]["students"]
        for s in students_20:
            self.assertEqual(s["category"], "20_plus")
            self.assertGreaterEqual(s["totalUnclearedCount"], 20)

        # Filter by search
        res_search = self.client.get("/api/arrears/classified-students?search=Praveen")
        self.assertEqual(res_search.status_code, 200)
        self.assertGreaterEqual(len(res_search.json()["data"]["students"]), 1)
        self.assertEqual(res_search.json()["data"]["students"][0]["regNo"], "710022104013")

    def test_arrear_kpis_endpoint(self):
        """Test /api/arrears/kpis includes category counts."""
        res = self.client.get("/api/arrears/kpis?department=CSE")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertIn("fivePlusCount", data)
        self.assertIn("tenPlusCount", data)
        self.assertIn("twentyPlusCount", data)
        self.assertGreaterEqual(data["fivePlusCount"], 1)
        self.assertGreaterEqual(data["tenPlusCount"], 1)
        self.assertGreaterEqual(data["twentyPlusCount"], 1)

    def test_university_results_commit_updates_arrear_ledger(self):
        """Test that committing supplementary pass results clears active arrears."""
        # Student s03 (710022104003) has active arrear in MA3354
        # Verify active before
        st_before = db.get_student_by_reg_no("710022104003")
        active_before = [a for a in st_before["arrears"] if a["subjectCode"] == "MA3354" and a["status"] == "ACTIVE"]
        self.assertEqual(len(active_before), 1)

        # Commit a supplementary pass record
        commit_payload = {
            "records": [
                {
                    "regNo": "710022104003",
                    "name": "Deepak Kumar",
                    "subjectCode": "MA3354",
                    "subjectName": "Discrete Mathematics",
                    "grade": "B",
                    "credits": 4,
                    "result": "PASS",
                    "semester": 2,
                    "examSession": "Apr/May 2025"
                }
            ]
        }
        res = self.client.post("/api/university-results/commit", json=commit_payload)
        self.assertEqual(res.status_code, 200)

        # Verify arrear is now CLEARED
        st_after = db.get_student_by_reg_no("710022104003")
        active_after = [a for a in st_after["arrears"] if a["subjectCode"] == "MA3354" and a["status"] == "ACTIVE"]
        cleared_after = [a for a in st_after["arrears"] if a["subjectCode"] == "MA3354" and a["status"] == "CLEARED"]
        self.assertEqual(len(active_after), 0, "Arrear should no longer be ACTIVE after PASS commit")
        self.assertEqual(len(cleared_after), 1, "Arrear should now be CLEARED")
        self.assertEqual(cleared_after[0]["clearedInSession"], "Apr/May 2025")


if __name__ == "__main__":
    unittest.main()
