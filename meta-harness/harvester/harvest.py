#!/usr/bin/env python3
import argparse
import json
import sys
from datetime import date
from pathlib import Path

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE))

from masker import mask_entry
from poller import poll_new_entries

_DEFAULT_CURSOR = _HERE / 'cursor.json'
_DEFAULT_HARVESTED = _HERE.parent / 'harvested'


def harvest(
    cursor_path: Path = _DEFAULT_CURSOR,
    harvested_dir: Path = _DEFAULT_HARVESTED,
    dry_run: bool = False,
) -> int:
    entries = poll_new_entries(cursor_path)
    masked = [mask_entry(e) for e in entries]

    if not masked:
        print('No new entries.')
        return 0

    if dry_run:
        for entry in masked:
            print(json.dumps(entry, ensure_ascii=False))
        print(f'\n[dry-run] Would save {len(masked)} entries.')
        return len(masked)

    harvested_dir.mkdir(parents=True, exist_ok=True)
    output_path = harvested_dir / f'{date.today().isoformat()}.jsonl'
    with output_path.open('a', encoding='utf-8') as f:
        for entry in masked:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')

    print(f'Harvested {len(masked)} entries → {output_path}')
    return len(masked)


def main() -> None:
    parser = argparse.ArgumentParser(description='Harvest Claude Code logs')
    parser.add_argument('--dry-run', action='store_true', help='Print without saving')
    args = parser.parse_args()
    harvest(dry_run=args.dry_run)


if __name__ == '__main__':
    main()
