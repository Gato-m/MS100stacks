# Expo SDK 55 Skill

## Purpose

Provide deterministic, minimal, reproducible guidance for Expo SDK 55 app development using React Native 0.83.x, Expo Router, EAS Build, OTA updates, and platform‑specific configuration.

## Rules

- Always assume Expo SDK 55 unless user specifies otherwise.
- Always use React 19.2.0 and React Native 0.83.6.
- Always use TypeScript.
- Always use Expo Router, not React Navigation.
- Always use `npx expo install` for dependencies.
- Always generate platform‑safe code (Android + iOS).
- Avoid unstable or undocumented APIs.

## Commands

- Use `npx expo install <package>` for all dependencies.

## Expo Router

- Generate screens inside `app/`.
- Use dynamic routes `[id].tsx`.
- Use `_layout.tsx` for layouts.

## EAS Build

- Always include `eas.json` with production, preview, development profiles.
- Always specify Node 18.

## OTA Updates

- Use `"runtimeVersion": { "policy": "sdkVersion" }"`.

## Code generation rules

- Always include imports.
- Always include types.
- Always avoid unused code.
- Always generate tablet‑friendly layouts.
