"""
Generate dummy data for the Designation table.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import generate_designations
from utils import ensure_parent_dir, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy Designation data.")
    parser.add_argument(
        "--count",
        type=int,
        default=10,
        help="Number of designation records to generate (default: 10).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("designation.csv"),
        help="Output CSV path (default: designation.csv).",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    output_path = ensure_parent_dir(Path(args.output))
    with output_path.open("w", encoding="utf-8") as outfile:
        generate_designations(outfile, args.count)

    save_and_report(output_path, "✓ Generated Designation data")


if __name__ == "__main__":
    main()

