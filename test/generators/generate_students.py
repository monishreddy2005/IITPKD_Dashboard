"""
Generate dummy data for the Student table.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import generate_students
from utils import ensure_parent_dir, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy Student data.")
    parser.add_argument(
        "--count",
        type=int,
        default=100,
        help="Number of student records to generate (default: 100).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("Student.csv"),
        help="Output CSV path (default: Student.csv).",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    output_path = ensure_parent_dir(Path(args.output))
    with output_path.open("w", encoding="utf-8") as outfile:
        generate_students(outfile, args.count)

    save_and_report(output_path, "✓ Generated Student data")


if __name__ == "__main__":
    main()

