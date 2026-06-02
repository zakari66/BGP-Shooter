<!--
SYNC IMPACT REPORT
==================
Version change: (none / template) → 1.0.0
Bump rationale: Initial ratification of the project constitution. All placeholder
tokens replaced with concrete, project-specific governance. MAJOR baseline (1.0.0).

Modified principles:
  - [PRINCIPLE_1] → I. Code Quality & Maintainability
  - [PRINCIPLE_2] → II. Testing Standards (NON-NEGOTIABLE)
  - [PRINCIPLE_3] → III. User Experience Consistency
  - [PRINCIPLE_4] → IV. Performance Requirements
  - [PRINCIPLE_5] (template slot) → removed; project defines 4 principles per user direction

Added sections:
  - Quality Gates (formerly [SECTION_2])
  - Technical Decision Governance (formerly [SECTION_3])

Removed sections:
  - None (template placeholder principle 5 consolidated into the four declared principles)

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md — "Constitution Check" gate references this file generically; compatible, no edit required
  - ✅ .specify/templates/spec-template.md — no constitution-specific mandatory sections introduced; compatible
  - ✅ .specify/templates/tasks-template.md — testing/performance task categories align with Principles II & IV; compatible
  - ✅ .specify/templates/checklist-template.md — compatible

Follow-up TODOs:
  - None. RATIFICATION_DATE set to first adoption date (2026-06-02).
-->

# BGP-Shooter Constitution

## Core Principles

### I. Code Quality & Maintainability

Code MUST be correct, readable, and maintainable before it is considered complete.

- Every change MUST match the style, naming, and idioms of the surrounding code; new
  modules MUST follow the project's established conventions.
- Public functions, exported types, and non-obvious logic MUST be documented with a
  stated purpose; comments explain *why*, not *what*.
- Functions and modules MUST have a single, clear responsibility. Cyclomatic complexity
  and duplication MUST be actively reduced, not deferred.
- No code merges with known compiler/linter errors, suppressed warnings without
  justification, dead code, or commented-out blocks.
- Every change MUST pass automated formatting and static analysis (linter) as a
  precondition for review.

**Rationale**: BGP-Shooter is long-lived; the dominant cost is reading and changing
existing code, not writing it. Consistency and clarity keep that cost bounded and make
defects visible during review rather than in production.

### II. Testing Standards (NON-NEGOTIABLE)

Tests are a non-negotiable gate, not an afterthought.

- Test-First is mandatory: tests are written and MUST fail before the implementing code
  is written (Red-Green-Refactor). Reviewers MUST be able to see the failing-then-passing
  progression in the change history.
- Every bug fix MUST add a regression test that fails without the fix.
- New behavior requires unit tests; cross-component behavior, contracts, and shared
  schemas require integration tests.
- The full test suite MUST pass on every change before merge. Flaky or skipped tests MUST
  be fixed or explicitly tracked with an owner and deadline — never silently ignored.
- Coverage MUST NOT decrease on a change; critical paths (input handling, scoring/state,
  network/protocol logic) MUST be covered.

**Rationale**: Tests are the executable specification of intended behavior. Writing them
first forces clear requirements, prevents regressions, and is the only sustainable way to
change a growing codebase with confidence.

### III. User Experience Consistency

The product MUST behave predictably and consistently across every surface a user touches.

- Interaction patterns, terminology, controls, and visual/output conventions MUST be
  consistent across the application; equivalent actions behave equivalently everywhere.
- Errors MUST be surfaced clearly and actionably: state what happened and what the user
  can do next. No silent failures.
- User-facing changes MUST preserve existing workflows unless a breaking change is
  explicitly approved and documented with a migration path.
- Accessibility and responsiveness to user input are first-class requirements, not
  enhancements.
- UX decisions MUST be validated against actual user-facing behavior, not just internal
  correctness.

**Rationale**: Consistency builds trust and lowers the learning curve. Predictable
behavior means users transfer knowledge across the product instead of relearning each
feature.

### IV. Performance Requirements

Performance is a designed-for requirement with measurable targets, not a hope.

- Every feature with meaningful runtime cost MUST declare explicit performance targets
  (e.g., frame rate, p95 latency, memory ceiling, throughput) in its plan before
  implementation.
- Performance-sensitive changes MUST be measured against those targets with reproducible
  benchmarks; regressions beyond an agreed threshold block the merge.
- Optimization MUST be evidence-driven: profile first, then optimize the proven
  bottleneck. Speculative micro-optimization that harms readability is rejected.
- Resource usage (CPU, memory, allocations, network) MUST be bounded and MUST NOT grow
  unbounded with input or session length.

**Rationale**: In an interactive, real-time application, latency and frame stability are
core to the experience. Defining targets up front makes performance a verifiable
acceptance criterion rather than a subjective debate after the fact.

## Quality Gates

The following gates MUST pass before any change is merged. A gate failure blocks the
merge until resolved or until an explicit, documented exception is granted (see
Governance).

- **Formatting & static analysis**: automated formatter and linter pass with zero
  unjustified warnings (Principle I).
- **Tests**: full suite passes; new/changed behavior is covered; coverage does not
  decrease (Principle II).
- **UX review**: user-facing changes are reviewed for consistency and clear error
  handling (Principle III).
- **Performance check**: changes to performance-sensitive paths include benchmark
  evidence against declared targets (Principle IV).
- **Code review**: at least one reviewer approves; the reviewer verifies constitutional
  compliance, not just functional correctness.

## Technical Decision Governance

These principles are the default decision criteria for all technical and implementation
choices.

- When choosing between approaches, prefer the option that best satisfies the four
  principles together; when they conflict, resolve in priority order:
  **Correctness/Testing (II) → Code Quality (I) → User Experience (III) → Performance (IV)**,
  unless a documented requirement overrides this ordering.
- Complexity MUST be justified. Any new dependency, abstraction, service, or pattern MUST
  be recorded with the problem it solves and the simpler alternative rejected, in the
  feature plan's Complexity Tracking section.
- Trade-offs that relax a principle (e.g., shipping with a known performance regression or
  a deferred test) require an explicit, written, time-bounded exception approved during
  review and tracked to closure.
- Plans and specs MUST demonstrate how they uphold each applicable principle; the
  Constitution Check gate in the planning template enforces this before design proceeds.

## Governance

This constitution supersedes all other development practices. Where a practice, habit, or
preference conflicts with this document, this document wins.

- **Authority**: All pull requests and reviews MUST verify compliance with these
  principles and quality gates. Reviewers are responsible for enforcement.
- **Amendments**: Changes to this constitution MUST be proposed in writing with rationale,
  reviewed, and approved before taking effect. Each amendment MUST update the version and
  the Last Amended date, and propagate any required changes to dependent templates.
- **Versioning policy** (semantic):
  - **MAJOR**: backward-incompatible governance changes — removing or redefining a
    principle, or changing the conflict-resolution ordering.
  - **MINOR**: adding a new principle or section, or materially expanding guidance.
  - **PATCH**: clarifications, wording, and non-semantic refinements.
- **Compliance review**: Compliance is checked at every code review and at each planning
  Constitution Check gate. Exceptions MUST be explicit, documented, time-bounded, and
  tracked to closure.
- **Runtime guidance**: Use `CLAUDE.md` and the active feature plan for day-to-day
  development guidance that operationalizes these principles.

**Version**: 1.0.0 | **Ratified**: 2026-06-02 | **Last Amended**: 2026-06-02
