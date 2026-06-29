# Commit Message Convention

This project uses a consistent commit message format to keep history readable and intentional.

### Format

`keyword`: short, clear description in the present tense

---

## Keywords

`feat`: add a new feature or capability

`fix`: fix a bug or incorrect behaviour

`refactor`: change code structure without changing behaviour

`perf`: improve performance

`format`: formatting changes, whitespace, linting, no logic changes

`test`: add or modify tests

`docs`: documentation only changes

`chore`: maintenance tasks, tooling, config, dependencies

`ci`: CI/CD configuration or scripts

---

## Examples

```
feat: add match schedule endpoint
fix: correct standings tiebreaker for equal goal difference
test: add integration tests for cache middleware
ci: add SonarCloud step to GitHub Actions workflow
chore: update FastAPI to 0.111.0
```

---

## Merging to Main

Squash-and-merge is used when merging any pull request into `main`. All commits on the feature branch are collapsed into a single commit. The squash commit message must follow the format above and accurately describe the full change being merged.

Regular merge commits are used for any merges between non-main branches if applicable.

Reference for keywords: https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13
