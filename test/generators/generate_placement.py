"""Generate dummy placement datasets (summary, companies, packages)."""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import (
    generate_placement_summary,
    generate_placement_companies,
    generate_placement_packages,
    PROGRAMS,
    GENDERS,
)
from utils import ensure_parent_dir, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy placement statistics data.")
    parser.add_argument(
        "--start-year",
        type=int,
        default=2019,
        help="Starting year for placement records (default: 2019).",
    )
    parser.add_argument(
        "--years",
        type=int,
        default=5,
        help="Number of yearly placement records to generate (default: 5).",
    )
    parser.add_argument(
        "--companies-per-year",
        type=int,
        default=12,
        help="Number of recruiting companies per year (default: 12).",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path('.'),
        help="Directory in which the CSV files will be written (default: current directory).",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    years = [args.start_year + offset for offset in range(max(args.years, 0))]
    output_dir = ensure_parent_dir(Path(args.output_dir))

    if not years:
        raise SystemExit("Number of years must be greater than zero.")

    summary_path = ensure_parent_dir(output_dir / 'placement_summary.csv')
    with summary_path.open('w', encoding='utf-8') as outfile:
        generate_placement_summary(outfile, years, programs=PROGRAMS, genders=GENDERS)
    save_and_report(summary_path, '✓ Generated placement_summary.csv')

    companies_path = ensure_parent_dir(output_dir / 'placement_companies.csv')
    with companies_path.open('w', encoding='utf-8') as outfile:
        generate_placement_companies(outfile, years, companies_per_year=args.companies_per_year)
    save_and_report(companies_path, '✓ Generated placement_companies.csv')

    packages_path = ensure_parent_dir(output_dir / 'placement_packages.csv')
    with packages_path.open('w', encoding='utf-8') as outfile:
        generate_placement_packages(outfile, years, programs=PROGRAMS)
    save_and_report(packages_path, '✓ Generated placement_packages.csv')


if __name__ == "__main__":
    main()
