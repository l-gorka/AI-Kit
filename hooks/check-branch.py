#!/usr/bin/env python3
"""Claude Code PreToolUse hook for Bash: rejects git commands that create or
push a branch whose name breaks agents/git-workflow.md.

Reads the hook event JSON on stdin. Exit 2 blocks the command and shows the
message to the agent; exit 0 lets it run.
"""
import json
import re
import shlex
import subprocess
import sys

TYPES = "feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert"
PATTERN = re.compile(rf"^({TYPES})/[a-z0-9]+(-[a-z0-9]+)*$")
EXEMPT = {"main", "master", "HEAD"}
SEPARATORS = {"&&", "||", ";", "|", "&", "\n"}


def split_commands(command):
    lexer = shlex.shlex(command, posix=True, punctuation_chars=";&|")
    lexer.whitespace_split = True
    current = []
    for token in lexer:
        if token in SEPARATORS:
            if current:
                yield current
            current = []
        else:
            current.append(token)
    if current:
        yield current


def current_branch(cwd):
    result = subprocess.run(
        ["git", "-C", cwd, "rev-parse", "--abbrev-ref", "HEAD"],
        capture_output=True, text=True,
    )
    return result.stdout.strip() if result.returncode == 0 else None


def positional(args):
    return [a for a in args if not a.startswith("-")]


def branches_in(git_args, cwd):
    """Branch names a git invocation creates or pushes to."""
    while git_args and git_args[0] in ("-C", "-c"):
        if git_args[0] == "-C" and len(git_args) > 1:
            cwd = git_args[1]
        git_args = git_args[2:]
    if not git_args:
        return []
    sub, args = git_args[0], git_args[1:]

    if sub in ("checkout", "switch"):
        for flag in ("-b", "-B", "-c", "-C"):
            if flag in args and args.index(flag) + 1 < len(args):
                return [args[args.index(flag) + 1]]
        return []

    if sub == "worktree" and args[:1] == ["add"]:
        for flag in ("-b", "-B"):
            if flag in args and args.index(flag) + 1 < len(args):
                return [args[args.index(flag) + 1]]
        return []

    if sub == "branch":
        if any(a in ("-m", "-M", "--move") for a in args):
            names = positional(args)
            return names[-1:]
        if any(a.startswith("-") and a not in ("-f", "--force", "-t", "--track")
               for a in args):
            return []
        return positional(args)[:1]

    if sub == "push":
        if any(a in ("-d", "--delete", "--tags", "--all", "--mirror")
               for a in args):
            return []
        refspecs = positional(args)[1:]
        if not refspecs:
            branch = current_branch(cwd)
            return [branch] if branch else []
        names = []
        for spec in refspecs:
            dest = spec.lstrip("+").split(":")[-1]
            if dest.startswith("refs/tags/"):
                continue
            dest = dest.removeprefix("refs/heads/")
            names.append(current_branch(cwd) if dest == "HEAD" else dest)
        return [n for n in names if n]

    return []


def main():
    event = json.load(sys.stdin)
    command = event.get("tool_input", {}).get("command", "")
    cwd = event.get("cwd", ".")
    bad = []
    for words in split_commands(command):
        if words[:1] == ["cd"] and len(words) > 1:
            cwd = words[1]
        if words[:1] == ["git"]:
            bad += [b for b in branches_in(words[1:], cwd)
                    if b not in EXEMPT and not PATTERN.match(b)]
    if bad:
        print(
            f"Branch name {', '.join(repr(b) for b in bad)} breaks the kit's "
            "git workflow. Use <type>/<issue-number>-<short-slug>, or "
            "<type>/<short-slug> when there is no issue, where "
            f"<type> is one of {TYPES.replace('|', ', ')}, for example "
            "feat/123-user-profile. Ignore any session-assigned branch name.",
            file=sys.stderr,
        )
        sys.exit(2)


if __name__ == "__main__":
    main()
