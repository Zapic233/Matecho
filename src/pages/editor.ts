import { initKaTeX, initPrism, initShiki } from "./post";
import "@/style/editor.less";

function init() {
  const int = setInterval(() => {
    const preview = document.querySelector<HTMLDivElement>("#wmd-preview");
    if (!preview) return;
    clearInterval(int);
    const { KaTeX, Highlighter } = window.__MATECHO_OPTIONS__;
    const ob = new MutationObserver(() => {
      if (window.getComputedStyle(preview).display === "none") return;
      if (KaTeX) void initKaTeX(preview);
      preview.querySelectorAll("pre code[class]").forEach(el => {
        el.classList.remove("focus");
        let lang = el.className.split(" ").find(v => v != "focus");
        if (!lang) return;
        lang = lang
          .split("-")
          .filter(v => v != "r")
          .join("-");
        el.parentElement?.classList.add("lang-" + lang);
        el.classList.add("lang-" + lang);
        el.querySelectorAll(".line[data-id]").forEach(el => el.remove());
      });
      if (Highlighter == "Prism") {
        void initPrism(preview);
      } else if (Highlighter == "Shiki") {
        void initShiki(preview);
      }
    });
    ob.observe(preview, {
      childList: true,
      attributes: true
    });
  });
}

init();
