"""Verify and publish a reviewed hub commit through the existing Vercel integration."""
import argparse
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent.parent


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, encoding='utf-8').strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--commit', required=True)
    args = parser.parse_args()
    if git('branch', '--show-current') != 'main':
        raise SystemExit('Unexpected release branch')
    if git('remote', 'get-url', '--push', 'origin') != 'https://github.com/jamescockburn47/steadgames.git':
        raise SystemExit('Unexpected release remote')
    if git('rev-parse', 'HEAD') != args.commit or git('status', '--porcelain', '--untracked-files=no'):
        raise SystemExit('Release requires the reviewed, clean HEAD')
    tracked = set(git('ls-tree', '-r', '--name-only', 'HEAD').splitlines())
    inputs = [ROOT / name for name in ('index.html', 'package.json', 'vercel.json', 'AGENTS.md')]
    inputs += [*ROOT.glob('src/*.js'), *ROOT.glob('scripts/*'), *ROOT.glob('shots/*')]
    missing = [p.relative_to(ROOT).as_posix() for p in inputs if p.is_file() and p.relative_to(ROOT).as_posix() not in tracked]
    if missing:
        raise SystemExit('Uncommitted release inputs: ' + ', '.join(missing))
    subprocess.run(['node', 'scripts/verify-hub.mjs'], cwd=ROOT, check=True)
    subprocess.run(['git', 'diff', '--check'], cwd=ROOT, check=True)
    subprocess.run(['git', 'push', 'origin', 'main'], cwd=ROOT, check=True)
    print('Verify Vercel status, live content and the Havenstead visitor journey.')


if __name__ == '__main__':
    main()
