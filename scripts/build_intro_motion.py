"""Compatibility authoring entry point for continuous vector review samples."""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[1]
subprocess.run(['node',str(ROOT/'scripts'/'build_intro_motion.cjs')],cwd=ROOT,check=True)
