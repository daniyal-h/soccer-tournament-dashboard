# Branching Convention

This project uses trunk-based development. `main` is always production. Feature branches are short-lived, focused on a single subtask, and merged to `main` via pull request once CI passes.

---

## Branch Naming

### Format

`keyword`/`issue-number`-`short-description`

Branch names must be lowercase with no spaces. The `keyword` is always followed by a forward slash. A forward slash must always be followed by the corresponding issue number. Words in the description are separated by dashes.

### Examples

```
subtask/41-match-card-component
fix/60-standings-tiebreaker
refactor/55-cache-middleware
chore/12-sonarcloud-setup
```

---

## Keywords

`feat`: finalizes a complete feature once all corresponding subtasks are merged

`subtask`: implements a single subtask of a feature, the most common branch type

`fix`: fixes existing incorrect behaviour without introducing new features

`refactor`: improves or reorganizes code without changing functionality

`chore`: maintenance tasks such as dependency updates, config changes, or tooling

Other keywords include those mentioned in [Commit Convention](commit-convention.md).

---

## Workflow

All development happens on short-lived branches off `main`.

```
main -> keyword/issue-short-description -> PR -> CI passes -> squash-and-merge into main
```

Each subtask branch addresses exactly one GitHub issue. Once merged, the branch is deleted. There is no permanent development branch. `main` is the single source of truth at all times.

---

## Merging to Main

Squash-and-merge is used for all pull requests into `main`. This collapses the branch's commits into one clean commit on main, keeping the changelog readable. The squash commit message must follow the commit convention format.

Branch protection on `main` is enforced: direct pushes are not allowed and all CI checks must pass before merging.
