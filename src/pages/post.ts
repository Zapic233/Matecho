import type { TextField, Button, ListItem } from "mdui";
import { Snackbar } from "mdui/components/snackbar";
import { observeResize } from "mdui/functions/observeResize";

import "/src/style/post.css";
import "virtual:components/post";

function openSnackbar(msg: string) {
  const sb = new Snackbar();
  sb.textContent = msg;
  document.body.appendChild(sb);
  sb.placement = "bottom-end";
  sb.addEventListener(
    "closed",
    () => {
      sb.remove();
    },
    { once: true }
  );
  setTimeout(() => {
    sb.open = true;
  });
}
function initComments() {
  const list = document.querySelector("#matecho-comment-list")!;
  if (!list) return;
  const formWrapper = document.querySelector<HTMLDivElement>(
    ".matecho-comment-form"
  )!;
  const form = formWrapper.querySelector<HTMLFormElement>("form")!;
  const cancelReplyBtn = document.querySelector<Button>(
    ".matecho-comment-form .matecho-comment-cancel-btn"
  )!;
  const submitBtn = document.querySelector<Button>(
    ".matecho-comment-form .matecho-comment-submit-btn"
  )!;
  const CommentHeader = document.querySelector<HTMLDivElement>(
    ".matecho-comment-form-title"
  )!;

  const clearFormReplyState = () => {
    CommentHeader.innerText = "发表评论";
    formWrapper.classList.remove("matecho-comment-form__reply");
    form.querySelector("input[name=parent]")?.remove();
    list.after(formWrapper);
  };

  cancelReplyBtn.addEventListener("click", () => {
    clearFormReplyState();
  });

  list.addEventListener("click", e => {
    const target = e.target as HTMLElement;
    const replyId = target.getAttribute?.("data-to-comment");
    if (typeof replyId !== "string") return;
    clearFormReplyState();
    CommentHeader.innerText = "回复 ";
    CommentHeader.appendChild(
      Object.assign(document.createElement("a"), {
        href: "#comment-" + replyId,
        innerText: "#" + replyId
      })
    );
    form.appendChild(
      Object.assign(document.createElement("input"), {
        name: "parent",
        value: replyId,
        type: "hidden"
      })
    );
    formWrapper.classList.add("matecho-comment-form__reply");
    (e.target as HTMLElement).parentElement!.parentElement!.after(formWrapper);
  });
  form.addEventListener("submit", e => e.preventDefault());
  submitBtn.addEventListener("click", () => {
    const token = window.__MATECHO_ANTI_SPAM__;
    if (!token) return;
    if (form.reportValidity()) {
      const data = new FormData(form);
      data.set("_", token);
      formWrapper.classList.add("matecho-comment-form__loading");
      fetch(form.action, {
        body: data,
        method: "POST",
        credentials: "same-origin"
      })
        .then(async e => {
          const resp = await e.text();
          const root = Object.assign(document.createElement("html"), {
            innerHTML: resp
          }) as HTMLHtmlElement;
          if (e.status === 200) {
            const currentRoot = document.getElementById("matecho-comment-list");
            if (!currentRoot) return location.reload();
            root
              .querySelectorAll(
                "#matecho-comment-list .matecho-comment-wrapper"
              )
              .forEach(v => {
                if (!document.getElementById(v.id)) {
                  if (v.classList.contains("matecho-comment-child")) {
                    const parentId = v.parentElement?.parentElement?.id || "";
                    const parent = document.getElementById(parentId);
                    if (!parent) {
                      return location.reload();
                    }
                    const parentList = parent.querySelector(
                      ".matecho-comment-children-list"
                    );
                    if (!parentList) {
                      parent.lastElementChild!.before(v.parentElement!); // Parent list
                    } else {
                      parentList.appendChild(v);
                    }
                  } else {
                    currentRoot.appendChild(v);
                  }
                }
              });

            (formWrapper.querySelector("[name=text]") as TextField).value = "";
            document.getElementById("matecho-no-comment-placeholder")?.remove();
            clearFormReplyState();
          } else {
            const errMsg = (root.querySelector(".container") as HTMLDivElement)
              ?.innerText;
            openSnackbar(errMsg || "无法发送评论, 请检查网络连接.");
          }
        })
        .catch(() => {
          openSnackbar("无法发送评论, 请检查网络连接.");
        })
        .finally(() => {
          formWrapper.classList.remove("matecho-comment-form__loading");
        });
    }
  });
}

function initPrism(container: HTMLElement) {
  void import("/src/style/prism.css");
  void import("virtual:prismjs").then(({ default: Prism }) => {
    Prism.highlightAllUnder(container);
  });
}

