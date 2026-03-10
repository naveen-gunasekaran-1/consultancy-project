#!/usr/bin/env python3
"""Simple video compressor using ffmpeg.

Examples:
  python COMPRESS.py --input "/path/to/video.mp4"
  python COMPRESS.py --input "/path/to/folder" --recursive --crf 30 --max-width 1280
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


VIDEO_EXTENSIONS = {
	".mp4",
	".mov",
	".mkv",
	".avi",
	".wmv",
	".flv",
	".webm",
	".m4v",
}


def parse_args() -> argparse.Namespace:
	parser = argparse.ArgumentParser(description="Compress videos with ffmpeg.")
	parser.add_argument(
		"--input",
		required=True,
		help="Path to a video file or a folder containing videos.",
	)
	parser.add_argument(
		"--output-dir",
		default=None,
		help="Directory for compressed videos. Defaults next to input files.",
	)
	parser.add_argument(
		"--suffix",
		default="_compressed",
		help="Suffix added to output filename before extension.",
	)
	parser.add_argument(
		"--crf",
		type=int,
		default=28,
		help="Constant Rate Factor (lower is better quality, larger files). Typical: 23-30.",
	)
	parser.add_argument(
		"--preset",
		default="medium",
		choices=[
			"ultrafast",
			"superfast",
			"veryfast",
			"faster",
			"fast",
			"medium",
			"slow",
			"slower",
			"veryslow",
		],
		help="Encoding speed/compression tradeoff.",
	)
	parser.add_argument(
		"--max-width",
		type=int,
		default=None,
		help="Optional max output width. Keeps aspect ratio and avoids upscaling.",
	)
	parser.add_argument(
		"--audio-bitrate",
		default="128k",
		help="Audio bitrate (example: 96k, 128k, 192k).",
	)
	parser.add_argument(
		"--recursive",
		action="store_true",
		help="Scan folders recursively.",
	)
	parser.add_argument(
		"--overwrite",
		action="store_true",
		help="Overwrite output files if they exist.",
	)
	return parser.parse_args()


def ensure_ffmpeg_installed() -> None:
	if shutil.which("ffmpeg") is None:
		print("Error: ffmpeg is not installed or not in PATH.", file=sys.stderr)
		print("Install on macOS: brew install ffmpeg", file=sys.stderr)
		sys.exit(1)


def is_video_file(path: Path) -> bool:
	return path.is_file() and path.suffix.lower() in VIDEO_EXTENSIONS


def gather_video_files(input_path: Path, recursive: bool) -> list[Path]:
	if input_path.is_file():
		return [input_path] if is_video_file(input_path) else []

	if not input_path.is_dir():
		return []

	pattern = "**/*" if recursive else "*"
	return [p for p in input_path.glob(pattern) if is_video_file(p)]


def output_path_for(source: Path, output_dir: Path | None, suffix: str) -> Path:
	out_name = f"{source.stem}{suffix}.mp4"
	if output_dir is None:
		return source.with_name(out_name)
	return output_dir / out_name


def build_ffmpeg_command(
	source: Path,
	destination: Path,
	crf: int,
	preset: str,
	max_width: int | None,
	audio_bitrate: str,
	overwrite: bool,
) -> list[str]:
	cmd = [
		"ffmpeg",
		"-hide_banner",
		"-loglevel",
		"error",
		"-stats",
		"-y" if overwrite else "-n",
		"-i",
		str(source),
		"-c:v",
		"libx264",
		"-preset",
		preset,
		"-crf",
		str(crf),
	]

	if max_width is not None:
		# Keep aspect ratio and avoid upscaling when source is smaller than max_width.
		scale_filter = f"scale='min({max_width},iw)':-2"
		cmd.extend(["-vf", scale_filter])

	cmd.extend(
		[
			"-c:a",
			"aac",
			"-b:a",
			audio_bitrate,
			"-movflags",
			"+faststart",
			str(destination),
		]
	)

	return cmd


def compress_video(
	source: Path,
	destination: Path,
	crf: int,
	preset: str,
	max_width: int | None,
	audio_bitrate: str,
	overwrite: bool,
) -> bool:
	destination.parent.mkdir(parents=True, exist_ok=True)
	cmd = build_ffmpeg_command(
		source=source,
		destination=destination,
		crf=crf,
		preset=preset,
		max_width=max_width,
		audio_bitrate=audio_bitrate,
		overwrite=overwrite,
	)
	result = subprocess.run(cmd, check=False)
	return result.returncode == 0


def main() -> int:
	args = parse_args()
	ensure_ffmpeg_installed()

	input_path = Path(args.input).expanduser().resolve()
	output_dir = Path(args.output_dir).expanduser().resolve() if args.output_dir else None

	videos = gather_video_files(input_path, args.recursive)
	if not videos:
		print("No supported video files found.", file=sys.stderr)
		return 1

	print(f"Found {len(videos)} video(s). Starting compression...")
	success = 0

	for source in videos:
		destination = output_path_for(source, output_dir, args.suffix)
		print(f"\nCompressing: {source}")
		print(f"Output:      {destination}")
		ok = compress_video(
			source=source,
			destination=destination,
			crf=args.crf,
			preset=args.preset,
			max_width=args.max_width,
			audio_bitrate=args.audio_bitrate,
			overwrite=args.overwrite,
		)
		if ok:
			success += 1
			print("Status:      OK")
		else:
			print("Status:      FAILED", file=sys.stderr)

	failed = len(videos) - success
	print(f"\nDone. Success: {success}, Failed: {failed}")
	return 0 if failed == 0 else 2


if __name__ == "__main__":
	raise SystemExit(main())

