"""
Generate dummy data for Industry Connect tables (industry_events and industry_conclave).
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import generate_industry_events, generate_industry_conclave
from utils import ensure_parent_dir, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy industry connect data.")
    parser.add_argument(
        "--start-year",
        type=int,
        default=2018,
        help="Starting year for events and conclaves (default: 2018).",
    )
    parser.add_argument(
        "--years",
        type=int,
        default=6,
        help="Number of yearly records to create (default: 6).",
    )
    parser.add_argument(
        "--events-per-year",
        type=int,
        default=20,
        help="Number of industry events to generate per year (default: 20).",
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

    # Generate industry events
    events_path = ensure_parent_dir(output_dir / 'industry_events.csv')
    with events_path.open('w', encoding='utf-8') as outfile:
        generate_industry_events(outfile, years, events_per_year=args.events_per_year)
    save_and_report(events_path, '✓ Generated industry_events.csv')

    # Generate industry conclave (one per year)
    conclave_path = ensure_parent_dir(output_dir / 'industry_conclave.csv')
    with conclave_path.open('w', encoding='utf-8') as outfile:
        generate_industry_conclave(outfile, years)
    save_and_report(conclave_path, '✓ Generated industry_conclave.csv')


if __name__ == "__main__":
    main()

