"""
Generate dummy data for the Department table.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import generate_departments
from utils import ensure_parent_dir, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy Department data.")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("Department.csv"),
        help="Output CSV path (default: Department.csv).",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    output_path = ensure_parent_dir(Path(args.output))
    with output_path.open("w", encoding="utf-8") as outfile:
        generate_departments(outfile)

    save_and_report(output_path, "✓ Generated Department data")


if __name__ == "__main__":
    main()

