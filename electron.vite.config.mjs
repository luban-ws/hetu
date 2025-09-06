import { defineConfig } from "electron-vite";
import { resolve } from "path";

export default defineConfig({
  main: {
    // 主进程配置
    input: "src/main/index-simple.js",
    build: {
      rollupOptions: {
        external: ["electron"],
      },
    },
  },
  preload: {
    // 预加载脚本配置
    build: {
      rollupOptions: {
        external: ["electron"],
      },
    },
  },
  renderer: {
    // 渲染进程配置 (Angular应用)
    root: "src/renderer",
    plugins: [],
    esbuild: {
      target: "ES2022",
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    },
    optimizeDeps: {
      include: [
        "@angular/core",
        "@angular/common",
        "@angular/platform-browser",
        "@angular/platform-browser-dynamic",
        "@angular/compiler",
        "ngx-contextmenu"
      ],
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@app": resolve(__dirname, "src/app"),
        "@core": resolve(__dirname, "src/app/core"),
        "@infrastructure": resolve(__dirname, "src/app/infrastructure"),
        "@settings": resolve(__dirname, "src/app/settings"),
        "@jira": resolve(__dirname, "src/app/jira"),
      },
    },
    build: {
      outDir: "out/renderer",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              "@angular/core",
              "@angular/common",
              "@angular/platform-browser",
            ],
            ui: ["@ng-bootstrap/ng-bootstrap", "ngx-toastr", "ngx-contextmenu"],
            utils: ["rxjs", "moment", "d3", "axios"],
          },
        },
      },
    },
  },
});
