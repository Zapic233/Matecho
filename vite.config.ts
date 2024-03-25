import {defineConfig, UserConfig} from "vite";
import unocss from "unocss/vite";
import fg from "fast-glob";
import Matecho from "./plugins/Matecho";
import PrismJS from "./plugins/Prism";

export default defineConfig((async (env) => {
    const isProd = env.mode === "production";
    
    return {
        plugins: [
            unocss({
                theme: {
                    breakpoints: {
                        "xs": "0px",
                        "sm": "600px",
                        "md": "840px",
                        "lg": "1080px",
                        "xl": "1440px",
                        "xxl": "1920px"
                    }
                }
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
                input: [
                    ...(await fg("pages/**/*.php"))
                ],
                output: {
                    assetFileNames: "assets/assets-[hash].[ext]",
                    chunkFileNames: "assets/chunk-[hash].js",
                    entryFileNames: "assets/chuck-[hash].js"
                },
            },
            
            minify: isProd,
            cssMinify: isProd
        },
        base: "/__VIRTUAL_THEME_ROOT__"
    } as UserConfig;
}));