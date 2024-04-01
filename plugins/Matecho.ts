import { ConfigEnv, Plugin } from "vite";
import { hash } from "./UnoCSSClassMangle";
import { getUserAgentRegex } from "browserslist-useragent-regexp";
import { copyFile, cp, readFile, rm, mkdir } from "node:fs/promises";
import HttpProxy from "http-proxy";

export default (): Plugin => {
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
        await rm("dist/", { recursive: true });
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
        void copyFile(id, id.replace("src/", "dist/"));
      }
    },
    configureServer(server) {
      return () => {
        void server.middlewares.use((req, res) => {
          const proxy = HttpProxy.createServer({
            target: "http://" + (server.config.server.host || "localhost"),
            selfHandleResponse: true
          });
          proxy.on("proxyReq", _req => {
            _req.setHeader("Accept-Encoding", "");
            AutoComponents.preloaded = [];
          });
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          proxy.on("proxyRes", async (_res, req, res) => {
            if (_res.headers["content-type"].split(";")[0] == "text/html") {
              const html = await new Promise<string>(resolve => {
                let resp = "";
                _res.setEncoding("utf-8");
                _res.on("data", (chuck: string) => {
                  resp += chuck;
                });
                _res.on("end", () => {
                  resolve(resp);
                });
              });
              for (const k in _res.headers) {
                res.setHeader(k, _res.headers[k]);
              }
              res.statusCode = _res.statusCode;
              if (html.startsWith("<!DOCTYPE html>")) {
                try {
                  const resp = await server.transformIndexHtml(req.url, html);
                  res.end(resp);
                } catch (e) {
                  console.error(e);
                  if (e instanceof Error) {
                    server.hot.send({
                      type: "error",
                      err: {
                        message: e.message,
                        stack: e.stack
                      }
                    });
                  }
                  res.end(await server.transformIndexHtml(req.url, ""));
                }
              } else {
                res.end(html);
              }
            } else {
              _res.pipe(res);
            }
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
        return (
          await readFile(id.replace("_actual_php.html", ".php"))
        ).toString();
      }
    },
    transform(code, id) {
      if (env.command === "serve" || !id.endsWith("_actual_php.html")) return;
      return code.replace(/<\?(?:php|).+?(\?>|$)/gis, match => {
        const token = "PHPCode" + hash(match) + Date.now();
        codeTokens[token] = match;
        return token;
      });
    },
    transformIndexHtml(html, ctx) {
      let r = html;
      r = r.replaceAll(
        "<%= CompatibilityUserAgentRegex %>",
        JSON.stringify(
          getUserAgentRegex({
            ignoreMinor: true,
            allowHigherVersions: true
          }).toString()
        ).slice(1, -1)
      );
      ctx.filename = ctx.filename.replace("_actual_php.html", ".php");
      if (env.command !== "serve") {
        Object.entries(codeTokens).forEach(([token, code]) => {
          r = r.replaceAll(token, code);
        });
        if (r.includes("<!--matecho-assets-injection-->")) {
          const assets: string[] = [];
          r = r.replaceAll(
            /<script[^<>]+\/Matecho\/[^<>]+><\/script>\n?/g,
            match => {
              assets.push(match);
              return "";
            }
          );
          r = r.replaceAll(/<link[^<>]+\/Matecho\/[^<>]+>\n?/g, match => {
            assets.push(match);
            return "";
          });
          r = r.replace("<!--matecho-assets-injection-->", assets.join(""));
        }
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
