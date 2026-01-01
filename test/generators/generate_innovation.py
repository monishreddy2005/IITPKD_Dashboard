"""
Generate dummy data for Innovation and Entrepreneurship tables (startups and innovation_projects).
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import generate_startups, generate_innovation_projects
from utils import ensure_parent_dir, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy innovation and entrepreneurship data.")
    parser.add_argument(
        "--start-year",
        type=int,
        default=2018,
        help="Starting year for incubation records (default: 2018).",
    )
    parser.add_argument(
        "--years",
        type=int,
        default=6,
        help="Number of yearly records to create (default: 6).",
    )
    parser.add_argument(
        "--startups-per-year",
        type=int,
        default=15,
        help="Number of startups to generate per year (default: 15).",
    )
    parser.add_argument(
        "--projects-per-year",
        type=int,
        default=8,
        help="Number of innovation projects to generate per year (default: 8).",
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

    # Generate startups
    startups_path = ensure_parent_dir(output_dir / 'startups.csv')
    with startups_path.open('w', encoding='utf-8') as outfile:
        generate_startups(outfile, years, startups_per_year=args.startups_per_year)
    save_and_report(startups_path, '✓ Generated startups.csv')

    # Generate innovation projects
    projects_path = ensure_parent_dir(output_dir / 'innovation_projects.csv')
    with projects_path.open('w', encoding='utf-8') as outfile:
        generate_innovation_projects(outfile, years, projects_per_year=args.projects_per_year)
    save_and_report(projects_path, '✓ Generated innovation_projects.csv')


if __name__ == "__main__":
    main()

