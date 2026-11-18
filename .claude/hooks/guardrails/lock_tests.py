#!/usr/bin/env python3
"""PreToolUse guard: while .claude/locked-tests exists, block writes to the
test files it lists (one path per line, "#" comments allowed). Used by the
bug-fix mode of /10x-tdd: the failing repro test must not change.

A PostToolUse call (registered by older versions of the installer) exits 0
without doing anything."""

import os
import sys

# No __pycache__/ next to the hook, also when it runs without -B.
sys.dont_write_bytecode = True
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import guardlib  # noqa: E402
except BaseException as exc:  # exit 1 would let the action through
    print("[guardrails] BLOCKED (guardrails-error)\n"
          f"Cannot load guardlib.py next to this hook: {type(exc).__name__}: {exc}\n"
          "Re-run the guardrails installer. Nothing was changed.", file=sys.stderr)
    sys.exit(2)

HOW_TO_ALLOW = (
    "Bug-fix mode: this test reproduces the bug and must not change. Fix the "
    "production code instead. If you think the test itself is wrong, stop and "
    "tell the user; do not remove the lock to edit it."
)


def locked_paths(pdir):
    locked = []
    for line in guardlib.read_locked_lines(pdir):
        locked += guardlib.rel_candidates(guardlib.absolute(line, pdir), pdir)
    return locked


def check(data, pdir):
    if data.get("hook_event_name") == "PostToolUse":
        return  # nothing to do after a tool ran
    locked = locked_paths(pdir)
    shell = data["tool_name"] == "Bash"
    targets = guardlib.tool_targets(data, pdir)
    for target, kind in targets:
        for rel in guardlib.rel_candidates(target, pdir, shell):
            for test in locked:
                if rel.casefold() == test.casefold() or (kind == "write" and guardlib.contains(rel, test)):
                    guardlib.block(
                        f"locked-test: {test}",
                        f"Target: {rel}\n{test} is listed in {guardlib.LOCKED_TESTS_REL}.",
                        HOW_TO_ALLOW,
                    )


if __name__ == "__main__":
    guardlib.run_guard(check)
