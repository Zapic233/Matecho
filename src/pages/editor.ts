import { initKaTeX, initPrism } from "./post";

function init() {
  const int = setInterval(() => {
    const preview = document.querySelector<HTMLDivElement>("#wmd-preview");
    if (!preview) return;
    clearInterval(int);
    const { KaTeX, Prism } = window.__MATECHO_OPTIONS__;
    const ob = new MutationObserver(() => {
      if (window.getComputedStyle(preview).display === "none") return;
      if (KaTeX) initKaTeX(preview);
      if (Prism) {
        preview.querySelectorAll("pre code[class]").forEach(el => {
          el.classList.remove("focus");
          el.parentElement?.classList.add(
            "language-" + el.className.split(" ").filter(v => v != "focus")[0]
          );
        });
        initPrism(preview);
      }
    });
    ob.observe(preview, {
      childList: true,
      attributes: true
    });
  });
}

init();
