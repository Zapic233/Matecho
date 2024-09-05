import "virtual:components/index";
import "@/style/index.less";

export function init() {
  document
    .querySelectorAll("mdui-card.matecho-article-card")
    .forEach(parent => {
      if (parent.getAttribute("data-article-hidden") !== null) {
        return;
      }
      parent.querySelectorAll("a[href]").forEach(href => {
        href.addEventListener("click", () => {
          const pSize = parent.getBoundingClientRect();
          const placeholder = document.createElement("div");
          const listMain =
            document.querySelector<HTMLDivElement>("#matecho-pjax-main")!;
          listMain.style.transition = ".1s";
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
          Object.assign(listMain.style, {
            opacity: "0",
            pointerEvents: "none"
          });
          document.body.classList.add("matecho-article-animation__running");
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              Object.assign((parent as HTMLElement).style, {
                height: "",
                width: "",
                left: "",
                top: ""
              });
            });
          });
          document.addEventListener(
            "pjax:complete",
            () => {
              document.body.style.overflow = "";
              (parent as HTMLElement).style.position = "absolute";
              const articleMain = document.querySelector("#matecho-pjax-main");
              if (
                !articleMain ||
                !articleMain.parentElement ||
                articleMain.querySelector("#matecho-password-form")
              ) {
                parent.remove();
                return;
              }
              const ob = new MutationObserver(() => {
                if (!articleMain.parentElement) {
                  ob.disconnect();
                  parent.remove();
                  return;
                }
              });
              ob.observe(articleMain.parentElement, {
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
