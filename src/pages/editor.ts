import { initKaTeX, initPrism, initShiki } from "./post";

function init() {
  const int = setInterval(() => {
    const preview = document.querySelector<HTMLDivElement>("#wmd-preview");
    if (!preview) return;
    clearInterval(int);
    const { KaTeX, Highlighter } = window.__MATECHO_OPTIONS__;
    const ob = new MutationObserver(() => {
      if (window.getComputedStyle(preview).display === "none") return;
      if (KaTeX) initKaTeX(preview);
      preview.querySelectorAll("pre code[class]").forEach(el => {
        el.classList.remove("focus");
        el.parentElement?.classList.add(
          "lang-" + el.className.split(" ").filter(v => v != "focus")[0]
        );
        el.classList.add(
          "lang-" + el.className.split(" ").filter(v => v != "focus")[0]
        );
        el.querySelectorAll(".line").forEach(el => el.remove());
      });
      if (Highlighter == "Prism") {
        initPrism(preview);
      } else if (Highlighter == "Shiki") {
        initShiki(preview);
      }
    });
    ob.observe(preview, {
      childList: true,
      attributes: true
    });
  });
}

init();
