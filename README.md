# SaaS Boilerplate

## What's inside?

Using Turborepo with the following setup:

### Apps and Packages

- `landing-blog`: an Astro blog + landing page -> domain.com
- `app`: a React + Vite front application -> app.domain.com
- `api`: an Hono API -> api.domain.com
- `@repo/ui`: a stub React component library shared by both `app` and `blog` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Todo
