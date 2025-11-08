"""
Generate dummy data for the IGRC year-wise table.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import generate_igrs_yearwise
from utils import ensure_parent_dir, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy IGRC year-wise data.")
    parser.add_argument(
        "--start-year",
        type=int,
        default=2019,
        help="Starting year for grievance records (default: 2019).",
    )
    parser.add_argument(
        "--years",
        type=int,
        default=5,
        help="Number of yearly records to create (default: 5).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("igrs_yearwise.csv"),
        help="Output CSV path (default: igrs_yearwise.csv).",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    years = [args.start_year + offset for offset in range(max(args.years, 0))]
    output_path = ensure_parent_dir(Path(args.output))

    with output_path.open("w", encoding="utf-8") as outfile:
        generate_igrs_yearwise(outfile, years)

    save_and_report(output_path, "✓ Generated IGRC year-wise data")


if __name__ == "__main__":
    main()

