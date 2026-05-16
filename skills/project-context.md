# Project Context Skill

## Purpose

Maintain deterministic understanding of the project structure and architectural rules.

## Structure

- app/ — screens
- components/ — reusable UI
- hooks/ — custom hooks
- data/ — JSON, i18n
- utils/ — pure functions
- types/ — TypeScript types
- assets/ — images, icons, fonts

## Naming

- Components: PascalCase
- Files: kebab-case
- Types: PascalCase + "Type"

## Rules

- Always generate code that fits into this structure.
- Always generate correct relative imports.
- Always prefer minimal dependencies.

## Expo Router

- Screens must be default exports.
- Dynamic routes use [param].tsx.
- Layouts use \_layout.tsx.
