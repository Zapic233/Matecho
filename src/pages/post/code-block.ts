import type { HighlighterGeneric } from "shiki/core";
import {
  type BundledLanguage,
  bundledLanguages,
  bundledLanguagesInfo
} from "shiki/langs";
import type { BundledTheme } from "shiki/themes";

import { PrismVue } from "@/utils/prism";
import ClipboardJS from "clipboard";
import { openSnackbar } from "@/utils/global";
import "@mdui/icons/play-arrow.js";

const glotLangAliasMap: Record<string, string> = {
  asm: "assembly",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  lisp: "clisp",
  clj: "clojure",
  coffee: "coffeescript",
  "c++": "cpp",
  cs: "csharp",
  "c#": "csharp",
  erl: "erlang",
  fs: "fsharp",
  "f#": "fsharp",
  hs: "haskell",
  js: "javascript",
  jl: "julia",
  kt: "kotlin",
  kts: "kotlin",
  py: "python",
  perl6: "raku",
  rb: "ruby",
  rs: "rust",
  ts: "typescript"
};

const glotSupportList = [
  "assembly",
  "ats",
  "bash",
  "c",
  "clisp",
  "clojure",
  "cobol",
  "coffeescript",
  "cpp",
  "crystal",
  "csharp",
  "d",
  "dart",
  "elixir",
  "elm",
  "erlang",
  "fsharp",
  "go",
  "groovy",
  "guile",
  "hare",
  "haskell",
  "idris",
  "java",
  "javascript",
  "julia",
  "kotlin",
  "lua",
  "mercury",
  "nim",
  "nix",
  "ocaml",
  "pascal",
  "perl",
  "php",
  "python",
  "raku",
  "ruby",
  "rust",
  "sac",
  "scala",
  "swift",
  "typescript",
  "zig"
];

interface IGlotResponseOK {
  stdout: string;
  stderr: string;
  error: string;
}

interface IGlotResponseError {
  message: string;
}

type IGlotResponse = IGlotResponseOK | IGlotResponseError;

async function runCodeBlock(lang: string, code: string) {
  let resp: IGlotResponse;
  try {
    resp = (await (
      await fetch("/index.php/api/runner", {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ lang, code })
      })
    ).json()) as IGlotResponse;
  } catch (_) {
    resp = {
      message:
        _ instanceof Error
          ? "运行代码时出现错误: " + _.message
          : "运行代码时出现未知错误."
    };
  }
  return resp;
}

function bindTextarea(
  area: HTMLTextAreaElement,
  codeEl: HTMLElement,
  lang: string
) {
  area.addEventListener("scroll", () => {
    codeEl.scroll({
      top: area.scrollTop,
      left: area.scrollLeft
    });
  });
  area.value = codeEl.innerText;
  area.addEventListener("keydown", function (e) {
    if (e.key == "Tab") {
      e.preventDefault();
      const start = area.selectionStart;
      const end = area.selectionEnd;
      area.value =
        area.value.substring(0, start) + "  " + area.value.substring(end);
      area.selectionStart = area.selectionEnd = start + 2;
      area.dispatchEvent(new Event("input"));
    }
  });
  area.addEventListener("input", () => {
    const { Highlighter } = window.__MATECHO_OPTIONS__;
    if (
      Highlighter === "Shiki" &&
      shikiInst &&
      shikiInst.getLoadedLanguages().includes(lang)
    ) {
      codeEl.innerHTML = /<code>([\s\S]*?)<\/code>/.exec(
        shikiInst.codeToHtml(area.value, {
          lang,
          themes: {
            light: "solarized-light",
            dark: "solarized-dark"
          }
        })
      )![1];
    } else if (Highlighter === "Prism" && PrismInst) {
      codeEl.innerHTML = PrismInst.highlight(
        area.value,
        PrismInst.languages[lang],
        lang
      );
    } else {
      codeEl.innerText = area.value;
    }
    const ls = codeEl.parentElement!.querySelector(".line-numbers-rows")!;
    ls.innerHTML = "";
    const lc = (area.value.match(/\n/g) || []).length + 1;
    while (ls.childElementCount > lc) {
      ls.lastElementChild?.remove();
    }
    while (ls.childElementCount < lc) {
      ls.appendChild(document.createElement("span"));
    }
  });
}

