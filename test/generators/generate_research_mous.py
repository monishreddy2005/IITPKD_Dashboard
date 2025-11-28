"""
Generate dummy data for the research_mous table.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import generate_research_mous
from utils import ensure_parent_dir, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy research MoU data.")
    parser.add_argument(
        "--count",
        type=int,
        default=25,
        help="Number of MoU records to generate (default: 25).",
    )
    parser.add_argument(
        "--start-year",
        type=int,
        default=2016,
        help="Earliest year to consider for MoUs (default: 2016).",
    )
    parser.add_argument(
        "--end-year",
        type=int,
        default=None,
        help="Latest year to consider for MoUs (default: current year).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("research_mous.csv"),
        help="Output CSV path (default: research_mous.csv).",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    output_path = ensure_parent_dir(Path(args.output))
    with output_path.open("w", encoding="utf-8") as outfile:
        generate_research_mous(
            outfile,
            args.count,
            start_year=args.start_year,
            end_year=args.end_year,
        )

    save_and_report(output_path, "✓ Generated research_mous data")


if __name__ == "__main__":
    main()


