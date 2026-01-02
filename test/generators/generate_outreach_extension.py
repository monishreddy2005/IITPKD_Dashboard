"""
Generate dummy data for the Outreach and Extension module:
- Open House events
- NPTEL local chapters, courses, and enrollments
- UBA projects and events
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import (
    generate_open_house,
    generate_nptel_local_chapters,
    generate_nptel_courses,
    generate_nptel_enrollments,
    generate_uba_projects,
    generate_uba_events
)
from utils import ensure_parent_dir, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy Outreach and Extension data.")
    parser.add_argument(
        "--start-year",
        type=int,
        default=2019,
        help="Starting year for events (default: 2019).",
    )
    parser.add_argument(
        "--years",
        type=int,
        default=5,
        help="Number of years to generate data for (default: 5).",
    )
    parser.add_argument(
        "--open-house-per-year",
        type=int,
        default=2,
        help="Number of Open House events per year (default: 2).",
    )
    parser.add_argument(
        "--nptel-chapters",
        type=int,
        default=3,
        help="Number of NPTEL local chapters (default: 3).",
    )
    parser.add_argument(
        "--nptel-courses-per-year",
        type=int,
        default=15,
        help="Number of NPTEL courses per year (default: 15).",
    )
    parser.add_argument(
        "--nptel-enrollments-per-course",
        type=int,
        default=20,
        help="Number of enrollments per course (default: 20).",
    )
    parser.add_argument(
        "--uba-projects",
        type=int,
        default=10,
        help="Number of UBA projects (default: 10).",
    )
    parser.add_argument(
        "--uba-events-per-project",
        type=int,
        default=3,
        help="Number of events per UBA project (default: 3).",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("."),
        help="Output directory for CSV files (default: current directory).",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    years = [args.start_year + offset for offset in range(max(args.years, 0))]
    output_dir = ensure_parent_dir(args.output_dir)

    # Generate Open House events
    open_house_path = output_dir / "open_house.csv"
    with open_house_path.open("w", encoding="utf-8") as outfile:
        generate_open_house(outfile, years, events_per_year=args.open_house_per_year)
    save_and_report(open_house_path, "✓ Generated Open House data")

    # Generate NPTEL local chapters
    nptel_chapters_path = output_dir / "nptel_local_chapters.csv"
    with nptel_chapters_path.open("w", encoding="utf-8") as outfile:
        generate_nptel_local_chapters(outfile, count=args.nptel_chapters)
    save_and_report(nptel_chapters_path, "✓ Generated NPTEL local chapters")

    # Generate NPTEL courses
    nptel_courses_path = output_dir / "nptel_courses.csv"
    with nptel_courses_path.open("w", encoding="utf-8") as outfile:
        generate_nptel_courses(outfile, years, courses_per_year=args.nptel_courses_per_year)
    save_and_report(nptel_courses_path, "✓ Generated NPTEL courses")

    # Generate NPTEL enrollments
    # First, we need to know how many courses were generated
    # Assuming course_ids start from 1 and are sequential
    num_courses = len(years) * args.nptel_courses_per_year
    course_ids = list(range(1, num_courses + 1))
    
    nptel_enrollments_path = output_dir / "nptel_enrollments.csv"
    with nptel_enrollments_path.open("w", encoding="utf-8") as outfile:
        generate_nptel_enrollments(outfile, course_ids, enrollments_per_course=args.nptel_enrollments_per_course)
    save_and_report(nptel_enrollments_path, "✓ Generated NPTEL enrollments")

    # Generate UBA projects
    uba_projects_path = output_dir / "uba_projects.csv"
    with uba_projects_path.open("w", encoding="utf-8") as outfile:
        generate_uba_projects(outfile, count=args.uba_projects)
    save_and_report(uba_projects_path, "✓ Generated UBA projects")

    # Generate UBA events
    project_ids = list(range(1, args.uba_projects + 1))
    uba_events_path = output_dir / "uba_events.csv"
    with uba_events_path.open("w", encoding="utf-8") as outfile:
        generate_uba_events(outfile, project_ids, events_per_project=args.uba_events_per_project)
    save_and_report(uba_events_path, "✓ Generated UBA events")

    print("\n✓ All Outreach and Extension data generated successfully!")


if __name__ == "__main__":
    main()

