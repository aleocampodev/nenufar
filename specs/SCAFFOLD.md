# SDD Scaffold — Spec Kit Workflow

Specifications are the primary source of truth. This scaffold follows the GitHub Spec Kit convention (CLI `specify` installed). Each phase below maps to a slash command and produces a concrete artifact.

## 1. Constitution — project guardrails

Non-negotiable rules that every agent must follow. Read before every task to prevent architectural drift.

- **Tech Stack**: Language, frameworks, and tools.
- **Constraints & Architecture**: Mandatory patterns (e.g., no synchronous DB queries, business logic only in server layers).
- **Testing Requirements**: Coverage minimums and required test frameworks.

> Command: `/speckit.constitution`
> Artifact: `.specify/memory/constitution.md`

---

## 2. Intent — vision & scope (seed, tech-agnostic)

The raw vision that feeds the spec. Answers *what* and *why* — never *how*. No tech stack here.

- **User Problem**: What core issue are we solving?
- **Target Audience**: Who is the end-user?
- **Scope & In-Scope**: The specific features and boundaries of the deliverable.
- **Non-Goals**: What will not be done in this iteration to prevent scope creep.

> This document seeds `/speckit.specify`.
> Artifact: `specs/intent.md`

---

## 3. Specification — behavioral description

The formal spec. A highly detailed spec ensures anyone (or any agent) builds the exact same thing independently.

- **Vision / Scope / Goals**: formalized from the intent.
- **User Journeys / Behaviors**: user stories in EARS or Gherkin notation.
- **Data Contracts & Schemas**: inputs, outputs, DB tables, API endpoints, payload models.
- **Edge Cases & Error Handling**: timeouts, invalid inputs, constraints.
- **Acceptance Criteria**: concrete, testable pass/fail conditions (the Review & Acceptance Checklist lives here).

> Command: `/speckit.specify`
> Artifact: `specs/<feature>/spec.md`

---

## 4. Clarify — close underspecified gaps (recommended)

Sequential, coverage-based questioning that records answers in a Clarifications section of the spec. Run before planning to reduce downstream rework.

> Command: `/speckit.clarify`
> Artifact: appended to `specs/<feature>/spec.md`

---

## 5. Plan — technical implementation strategy

Translates the spec into a chronological strategy with the chosen tech stack. This is where the *how* is decided, constrained by the Constitution.

- **Phase Breakdown**: step-by-step roadmap (infra, backend, frontend, deployment).
- **Architecture & File Structure**: modules, layers, boundaries.
- **Data Model**: tables, relations, indexes.
- **Contracts**: API specs, payload schemas.
- **Research**: version pins and notes for rapidly-changing libraries.

> Command: `/speckit.plan`
> Artifacts: `specs/<feature>/plan.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`

---

## 6. Tasks — atomic actionable breakdown

Converts the plan into a tracked task list.

- **Per-user-story phases**: each user story becomes an implementation phase.
- **Dependencies**: ordered (models before services, services before endpoints).
- **Parallel markers**: tasks that can run in parallel are tagged `[P]`.
- **File paths**: each task names the exact file it touches.
- **TDD structure**: test tasks ordered before implementation.

> Command: `/speckit.tasks`
> Artifact: `specs/<feature>/tasks.md`

---

## 7. Analyze — cross-artifact consistency (recommended)

Validates that spec, plan, tasks, and contracts are mutually consistent and that every acceptance criterion is covered by a task. Run after tasks, before implementation.

> Command: `/speckit.analyze`

---

## 8. Implement — execute the plan

Iterates through `tasks.md` in order. In strict mode: write test (Red) → write code (Green) → refactor, before moving to the next task.

> Command: `/speckit.implement`

---

## 9. Checklist — quality gates

Custom checklists that validate requirement completeness, clarity, and consistency. "Unit tests for English."

> Command: `/speckit.checklist`

---

## Reference

- Spec Kit: https://github.com/github/spec-kit
- Guide: https://linuxera.org/spec-driven-development-with-spec-kit/