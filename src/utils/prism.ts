import type PrismMain from "prismjs";

export function PrismVue(Prism: typeof PrismMain): void {
  function createTagLangDef(tag: string, lang: string, ref?: string) {
    const langRef = Prism.languages[ref ?? lang];
    return {
      [tag + "-" + lang]: {
        pattern: RegExp(
          `(<${tag}[^>]*lang="${lang}"[^>]*>)([\\s\\S])*?(?=<\\/${tag}>)`,
          "i"
        ),
        lookbehind: true,
        greedy: true,
        inside: {
          ["language-" + lang]: {
            pattern: /[\s\S]+/,
            inside: langRef
          }
        }
      }
    };
  }
  Prism.languages["vue"] = Prism.languages.extend("markup", {});
  if (Prism.languages["ts"]) {
    Prism.languages.insertBefore(
      "vue",
      "script",
      createTagLangDef("script", "ts", "typescript")
    );
  }
  if (Prism.languages["less"]) {
    Prism.languages.insertBefore(
      "vue",
      "style",
      createTagLangDef("style", "less")
    );
  }
  if (Prism.languages["scss"]) {
    Prism.languages.insertBefore(
      "vue",
      "style",
      createTagLangDef("style", "scss")
    );
  }
  if (Prism.languages["sass"]) {
    Prism.languages.insertBefore(
      "vue",
      "style",
      createTagLangDef("style", "sass")
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (Prism.languages["vue"] as any).tag.inside["special-attr"].push({
    pattern: RegExp(
      /(^|["'\s])/.source +
        "(?:" +
        "(v-|@|:)[^=]*" +
        ")" +
        /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
      "i"
    ),
    lookbehind: true,
    inside: {
      "attr-name": {
        pattern: /^[^\s=]+/,
        inside: {
          punctuation: [/(:|@)/]
        }
      },
      "attr-value": {
        pattern: /=[\s\S]+/,
        inside: {
          value: {
            pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
            lookbehind: true,
            alias: ["reset-color"],
            inside: Prism.languages["javascript"]
          },
          punctuation: [
            {
              pattern: /^=/,
              alias: "attr-equals"
            },
            /"|'/
          ]
        }
      }
    }
  });
  Prism.languages.insertBefore("vue", "tag", {
    "text-interpolation": {
      pattern: RegExp(`{{([\\s\\S])*?}}`, "i"),
      inside: {
        ["language-js"]: {
          pattern: /({{)([\s\S])*?(?=}})/i,
          lookbehind: true,
          inside: Prism.languages.javascript
        },
        punctuation: [/({{|}})/]
      }
    }
  });
}
