import { defineConfig, UserConfig } from "vite";
import unocss from "unocss/vite";
import fg from "fast-glob";
import Matecho from "./plugins/Matecho";
import PrismJS from "./plugins/Prism";
import UnoCSSClassMangle from "./plugins/UnoCSSClassMangle";
import fs from "node:fs";

export default defineConfig(async env => {
  const isProd = env.mode === "production";
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
        transformers: [
          UnoCSSClassMangle({
            classPrefix: "m-"
          })
        ]
      }),
      Matecho(),
      PrismJS({
        languages: ["c", "typescript", "bash"],
        plugins: ["line-numbers"]
      })
    ],
    appType: "custom",
    resolve: {
      alias: {
        "@/": "src/"
      }
    },
    build: {
      rollupOptions: {
        input: [...(await fg("pages/**/*.php"))],
        output: {
          assetFileNames: "assets/assets-[hash].[ext]",
          chunkFileNames: "assets/chunk-[hash].js",
          entryFileNames: "assets/chuck-[hash].js"
        }
      },
      target: isProd ? "es2018" : "esnext",
      minify: isProd,
      sourcemap: false,
      cssMinify: isProd
    },
    define: {
      __BUILD_DATE__: JSON.stringify(new Date().toString()),
      __BUILD_COMMIT_ID__: JSON.stringify(COMMIT_ID)
    },
    base: "/__VIRTUAL_THEME_ROOT__"
  } as UserConfig;
});
