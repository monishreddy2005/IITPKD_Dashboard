"""
Generate dummy data for the Course table.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import DEFAULT_DEPARTMENT_CODES, generate_courses
from utils import ensure_parent_dir, parse_comma_separated, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy Course data.")
    parser.add_argument(
        "--count",
        type=int,
        default=50,
        help="Number of course records to generate (default: 50).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("Course.csv"),
        help="Output CSV path (default: Course.csv).",
    )
    parser.add_argument(
        "--departments",
        type=str,
        default=",".join(DEFAULT_DEPARTMENT_CODES),
        help="Comma separated list of department codes to sample from.",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    dept_codes = parse_comma_separated(args.departments)
    if not dept_codes:
        dept_codes = DEFAULT_DEPARTMENT_CODES

    output_path = ensure_parent_dir(Path(args.output))
    with output_path.open("w", encoding="utf-8") as outfile:
        generate_courses(outfile, args.count, dept_codes)

    save_and_report(output_path, "✓ Generated Course data")


if __name__ == "__main__":
    main()