function initFancybox(container: HTMLElement) {
  void import("@fancyapps/ui/dist/fancybox/fancybox.css");
  void import("@fancyapps/ui").then(({ Fancybox: fb }) => {
    container.querySelectorAll<HTMLImageElement>("img").forEach(v => {
      v.setAttribute("data-fancybox", "article");
      if (v.alt ?? v.title) {
        v.setAttribute("data-caption", v.alt ?? v.title);
      }
    });
    fb.bind("[data-fancybox]");
  });
}

function initKaTeX(container: HTMLElement) {
  void import("katex/dist/katex.css");
  void import("katex/contrib/auto-render").then(
    ({ default: renderMathInElement }) => {
      renderMathInElement(container, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ]
      });
    }
  );
}

function countMoney(str: string) {
  let count = -1;
  let index = -2;
  for (; index != -1; count++, index = str.indexOf("$", index + 1));
  return count;
}

function initSideNav() {
  const nav = document.querySelector<HTMLDivElement>(".matecho-article-nav")!;
  const navInner = nav.querySelector<HTMLDivElement>("mdui-list")!;
  const main = document.querySelector<HTMLDivElement>(
    ".matecho-article-wrapper"
  )!;
  const headlines = Array.from(
    document.querySelectorAll<HTMLElement>("article.mdui-prose h1,h2,h3,h4")
  );
  const ro = observeResize("#matecho-pjax-main", () => {
    nav.style.left = main.getBoundingClientRect().right + "px";
  });

  const headlineSort = Array.from(
    new Set(headlines.map(v => v.tagName).sort())
  );

  const largeLabel = document.getElementById(
    "matecho-app-bar-large-label"
  )! as HTMLDivElement;

  const headlinesMap = new Map<HTMLElement, ListItem>();

  headlines
    .filter(v => {
      return v.tagName == headlineSort[0] || v.tagName == headlineSort[1];
    })
    .forEach(el => {
      const isTopLevel = el.tagName == headlineSort[0];
      const item = Object.assign(
        document.createElement<never>("mdui-list-item" as never), // WTF
        {
          innerText: el.innerText,
          className: isTopLevel ? "matecho-nav-top" : "matecho-nav-sub"
        }
      ) as ListItem;

      item.addEventListener("click", () => {
        let offset = window.scrollY - 72;
        if (!largeLabel.classList.contains("shrink")) {
          offset -= parseFloat(largeLabel.style.height) + 32;
        }
        document.scrollingElement?.scrollTo({
          top: el.getBoundingClientRect().top + offset,
          behavior: "smooth"
        });
      });
      navInner.appendChild(item as never);
      headlinesMap.set(el, item);
    });

  if (headlines.length == 0) return;
  let throttler = 0;
  const scrollHandler = () => {
    if (throttler > 0) return;
    throttler = setTimeout(() => {
      let activeTarget = null;
      for (const head of Array.from(headlinesMap.keys())) {
        headlinesMap.get(head)!.active = false;
        if (head.getBoundingClientRect().top < window.innerHeight / 3) {
          activeTarget = headlinesMap.get(head)!;
        }
      }
      if (activeTarget) {
        activeTarget.active = true;
      }
      throttler = 0;
    }, 50) as unknown as number;
  };
  main.classList.add("matecho-article-wrapper-with-nav");
  document.addEventListener("scroll", scrollHandler, { passive: true });
  document.body.appendChild(nav);
  nav.classList.add("matecho-nav-visible");
  let count = 0;
  const rafCb = () => {
    const l = main.getBoundingClientRect().right + "px";
    if (l == nav.style.left) {
      count += 1;
    }
    nav.style.left = l;
    count < 60 && requestAnimationFrame(rafCb);
  };
  rafCb();

  document.addEventListener(
    "pjax:complete",
    () => {
      ro.unobserve();
      document.removeEventListener("scroll", scrollHandler);
      nav.remove();
    },
    { once: true }
  );
}
export function init() {
  initComments();
  const article = document.querySelector<HTMLElement>("article.mdui-prose");
  initSideNav();
  if (article) {
    if (article.querySelector("pre > code[class*=lang-]")) {
      initPrism(article);
    }
    if (article.querySelector("img")) {
      initFancybox(article);
    }
    const count$ = countMoney(article.innerText);
    if (article.innerText.includes("$")) {
      const excludeText = Array.from(
        document.querySelectorAll<HTMLElement>(
          "script,noscript, style, textarea, pre, code, option"
        )
      )
        .map(v => v.innerText)
        .join("");
      const excluded$ = countMoney(excludeText);
      if (excluded$ < count$) {
        initKaTeX(article);
      }
    }
  }
}
