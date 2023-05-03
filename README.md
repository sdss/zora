# zora

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Project Libraries

This project is scaffolded with the following libraries:
- [Vue](https://vuejs.org/) - modern javascript framework
- [Vuetify](https://vuetifyjs.com/en/) - material-design UI component library
- [Vue-Router](https://router.vuejs.org/) - build multi-page applications
- [Pinia](https://pinia.vuejs.org/) - share application state between components
- [Vitest](https://vitest.dev/) - component unit testing
- [Playwright](https://playwright.dev/) - UI end-to-end browser testing


## Project Setup

```
# yarn
yarn

# npm (recommended)
npm install

# pnpm
pnpm install
```

### Compiles and Hot-Reloads for Development

```
# yarn
yarn dev

# npm (recommended)
npm run dev

# pnpm
pnpm dev
```

### Type-Check, Compile and Minify for Production

```
# yarn
yarn build

# npm (recommended)
npm run build

# pnpm
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lints and fixes files with [ESLint](https://eslint.org/)

```
# yarn
yarn lint

# npm (recommended)
npm run lint

# pnpm
pnpm lint
```

### Format the Code with [Prettier](https://prettier.io/)
```
# npm
npm run format
```


### Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).
