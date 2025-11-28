"""Generate dummy data for academic program launches."""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import generate_academic_program_launch
from utils import ensure_parent_dir, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy academic program launch data.")
    parser.add_argument(
        "--start-year",
        type=int,
        default=2018,
        help="Starting launch year (default: 2018).",
    )
    parser.add_argument(
        "--years",
        type=int,
        default=6,
        help="Number of yearly records to create (default: 6).",
    )
    parser.add_argument(
        "--programs-per-year",
        type=int,
        default=6,
        help="Number of programs introduced per year (default: 6).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("academic_program_launch.csv"),
        help="Output CSV path (default: academic_program_launch.csv).",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    years = [args.start_year + offset for offset in range(max(args.years, 0))]
    output_path = ensure_parent_dir(Path(args.output))

    with output_path.open('w', encoding='utf-8') as outfile:
        generate_academic_program_launch(outfile, years, programs_per_year=args.programs_per_year)

    save_and_report(output_path, '✓ Generated academic_program_launch.csv')


if __name__ == "__main__":
    main()
