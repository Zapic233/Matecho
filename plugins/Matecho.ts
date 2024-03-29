import { Plugin } from "vite";
import { readFile } from "node:fs/promises";
import * as fs from "node:fs";
import * as path from "path";
import fg from "fast-glob";
import { hash } from "./UnoCSSClassMangle";
import { getUserAgentRegex } from "browserslist-useragent-regexp";

export default (): Plugin => {
  const codeTokens: Record<string, string> = {};
  const AutoComponents = {
    preloaded: [] as string[],
    from: ["header", "sidebar", "footer", "functions"]
  };

  return {
    name: "Matecho",
    async buildStart() {
      const files = await fg(["src/**/*.php"]);
      for (const file of files) {
        this.addWatchFile(file);
      }
    },
    resolveId(id) {
      if (id.endsWith(".php")) {
        return id.replace(".php", ".php.html").replace("src/", "");
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
      if (id.endsWith(".php.html")) {
        return (await readFile("src/" + id.replace(".html", ""))).toString();
      }
    },
    transform(code, id) {
      if (!id.endsWith(".php.html")) return;
      return code.replace(/<\?(?:php|).+?(\?>|$)/gis, match => {
        const token = "PHPCode" + hash(match) + Date.now();
        codeTokens[token] = match;
        return token;
      });
    },
    transformIndexHtml(html) {
      let r = html;
      Object.entries(codeTokens).forEach(([token, code]) => {
        r = r.replaceAll(token, code);
      });
      return r;
    },
    generateBundle(opt, bundle, isWrite) {
      if (!isWrite) return;
      for (const key of Object.keys(bundle)) {
        const OutputBundle = bundle[key];
        if (!("code" in OutputBundle) || !key.endsWith(".js")) continue;
        OutputBundle.code = OutputBundle.code
          // Some CDN will compress this space, that will cause syntax error, fill with dot to prevent this
          .replaceAll("1 .toString", "1..toString");
      }
    },
    writeBundle(opt, bundle) {
      if (typeof opt.dir === "undefined")
        throw Error("Options.dir cannot be undefined");
      for (const key of Object.keys(bundle)) {
        if (!key.endsWith(".php.html")) continue;
        const nKey = key.replace(".html", "");
        bundle[nKey] = bundle[key];
        bundle[nKey].fileName = nKey;
        delete bundle[key];

        const nBundle = bundle[nKey];
        if (!("source" in nBundle)) throw Error("impossible");
        let source: string = nBundle.source as string;

        if (source.includes("<!--matecho-assets-injection-->")) {
          const assets: string[] = [];
          source = source.replaceAll(
            /<script[^<>]+\/Matecho\/[^<>]+><\/script>\n?/g,
            match => {
              assets.push(match);
              return "";
            }
          );
          source = source.replaceAll(
            /<link[^<>]+\/Matecho\/[^<>]+>\n?/g,
            match => {
              assets.push(match);
              return "";
            }
          );
          source = source.replace(
            "<!--matecho-assets-injection-->",
            assets.join("")
          );
        }

        source = source.replaceAll(
          "<%= CompatibilityUserAgentRegex %>",
          JSON.stringify(
            getUserAgentRegex({
              ignoreMinor: true,
              allowHigherVersions: true
            }).toString()
          ).slice(1, -1)
        );
        fs.unlinkSync(path.join(opt.dir, key));
        fs.writeFileSync(path.join(opt.dir, nKey), source);
        AutoComponents.preloaded = [];
      }
    }
  };
};
