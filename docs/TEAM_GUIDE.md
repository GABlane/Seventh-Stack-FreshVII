# FRESHVII Team Guide

## Working Agreement

Work in small, reviewable changes. Each pull request should have one clear outcome, include screenshots for UI changes, and state the validation commands that were run.

## Ownership Areas

### Frontend and Design System

Owns pages, reusable components, Tailwind tokens, shadcn composition, responsive behavior, accessibility, and loading or error states. Components should receive typed props and remain independent of Firebase details.

### Domain and Data

Owns TypeScript models, freshness calculation, rescue scoring, recipe matching, lifecycle transitions, repositories, and event recording. Domain logic should be testable without React or Firebase.

### Firebase and Security

Owns authentication flow, Firestore schema, rules, indexes, environment setup, transactions, and optional Storage or Cloud Functions. Any rules change requires an explicit security review.

### Quality and Integration

Owns test coverage, mobile and desktop verification, real-time multi-session checks, offline recovery checks, and release validation.

## Branch and Commit Conventions

- Branch names: `feature/<short-name>`, `fix/<short-name>`, or `docs/<short-name>`.
- Commits should describe the user-visible or technical outcome, such as `feat: add partial consumption flow`.
- Keep unrelated formatting or dependency updates out of feature branches.
- Rebase or update from the shared branch before requesting review when practical.

## Pull Request Checklist

- [ ] The change maps to an item in `TASKS.md`.
- [ ] Types and validation cover the new behavior.
- [ ] Loading, empty, error, and permission states are considered.
- [ ] Firestore writes preserve event history where relevant.
- [ ] Mobile and desktop layouts were checked.
- [ ] Keyboard and screen-reader behavior were checked for interactive UI.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Screenshots or a short behavior recording are attached for UI work.

## Collaboration Boundaries

- Do not call Firebase directly from shared presentational components.
- Do not duplicate freshness rules in page components.
- Do not change the Firestore shape without updating `BLUEPRINT.md`, repository types, and security rules.
- Do not add a new UI primitive when an existing shadcn component covers the need.
- Do not store secrets in source control or client-side code.

## Definition of Done

A task is done when its acceptance behavior works against the mock repository and Firebase repository, the relevant tests or checks pass, the UI handles failure states, and the documentation reflects any changed contract.

## Decision Log Practice

For decisions that affect the data model, freshness policy, recipe source, or authentication behavior, record the decision in the pull request description. Include the problem, chosen approach, alternatives considered, and migration impact.