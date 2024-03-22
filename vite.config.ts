import {defineConfig, UserConfig} from "vite";
import unocss from "unocss/vite";
import {readFile} from "node:fs/promises";
import * as fs from "node:fs";
import * as path from "path"
import fg from "fast-glob"
import { log } from "node:console";

const codeTokens: Record<string, string> = {};
function hash(str: string) {
    let i;
    let l;
    let hval = 0x811c9dc5;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval +=
            (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return `00000${(hval >>> 0).toString(36)}`.slice(-6);
}

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
            {
                name: "php",
                async buildStart(){
                    const files = await fg(["pages/**/*.php"]);
                    for(let file of files){
                        this.addWatchFile(file);
                    }
                },
                resolveId(id) {
                    if (id.endsWith(".php")) {
                        return id.replace(".php", ".php.html").replace("pages/", "")
                    }
                },
                async load(id) {
                    if (id.endsWith(".php.html")) {
                        return (await readFile("pages/" + id.replace(".html", ""))).toString();
                    }
                },
                transform(code, id, opt) {
                    if (!id.endsWith('.php.html')) return;
                    return code.replace(/<\?(?:php|).+?(\?>|$)/gis, (match) => {
                        let token = hash(match);
                        codeTokens[token] = match;
                        return token;
                    });
                },
                writeBundle(opt: any, bundle: any) {
                    for (const key of Object.keys(bundle)) {
                        if (!key.endsWith('.php.html')) continue;
                        const nKey = key.replace(".html", "");
                        bundle[nKey] = bundle[key];
                        bundle[nKey].fileName = nKey;
                        delete bundle[key];
                        Object.entries(codeTokens).forEach(([token, code]) => {
                            if (bundle[nKey].source.includes(token)) {
                                bundle[nKey].source = bundle[nKey].source.replaceAll(token, code);
                                 // delete codeTokens[token];
                            }
                        });

                        bundle[nKey].source = bundle[nKey].source.replaceAll("/__VIRTUAL_THEME_ROOT__/", "<?php Matecho::assets(); ?>");
                        fs.unlinkSync(path.join(opt.dir, key));
                        fs.writeFileSync(path.join(opt.dir, nKey), bundle[nKey].source)
                    }
                }
            }
        ],
        appType: "custom",
        build: {
            rollupOptions: {
                input: [
                    ...(await fg("pages/**/*.php"))
                ],
                output: {
                    assetFileNames: "assets/assets-[hash].[ext]",
                    chunkFileNames: "assets/chunk-[hash].js",
                    entryFileNames: "assets/chuck-[hash].js"
                }
            },
            minify: isProd,
            cssMinify: isProd
        },
        base: "/__VIRTUAL_THEME_ROOT__"
    } as UserConfig;
}));