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

export function initCodeBlockAction(wrapper: HTMLElement) {
  wrapper.querySelectorAll("pre").forEach(el => {
    const codeEl = el.querySelector("code");
    if (!codeEl) return;
    const wrapper = Object.assign(document.createElement("div"), {
      className: "matecho-code-action-wrapper"
    } as Partial<HTMLDivElement>);
    // ! the languages class name render by Typecho is lang-xxx, but it will be changed to language-xxx after Prism highlighted it.
    const codeLang = Array.from(codeEl.classList).filter(c =>
      c.startsWith("lang-")
    )[0];
    if (codeLang) {
      const lang = LangNameMap[codeLang.substring(5)] || codeLang.substring(5);
      el.appendChild(
        Object.assign(document.createElement("div"), {
          innerText: lang,
          className: "matecho-code-lang"
        } as Partial<HTMLDivElement>)
      );
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
    import("@/style/prism.css"),
    import("virtual:prismjs").then(({ default: Prism }) => {
      PrismVue(Prism);
      Prism.highlightAllUnder(container);
    })
  ]);
}

let shikiInst: HighlighterGeneric<BundledLanguage, BundledTheme>;

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
