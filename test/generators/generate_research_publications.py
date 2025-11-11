"""
Generate dummy data for the research_publications table.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import DEFAULT_EMPLOYEE_DEPARTMENTS, generate_research_publications
from utils import ensure_parent_dir, parse_comma_separated, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy research publication data.")
    parser.add_argument(
        "--start-year",
        type=int,
        default=2018,
        help="Starting publication year (default: 2018).",
    )
    parser.add_argument(
        "--years",
        type=int,
        default=6,
        help="Number of publication years to include (default: 6).",
    )
    parser.add_argument(
        "--per-year",
        type=int,
        default=40,
        help="Number of publications per year (default: 40).",
    )
    parser.add_argument(
        "--departments",
        type=str,
        help="Comma separated list of departments to sample from. Defaults to configured departments.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("research_publications.csv"),
        help="Output CSV path (default: research_publications.csv).",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    departments = (
        parse_comma_separated(args.departments)
        if args.departments
        else DEFAULT_EMPLOYEE_DEPARTMENTS
    )
    publication_years = [args.start_year + offset for offset in range(max(args.years, 0))]

    output_path = ensure_parent_dir(Path(args.output))
    with output_path.open("w", encoding="utf-8") as outfile:
        generate_research_publications(
            outfile,
            publication_years,
            departments,
            publications_per_year=args.per_year,
        )

    save_and_report(output_path, "✓ Generated research_publications data")


if __name__ == "__main__":
    main()


