import { type ConfigEnv, type Plugin } from "vite";
import { hash } from "./UnoCSSClassMangle";
import { getUserAgentRegex } from "browserslist-useragent-regexp";
import { copyFile, cp, readFile, rm, mkdir } from "node:fs/promises";
import HttpProxy from "http-proxy";
import { existsSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";

export interface MatechoBuildOptions {
  PrismLanguages: string[];
  ExtraMaterialIcons: string[];
}

export function defineConfig(config: Partial<MatechoBuildOptions>) {
  return config;
}

interface MatechoPluginConfig {
  extraIcons?: string[];
  CommitID?: string;
}

const createTransformProxy = (
  transformer: (
    html: string,
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>
  ) => Promise<string> | string,
  config?: HttpProxy.ServerOptions
): HttpProxy => {
  const proxy = HttpProxy.createProxyServer({
    selfHandleResponse: true,
    ...config
  });
  proxy.on("proxyReq", req => {
    req.setHeader("Accept-Encoding", "");
  });
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  proxy.on("proxyRes", async (proxyRes, req, res) => {
    for (const k in proxyRes.headers) {
      res.setHeader(k, proxyRes.headers[k]);
    }
    res.statusCode = proxyRes.statusCode;

    if (!proxyRes.headers["content-type"]?.startsWith("text/html")) {
      proxyRes.pipe(res);
      return;
    }

    const data = await new Promise<string>(resolve => {
      let resp = "";
      proxyRes.setEncoding("utf-8");
      proxyRes.on("data", (chuck: string) => {
        resp += chuck;
      });
      proxyRes.on("end", () => {
        resolve(resp);
      });
    });

    const result = await transformer(data, req, res);
    res.end(result);
  });

  return proxy;
};

export default (config?: MatechoPluginConfig): Plugin => {
  const codeTokens: Record<string, string> = {};
  const AutoComponents = {
    preloaded: [] as string[],
    from: ["header", "sidebar", "footer", "functions"]
  };

  let env: ConfigEnv = {} as ConfigEnv;

  return {
    name: "Matecho",

    config(_config, _env) {
      env = _env;
    },
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith(".php")) {
        const filename = ctx.file
          .substring(ctx.file.indexOf("/src/") + 5)
          .replace(".php", "");
        const module = ctx.server.moduleGraph.getModuleById(
          `virtual:components/${filename}`
        );
        if (module) {
          ctx.server.moduleGraph.invalidateModule(module);
        }
        ctx.server.hot.send({ type: "full-reload" });
      }
    },
    async buildStart(options) {
      if (env.command === "serve" && Array.isArray(options.input)) {
        try {
          await rm("dist/", { recursive: true });
        } catch (_) {
          //
        }
        await mkdir("dist/");
        await Promise.all(
          options.input.map(file => {
            this.addWatchFile(file);
            return copyFile(file, file.replace("src/", "dist/"));
          })
        );
        await cp("public/", "dist/", { recursive: true });
      }
    },
    watchChange(id) {
      if (id.endsWith(".php")) {
        if (existsSync(id)) {
          void copyFile(id, id.replace("src/", "dist/"));
        } else {
          void rm(id.replace("src/", "dist/"));
        }
      }
    },
    configureServer(server) {
      return () => {
        void server.middlewares.use((req, res) => {
          const proxy = createTransformProxy(
            async (html, req) => {
              if (
                html
                  .substring(0, 15)
                  .toUpperCase()
                  .startsWith("<!DOCTYPE HTML>")
              ) {
                try {
                  return await server.transformIndexHtml(req.url, html);
                } catch (e) {
                  console.error(e);
                  if (e instanceof Error) {
                    setTimeout(() => {
                      server.hot.send({
                        type: "error",
                        err: {
                          message: e.message,
                          stack: e.stack
                        }
                      });
                    }, 100);
                  }
                  return await server.transformIndexHtml(req.url, "");
                }
              } else {
                return html;
              }
            },
            {
              target: "http://" + (server.config.server.host || "localhost"),
              selfHandleResponse: true
            }
          );
          proxy.on("proxyReq", () => {
            AutoComponents.preloaded = [];
          });
          proxy.web(req, res);
        });
      };
    },
    resolveId(id) {
      if (id.endsWith(".php")) {
        return id.replace(".php", "_actual_php.html");
      }
      if (id.startsWith("virtual:components")) {
        return id;
      }
    },
    async load(id) {
      if (id === "virtual:components-custom-icon") {
        const icons = config?.extraIcons;
        if (!icons) return "";
        return icons
          .map(icon => {
            return `import "@mdui/icons/${icon}";`;
          })
          .join("\n");
      }
      if (id.startsWith("virtual:components")) {
        const src = (
          await readFile(
            "src/" + id.replace("virtual:components/", "") + ".php"
          )
        ).toString();
        const isFromPreloaded = AutoComponents.from.includes(
          id.replace("virtual:components/", "")
        );
        return Array.from(
          new Set(Array.from(src.matchAll(/<mdui-([^<> ]+)/g)).map(v => v[1]))
        )
          .filter(v => !AutoComponents.preloaded.includes(v))
          .map(v => {
            if (v.includes("$")) return ""; // php dynamic tags
            if (isFromPreloaded) AutoComponents.preloaded.push(v);
            if (v.startsWith("icon-")) {
              return `import "@mdui/icons/${v.substring(5)}";`;
            } else {
              return `import "mdui/components/${v}";`;
            }
          })
          .join("\n");
      }
      if (id.endsWith("_actual_php.html")) {
        return (await readFile(id.replace("_actual_php.html", ".php")))
          .toString()
          .replaceAll("<%= CommitID %>", config.CommitID ?? "unknown")
          .replaceAll(
            "<%= CompatibilityUserAgentRegex %>",
            JSON.stringify(
              getUserAgentRegex({
                ignoreMinor: true,
                allowHigherVersions: true
              }).toString()
            ).slice(1, -1)
          )
          .replace(/<\?(?:php|).+?(\?>|$)/gis, match => {
            const token = "PHPCode" + hash(match) + Date.now();
            codeTokens[token] = match;
            return token;
          });
      }
    },
    transformIndexHtml(html, ctx) {
      let r = html;
      ctx.filename = ctx.filename.replace("_actual_php.html", ".php");
      if (env.command !== "serve") {
        Object.entries(codeTokens).forEach(([token, code]) => {
          r = r.replaceAll(token, code);
        });
      }
      return r;
    },
    generateBundle: {
      order: "post",
      handler(opt, bundle, isWrite) {
        if (!isWrite) return;
        for (const key of Object.keys(bundle)) {
          const OutputBundle = bundle[key];
          if (key.endsWith("_actual_php.html")) {
            bundle[key].fileName = bundle[key].fileName
              .replace("_actual_php.html", ".php")
              .replace("src/", "");
          }
          if (!("code" in OutputBundle) || !key.endsWith(".js")) continue;
          OutputBundle.code = OutputBundle.code
            // Some CDN will compress this space, that will cause syntax error, fill with dot to prevent this
            .replaceAll("1 .toString", "1..toString");
        }
      }
    }
  };
};
