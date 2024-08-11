import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      logHeapUsage: false,  // displays heap usage after each test, use for debugging
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      server: {
        deps: {
          inline: ["vuetify"],
        }
      },
      globals: true,
      silent: true,  // Suppress all Vitest console logs
      setupFiles: ['./vitest.setup.ts'],
    }
  })
)
