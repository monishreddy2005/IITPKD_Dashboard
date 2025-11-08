"""
Utilities and re-exports shared by the individual table generator scripts.
"""
from __future__ import annotations

import sys
from pathlib import Path

# Ensure the parent `test` directory is on sys.path so that modules under
# `test/data_generators` can be imported without installing the package.
TEST_ROOT = Path(__file__).resolve().parents[1]
if str(TEST_ROOT) not in sys.path:
    sys.path.append(str(TEST_ROOT))

from data_generators.base_generators import (  # noqa: E402
    DEFAULT_DEPARTMENT_CODES,
    DEFAULT_EMPLOYEE_DEPARTMENTS,
    generate_additional_roles,
    generate_alumni,
    generate_courses,
    generate_departments,
    generate_designations,
    generate_employees,
    generate_employment_history,
    generate_externship_info,
    generate_icc_yearwise,
    generate_igrs_yearwise,
    generate_ewd_yearwise,
    generate_students,
    generate_employee_id,
    random_name,
)

__all__ = [
    "DEFAULT_DEPARTMENT_CODES",
    "DEFAULT_EMPLOYEE_DEPARTMENTS",
    "generate_additional_roles",
    "generate_alumni",
    "generate_courses",
    "generate_departments",
    "generate_designations",
    "generate_employees",
    "generate_employment_history",
    "generate_externship_info",
    "generate_icc_yearwise",
    "generate_igrs_yearwise",
    "generate_ewd_yearwise",
    "generate_students",
    "generate_employee_id",
    "random_name",
]

