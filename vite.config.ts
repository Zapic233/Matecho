import type { UserConfig } from "vite";
import { defineConfig } from "vite";
import unocss from "unocss/vite";
import fg from "fast-glob";
import Matecho, { type MatechoBuildOptions } from "./plugins/Matecho";
import PrismJS from "./plugins/Prism";
import UnoCSSClassMangle from "./plugins/UnoCSSClassMangle";
import fs from "node:fs";

export default defineConfig(async env => {
  let MatechoConfig: MatechoBuildOptions = {
    PrismLanguages: [],
    ExtraMaterialIcons: []
  };
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    MatechoConfig = {
      ...MatechoConfig,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...(await import("./matecho.config")).default
    };
  } catch (_) {
    // ignore
  }

  const isProd = env.mode === "production";
  const isBuild = env.command === "build";
  let COMMIT_ID = "unknown";
  try {
    const id = fs
      .readFileSync(__dirname + "/.git/HEAD")
      .toString("utf-8")
      .trim();
    console.log("Current head @ " + id);
    COMMIT_ID = id.startsWith("ref:") ? id : id.substring(0, 7);
  } catch (_) {
    /**/
  }

  return {
    plugins: [
      unocss({
        theme: {
          breakpoints: {
            xs: "0px",
            sm: "600px",
            md: "840px",
            lg: "1080px",
            xl: "1440px",
            xxl: "1920px"
          }
        },
        transformers: isBuild && [
          UnoCSSClassMangle({
            classPrefix: "m-"
          })
        ]
      }),
      Matecho({
        extraIcons: [
          "tv",
          "live-tv",
          "comment",
          "add",
          "announcement",
          "archive",
          "assignment",
          "bookmarks",
          "celebration",
          "create",
          "diamond",
          "discount",
          "feed",
          "feedback",
          "file-download",
          "group",
          "near-me",
          "podcasts",
          "qr-code",
          "storefront",
          "workspace-premium",
          ...MatechoConfig.ExtraMaterialIcons
        ]
      }),
      PrismJS({
        languages: [
          "bash",
          "c",
          "cpp",
          "csharp",
          "markup-templating",
          "php",
          "php-extras",
          "go",
          "python",
          "java",
          "javascript",
          "sql",
          "css",
          "less",
          "sass",
          "wasm",
          "toml",
          "yaml",
          "json",
          "json5",
          "systemd",
          "kotlin",
          "docker",
          "diff",
          "applescript",
          "lua",
          "pug",
          "regex",
          "rust",
          "smali",
          "stylus",
          "jsx",
          "tsx",
          "swift",
          "ruby",
          "typescript",
          ...MatechoConfig.PrismLanguages
        ]
      })
    ],
    appType: "mpa",
    resolve: {
      alias: {
        "@/": "/src/"
      }
    },
    build: {
      rollupOptions: {
        input: [...(await fg("src/**/*.php"))],
        output: {
          assetFileNames: "assets/assets-[hash].[ext]",
          chunkFileNames: "assets/chunk-[hash].js",
          entryFileNames: "assets/chuck-[hash].js"
        }
      },
      target: isProd ? "es2018" : "esnext",
      minify: isProd,
      sourcemap: !isProd,
      cssMinify: isProd
    },
    define: {
      __BUILD_DATE__: JSON.stringify(new Date().toString()),
      __BUILD_COMMIT_ID__: JSON.stringify(COMMIT_ID)
    },
    base: isBuild ? "/usr/themes/Matecho" : "/"
  } as UserConfig;
});
