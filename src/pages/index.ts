import "virtual:components/index";
import "@/style/index.less";

export function init() {
  document
    .querySelectorAll("mdui-card.matecho-article-card")
    .forEach(parent => {
      parent.querySelectorAll("a[href]").forEach(href => {
        href.addEventListener("click", () => {
          const pSize = parent.getBoundingClientRect();
          const placeholder = document.createElement("div");
          const main =
            document.querySelector<HTMLDivElement>("#matecho-pjax-main")!;
          main.style.transition = ".1s";
          Object.assign(placeholder.style, {
            display: "block",
            height: pSize.height + "px",
            width: pSize.width + "px"
          });
          parent.after(placeholder);
          Object.assign((parent as HTMLElement).style, {
            height: pSize.height + "px",
            width: pSize.width + "px",
            left: pSize.left + "px",
            top: pSize.top + "px"
          });
          parent.classList.add("matecho-article-card__animating");
          document.body.appendChild(parent);
          document.body.style.overflow = "hidden";
          requestAnimationFrame(() => {
            main.style.opacity = "0";
            document.body.classList.add("matecho-article-animation__running");
            Object.assign((parent as HTMLElement).style, {
              height: "",
              width: "",
              left: "",
              top: ""
            });
          });
          document.addEventListener(
            "pjax:complete",
            () => {
              document.body.style.overflow = "";
              (parent as HTMLElement).style.position = "absolute";
              const main = document.querySelector("#matecho-pjax-main");
              if (
                !main ||
                !main.parentElement ||
                main.querySelector("#matecho-password-form")
              ) {
                parent.remove();
                return;
              }
              const ob = new MutationObserver(() => {
                if (!main.parentElement) {
                  ob.disconnect();
                  parent.remove();
                  return;
                }
              });
              ob.observe(main.parentElement, {
                childList: true
              });
              document
                .querySelector("#matecho-pjax-main")
                ?.addEventListener("animationend", () => {
                  parent.remove();
                  ob.disconnect();
                  document.body.classList.remove(
                    "matecho-article-animation__running"
                  );
                });
            },
            { once: true }
          );
        });
      });
    });
}
