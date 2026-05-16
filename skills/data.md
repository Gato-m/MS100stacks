# Data Skill

## Purpose

Generate deterministic JSON, TypeScript types, i18n files, and data utilities.

## Rules

- Always preserve key order.
- Always generate stable, reproducible structures.
- Always use TypeScript types.
- Always generate pure functions.

## JSON

- Keys sorted logically: id, title, description, time, location.
- Time format: "10.00".
- Coordinates: { lat: number, lng: number }.

## i18n

- Always generate en.json and lv.json.
- Keys must be flat.
- Preserve original text exactly.

## Utilities

- formatTime
- groupByDate
- sortByTime
- extractUniquePlaces
