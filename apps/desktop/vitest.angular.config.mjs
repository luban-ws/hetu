/// <reference types="vitest" />
import { defineConfig } from "vite";
import { resolve } from "path";
import angular from "@analogjs/vite-plugin-angular";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  plugins: [angular(), tsconfigPaths()],
  test: {
    globals: true,
    setupFiles: ["test/angular/test-setup.ts"],
    environment: "jsdom",
    include: [
      "src/renderer/**/__tests__/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    reporters: ["default"],
    server: {
      deps: {
        inline: [/fesm2022/],
      },
    },
  },
  resolve: {
    alias: {
      "rxjs/operators": resolve(
        process.cwd(),
        "node_modules/rxjs/operators/index.js"
      ),
      rxjs: resolve(process.cwd(), "node_modules/rxjs"),
    },
  },
  define: {
    "import.meta.vitest": mode !== "production",
  },
  optimizeDeps: {
    include: ["rxjs/operators"],
  },
  assetsInclude: ["**/*.html"],
}));
