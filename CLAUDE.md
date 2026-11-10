# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`ivg-latam` is an Angular 16 (NgModule-based, not standalone) frontend for an online football league/manager game: teams, players, transfer market, tournaments, match reports, injured/suspended players and an admin dashboard. The UI and most code comments/route names are in Spanish. It talks to a separate REST backend (not in this repo).

## Commands

- `npm start` — dev server at http://localhost:4200 (uses `environment.ts`, API at `http://localhost:3000/api/v1/`, so the backend must run locally)
- `npm run build` — production build to `dist/ivg-latam` (swaps in `environment.prod.ts`, which points at the Railway-hosted backend)
- `npm run watch` — dev build in watch mode
- `npm test` — Karma + Jasmine (Chrome). Run a single spec with `npx ng test --include src/app/path/to/file.spec.ts`; use `--watch=false` for a one-off run. Most existing specs are CLI-generated stubs.
- `npx ng deploy` — deploys to Firebase Hosting (`@angular/fire:deploy`, project/site `ivg-latam`; SPA rewrite to `index.html` in `firebase.json`)

No linter is configured. Prettier config: single quotes, trailing commas.

## Architecture

- **Lazy feature modules** are wired in `src/app/app-routing.module.ts`: `auth`, `dashboard`, `home`, `equipos` (team), `profile`, `mercado-transferencias` (search-players), `inhabilitados` (disabled-players), `tournament`. Everything except `auth` is behind `userGuard`. Unknown routes redirect to `auth/login`. Each feature folder has its own `*-routing.module.ts`, `*.module.ts`, and usually a local `service/` and `models/` folder.
- **Admin-only routes** are gated inline in feature routing modules with functional guards checking `LoginService.user?.idRol === 1` (see `dashboard/dashboard-routing.module.ts`).
- **Session/auth** — two services in `src/app/service/`:
  - `LoginService` owns session state: stores `token` and a sanitized `user` in `sessionStorage`, exposes `user$`, `isLogged()` (checks JWT expiry), `logout()`. The guard and JWT interceptor depend on this one.
  - `AuthService` performs the HTTP calls (`auth/login`, `auth/register`, password reset) and has older user-storage helpers.
- **HTTP interceptors** (registered in `app.module.ts`): `JwtInterceptorInterceptor` adds `Authorization: Bearer <token>`; `LoadingInterceptor` shows the global `ngx-spinner` while requests are in flight — send header `X-Skip-Spinner` on a request to opt out (the interceptor strips it).
- **API URLs** are built as `environment.API_URL + 'resource/path'`. Backend responses are wrapped; services commonly check `response.code === -1` or `response.httpCode >= 400` as error signals and read payload from `response.data`.
- **State**: NgRx store exists but is minimal (only a `players` slice in `src/app/state/`); most state lives in services with RxJS `BehaviorSubject`s.
- **UI libraries mixed together**: Bootstrap 5 + ng-bootstrap, ng-zorro-antd (locale `es_ES`), ngx-toastr for notifications, ngx-pagination. `SharedModule` (`src/app/shared/`) provides the header, a generic table component, and the trade component. `CUSTOM_ELEMENTS_SCHEMA` is enabled at the root module, so unknown element typos won't fail compilation.
