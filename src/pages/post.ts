import type { TextField, Button } from "mdui";
import { Snackbar } from "mdui/components/snackbar";

import "/src/style/post.css";
import "virtual:components/post";
import { mGlobal } from "../utils/global";
import ClipboardJS from "clipboard";

import "mdui/components/button-icon";
import "@mdui/icons/copy-all";

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
      formWrapper.classList.add("matecho-form__loading");
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
          formWrapper.classList.remove("matecho-form__loading");
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

function handlePasswordForm(form: HTMLFormElement) {
  const input = form.querySelector<TextField>("mdui-text-field")!;
  const submit = form.querySelector<Button>("mdui-button[type=submit]")!;
  form.addEventListener("submit", e => e.preventDefault());
  submit.addEventListener("click", () => {
    input.setCustomValidity("");
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    form.classList.add("matecho-form__loading");
    void fetch(form.action, {
      body: data,
      method: "POST",
      credentials: "same-origin"
    })
      .then(async resp => {
        if (resp.status === 200) {
          const pjax = mGlobal.pjax!;
          pjax.handleResponse(
            await resp.text(),
            new XMLHttpRequest(), // dummy XHR
            window.location.href,
            {
              ...pjax.options,
              history: false
            }
          );
        } else {
          input.setCustomValidity("密码错误");
        }
      })
      .finally(() => {
        form.classList.remove("matecho-form__loading");
      });
  });
}

export function init() {
  initComments();
  const article = document.querySelector<HTMLElement>("article.mdui-prose");
  if (article) {
    article.querySelectorAll("pre").forEach(el => {
      const codeEl = el.querySelector("code");
      if (!codeEl) return;
      const wrapper = Object.assign(document.createElement("div"), {
        className: "matecho-code-action-wrapper"
      } as Partial<HTMLDivElement>);
      const copyBtn = document.createElement("mdui-button-icon");
      copyBtn.addEventListener("click", () => {
        ClipboardJS.copy(codeEl.innerText);
        openSnackbar("已复制到剪切板");
      });
      copyBtn.appendChild(document.createElement("mdui-icon-copy-all"));
      wrapper.appendChild(copyBtn);
      el.appendChild(wrapper);
    });
    if (
      window.__MATECHO_OPTIONS__.Prism &&
      article.querySelector("pre > code[class*=lang-]")
    ) {
      initPrism(article);
    }
    if (window.__MATECHO_OPTIONS__.FancyBox && article.querySelector("img")) {
      initFancybox(article);
    }
    if (window.__MATECHO_OPTIONS__.KaTeX) {
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
  const password = document.querySelector<HTMLFormElement>(
    "form#matecho-password-form"
  );
  if (password) {
    handlePasswordForm(password);
  }
}
