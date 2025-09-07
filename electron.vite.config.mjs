import { defineConfig } from "electron-vite";
import { resolve } from "path";
import { readFileSync, existsSync } from "fs";
import angular from "@analogjs/vite-plugin-angular";

export default defineConfig({
  main: {
    // 主进程配置
    input: "src/main/index.js",
    resolve: {
      alias: {
        "@common": resolve(__dirname, "src/common"),
        "@shared": resolve(__dirname, "src/shared"),
      },
    },
    build: {
      rollupOptions: {
        external: ["electron"],
        input: "src/main/index.js",
        output: {
          entryFileNames: "index.js",
        },
      },
      // 复制 WASM 文件到构建输出目录
      copyPublicDir: false,
      assetsInclude: ["**/*.wasm"],
    },
    // 添加插件来处理 WASM 文件
    plugins: [
      {
        name: "copy-wasm-files",
        generateBundle(options, bundle) {
          // 复制 wasm-git 的 WASM 文件
          const wasmFiles = [
            "node_modules/wasm-git/lg2_async.wasm",
            "node_modules/wasm-git/lg2.wasm",
          ];

          wasmFiles.forEach((wasmFile) => {
            const wasmPath = resolve(__dirname, wasmFile);
            if (existsSync(wasmPath)) {
              const wasmContent = readFileSync(wasmPath);
              const fileName = wasmFile.split("/").pop();
              this.emitFile({
                type: "asset",
                fileName: `chunks/${fileName}`,
                source: wasmContent,
              });
            }
          });
        },
      },
    ],
  },
  preload: {
    // 预加载脚本配置
    resolve: {
      alias: {
        "@common": resolve(__dirname, "src/common"),
        "@shared": resolve(__dirname, "src/shared"),
      },
    },
    build: {
      rollupOptions: {
        external: ["electron"],
      },
    },
  },
  renderer: {
    // 渲染进程配置 (Angular应用)
    root: "src/renderer",
    server: {
      port: 5174,
    },
    plugins: [
      angular({
        tsconfig: resolve(__dirname, "src/renderer/tsconfig.json"),
        workspaceRoot: resolve(__dirname, "src/renderer"),
        inlineStylesExtension: "scss",
      }),
    ],
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
    },
    optimizeDeps: {
      include: [
        "@angular/core",
        "@angular/common",
        "@angular/platform-browser",
        "@angular/platform-browser-dynamic",
        "@angular/compiler",
        "@angular/animations",
        "rxjs",
        "rxjs/operators",
      ],
      exclude: ["@angular/compiler-cli", "zone.js"],
    },
    resolve: {
      mainFields: ["module"],
      alias: {
        "@app": resolve(__dirname, "src/renderer/app"),
        "@core": resolve(__dirname, "src/renderer/app/core"),
        "@infrastructure": resolve(
          __dirname,
          "src/renderer/app/infrastructure"
        ),
        "@settings": resolve(__dirname, "src/renderer/app/settings"),
        "@jira": resolve(__dirname, "src/renderer/app/jira"),
        "@common": resolve(__dirname, "src/common"),
        "@shared": resolve(__dirname, "src/shared"),
      },
    },
    build: {
      outDir: "out/renderer",
      emptyOutDir: true,
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              "@angular/core",
              "@angular/common",
              "@angular/platform-browser",
              "@angular/animations",
            ],
            ui: [
              "@ng-bootstrap/ng-bootstrap",
              "ngx-toastr",
              "@perfectmemory/ngx-contextmenu",
            ],
            utils: ["rxjs", "moment", "d3", "axios"],
          },
        },
      },
    },
  },
});
