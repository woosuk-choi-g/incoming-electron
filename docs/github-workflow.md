# GitHub workflow

This repository uses pull requests as the review and integration boundary.

## Codex setup

Codex needs both repository write access and a way to create pull requests.
Choose one of these supported paths:

1. Connect this repository in Codex cloud and grant the Codex GitHub app access.
   This enables pull request tasks and `@codex review` after code review is
   enabled for the repository in Codex settings.
2. For local Codex work, install and authenticate GitHub CLI, then verify that
   `gh auth status`, `git push`, and `gh pr create` work from the repository.

Do not store a personal access token in this repository or in a tracked `.env`
file. Prefer the GitHub app, Git Credential Manager, or GitHub CLI's credential
store.

## Pull request checks

The `CI` workflow runs type checking, linting, and unit tests. Electron E2E and
application packaging are intentionally excluded.

The `CodeQL` workflow scans JavaScript and TypeScript changes on pull requests,
pushes to `main`, and a weekly schedule.

Dependabot checks npm packages and GitHub Actions every Monday at 09:00 in the
Asia/Seoul time zone. Minor and patch npm updates are grouped by production or
development dependency type; major npm updates remain separate for deliberate
review. GitHub Actions updates are grouped into one pull request.

## Repository security settings

Because secret scanning and push protection are GitHub repository settings,
an administrator must enable them after these files are merged:

1. Open **Settings > Security and analysis** for the repository.
2. Enable **Secret scanning**.
3. Enable **Push protection**.
4. Confirm CodeQL results appear under **Security > Code scanning** after the
   workflow's first successful run.

For `main`, require the `validate` and `Analyze JavaScript and TypeScript`
checks before merging. Keep force pushes and branch deletion disabled.
