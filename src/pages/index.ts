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
          let pSize = parent.getBoundingClientRect();
          const placeholder = document.createElement("div");
          const abort = new AbortController();
          Object.assign(placeholder.style, {
            display: "block",
            height: pSize.height + "px",
            width: pSize.width + "px"
          });
          document.addEventListener(
            "scroll",
            () => {
              pSize = parent.getBoundingClientRect();
            },
            {
              signal: abort.signal
            }
          );
          document.addEventListener(
            "resize",
            () => {
              pSize = parent.getBoundingClientRect();
            },
            {
              signal: abort.signal
            }
          );
          document.addEventListener(
            "pjax:complete",
            () => {
              abort.abort();
              parent.after(placeholder);
              Object.assign((parent as HTMLElement).style, {
                height: pSize.height + "px",
                width: pSize.width + "px",
                left: pSize.left + "px",
                top: pSize.top + "px"
              });
              parent.classList.add("matecho-article-card__animating");
              if (pSize.top < 220) {
                parent.classList.add("matecho-article-card__reverse");
              }
              document.body.appendChild(parent);
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
              (parent as HTMLElement).style.position = "absolute";
              const articleMain = document.querySelector("#matecho-pjax-main");
              if (
                !articleMain ||
                !articleMain.parentElement ||
                !articleMain.querySelector(".matecho-article-cover")
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
              document.querySelector("#matecho-pjax-main")?.addEventListener(
                "animationend",
                () => {
                  parent.remove();
                  ob.disconnect();
                  document.body.classList.remove(
                    "matecho-article-animation__running"
                  );
                },
                {
                  once: true
                }
              );
            },
            { once: true }
          );
        });
      });
    });
}
