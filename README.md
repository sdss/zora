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
- [Vue Test Utils](https://test-utils.vuejs.org/) - Vue Testing Utilities


## Project Setup
```
# npm
npm install
```

## Installing New Dependencies
```
# install a new package and add it to the "dependencies" section of package.json
npm install [package]

# install a new package add  it to the "devDependencies" section of package.json
npm install -D [package]
```

### Compiles and Hot-Reloads for Development
```
npm run dev
```

### Compiles and Minifies for Production
```

```

### Compiles and Hot-Reloads for Development
```
# npm
npm run dev
```

### Type-Check, Compile and Minify for Production
```
# npm
npm run build
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
# npm
npm run lint
```

### Format the Code with [Prettier](https://prettier.io/)
```
# npm
npm run format
```


### Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Awesome Links

- [Awesome Vue](https://github.com/vuejs/awesome-vue)
- [Awesome Vite](https://github.com/vitejs/awesome-vite)
- [Awesome Vuetify](https://github.com/vuetifyjs/awesome-vuetify)