export function initCodeBlockAction(wrapper: HTMLElement) {
  wrapper.querySelectorAll("pre").forEach(el => {
    const codeEl = el.querySelector("code");
    if (!codeEl) return;
    const wrapper = Object.assign(document.createElement("div"), {
      className: "matecho-code-action-wrapper"
    } as Partial<HTMLDivElement>);
    // ! the languages class name render by Typecho is lang-xxx, but it will be changed to language-xxx after Prism highlighted it.
    const codeLangCls = Array.from(codeEl.classList).filter(c =>
      c.startsWith("lang-")
    )[0];
    const codeLangOpt = codeLangCls.substring(5).split("-");
    const codeLang = codeLangOpt[0];
    if (codeLang) {
      codeEl.classList.remove(codeLangCls);
      codeEl.classList.add(`lang-${codeLang}`);
      const lang = LangNameMap[codeLang] || codeLang;
      el.appendChild(
        Object.assign(document.createElement("div"), {
          innerText: lang,
          className: "matecho-code-lang"
        } as Partial<HTMLDivElement>)
      );
    }

    if (
      codeLangOpt.includes("r") &&
      (glotSupportList.includes(codeLang.toLocaleLowerCase()) ||
        codeLang.toLocaleLowerCase() in glotLangAliasMap)
    ) {
      el.classList.add("block-editable");
      const runBtn = document.createElement("mdui-button-icon");
      runBtn.appendChild(document.createElement("mdui-icon-play-arrow"));
      const realLang = glotSupportList.includes(codeLang.toLocaleLowerCase())
        ? codeLang.toLowerCase()
        : glotLangAliasMap[codeLang.toLowerCase()];
      let CodeBlockOutput: HTMLElement;
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      runBtn.addEventListener("click", async () => {
        runBtn.loading = true;
        el.classList.add("code-running");
        const resp = await runCodeBlock(realLang, codeEl.innerText);
        runBtn.loading = false;
        el.classList.remove("code-running");
        const wrapper = document.createElement("pre");
        wrapper.classList.add("output");
        if ("message" in resp) {
          const stderr = document.createElement("code");
          stderr.classList.add("stderr");
          stderr.innerText = resp.message;
          wrapper.appendChild(stderr);
        } else {
          const stdout = document.createElement("code");
          stdout.classList.add("stdout");
          stdout.innerText = resp.stdout || "No Output";
          if (!resp.stdout) {
            stdout.classList.add("empty");
          }
          wrapper.appendChild(stdout);
          if (resp.stderr || resp.error) {
            const stderr = document.createElement("code");
            stderr.classList.add("stderr");
            stderr.innerText = resp.error + "\n" + resp.stderr;
            wrapper.appendChild(stderr);
          }
        }
        CodeBlockOutput?.remove();
        CodeBlockOutput = wrapper;
        el.classList.add("has-output");
        el.after(wrapper);
      });
      const editor = document.createElement("textarea");
      editor.autocomplete = "off";
      editor.autocapitalize = "off";
      editor.spellcheck = false;
      editor.classList.add("editor");
      bindTextarea(editor, codeEl, codeLang);
      codeEl.before(editor);
      wrapper.appendChild(runBtn);
    }

    const copyBtn = document.createElement("mdui-button-icon");
    copyBtn.addEventListener("click", () => {
      ClipboardJS.copy(codeEl.innerText);
      openSnackbar("已复制到剪切板");
    });
    copyBtn.appendChild(document.createElement("mdui-icon-copy-all"));
    wrapper.appendChild(copyBtn);

    el.appendChild(wrapper);

    if (!el.classList.contains("line-numbers")) {
      const lineNumWrapper = Object.assign(document.createElement("span"), {
        className: "line-numbers-rows"
      });
      lineNumWrapper.setAttribute("aria-hidden", "true");
      const lines = codeEl.innerText.split("\n");
      lines.forEach(() => {
        lineNumWrapper.appendChild(document.createElement("span"));
      });
      if (lines[lines.length - 1].trim() === "") {
        lineNumWrapper.lastElementChild?.remove();
      }
      el.appendChild(lineNumWrapper);
      el.classList.add("line-numbers");
    }
  });
}

const LangNameMap = {
  ...Object.fromEntries(bundledLanguagesInfo.map(lang => [lang.id, lang.name])),
  ...Object.fromEntries(
    bundledLanguagesInfo.flatMap(
      lang => lang.aliases?.map(alias => [alias, lang.name]) || []
    )
  )
};

export function initPrism(container: HTMLElement) {
  return Promise.all([
    import("@/style/prism.less"),
    import("virtual:prismjs").then(({ default: Prism }) => {
      PrismVue(Prism);
      Prism.highlightAllUnder(container);
      PrismInst = Prism;
    })
  ]);
}

let shikiInst: HighlighterGeneric<BundledLanguage, BundledTheme>;
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let PrismInst: typeof import("virtual:prismjs").default;

export async function loadShiki() {
  const [
    { createdBundledHighlighter },
    { bundledThemes },
    { default: initWasm }
  ] = await Promise.all([
    import("shiki/core"),
    import("shiki/themes"),
    import("shiki/onig.wasm?init")
  ]);
  shikiInst = await createdBundledHighlighter(
    bundledLanguages,
    bundledThemes,
    initWasm
  )({
    langs: [],
    themes: ["solarized-light", "solarized-dark"]
  });
}

export async function initShiki(container: HTMLElement) {
  if (!shikiInst) {
    await loadShiki();
  }
  const blocks = container.querySelectorAll<HTMLPreElement>(
    "pre code[class*=lang-]"
  );
  const requireLangs = new Set<BundledLanguage>();
  const loadedLangs = shikiInst.getLoadedLanguages();
  blocks.forEach(el => {
    const lang = /lang-(\w+)/.exec(el.className)?.[1] || "";
    if (lang in bundledLanguages && !loadedLangs.includes(lang)) {
      requireLangs.add(lang as BundledLanguage);
    }
  });

  await shikiInst.loadLanguage(...Array.from(requireLangs));

  blocks.forEach(el => {
    if (el.parentElement?.classList.contains("shiki")) return;
    const lang = /lang-(\w+)/.exec(el.className)?.[1];
    if (!lang) return;
    const result = shikiInst.codeToHtml(el.innerText, {
      lang,
      themes: {
        light: "solarized-light",
        dark: "solarized-dark"
      }
    });
    const wp = document.createElement("div");
    wp.innerHTML = result;
    el.innerHTML = wp.querySelector("code")!.innerHTML;
    el.parentElement!.classList.add("shiki");
  });
}
