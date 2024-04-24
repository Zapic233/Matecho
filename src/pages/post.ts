import type { TextField, Button } from "mdui";
import { Snackbar } from "mdui/components/snackbar";

import "@/style/post.css";
import "virtual:components/post";
import { mGlobal } from "@/utils/global";
import { PrismLangs, PrismVue } from "@/utils/prism";
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

function cloneCommentForm() {
  const node = document
    .querySelector(".matecho-comment-form__main")
    ?.cloneNode(true) as HTMLDivElement;
  if (!node) throw new Error("Main comment form not found.");
  node.classList.remove("matecho-comment-form__main");
  node.querySelector<TextField>("[name=text]")!.value = "";
  node.removeAttribute("id");
  initCommentForm(node);
  return node;
}

function animateInCommentForm(formWrapper: HTMLElement) {
  const h = document
    .querySelector(".matecho-comment-form__main")!
    .getBoundingClientRect().height;
  formWrapper.style.setProperty("--m-height", h + "px");
  formWrapper.addEventListener("animationend", () => {
    formWrapper.classList.remove("matecho-comment-form__in");
  });
  formWrapper.classList.add("matecho-comment-form__in");
}

function animateOutCommentForm(formWrapper: HTMLElement) {
  const h = formWrapper.getBoundingClientRect().height;
  formWrapper.style.setProperty("--m-height", h + "px");
  formWrapper.addEventListener("animationend", () => {
    formWrapper.remove();
  });
  formWrapper.classList.add("matecho-comment-form__out");
}

function initCommentForm(formWrapper: HTMLDivElement) {
  const form = formWrapper.querySelector<HTMLFormElement>("form")!;
  const submitBtn = formWrapper.querySelector<Button>(
    ".matecho-comment-submit-btn"
  )!;
  const cancelBtn = formWrapper.querySelector<Button>(
    ".matecho-comment-cancel-btn"
  )!;
  form.addEventListener("submit", e => e.preventDefault());
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  submitBtn.addEventListener("click", async () => {
    const commentList = document.querySelector(
      "#matecho-comment-list"
    ) as HTMLDivElement;
    const token = window.__MATECHO_ANTI_SPAM__;
    if (!token) return;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    data.set("_", token);
    formWrapper.classList.add("matecho-form__loading");
    try {
      const req = await fetch(form.action, {
        body: data,
        method: "POST",
        credentials: "same-origin"
      });
      const resp = await req.text();
      const root = Object.assign(document.createElement("html"), {
        innerHTML: resp
      }) as HTMLHtmlElement;
      if (req.status === 200) {
        if (!commentList) return location.reload();
        root
          .querySelectorAll("#matecho-comment-list .matecho-comment-wrapper")
          .forEach(v => {
            if (!commentList.querySelector("#" + v.id)) {
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
                commentList.appendChild(v);
              }
            }
          });

        if (formWrapper.classList.contains("matecho-comment-form__reply")) {
          animateOutCommentForm(formWrapper);
        } else {
          const contentField = formWrapper.querySelector(
            "[name=text]"
          ) as TextField;
          // set required to false before clear text, prevent error message
          contentField.required = false;
          contentField.value = "";
          setTimeout(() => {
            contentField.required = true;
          });
        }
        commentList.querySelector("#matecho-no-comment-placeholder")?.remove();
      } else {
        const errMsg = (root.querySelector(".container") as HTMLDivElement)
          ?.innerText;
        openSnackbar(errMsg || "无法发送评论, 请检查网络连接.");
      }
    } catch (e) {
      openSnackbar("无法发送评论, 请检查网络连接.");
    } finally {
      formWrapper.classList.remove("matecho-form__loading");
    }
  });
  cancelBtn.addEventListener("click", () => {
    animateOutCommentForm(formWrapper);
  });
}

function initComments(el: HTMLElement) {
  const list = el.querySelector("#matecho-comment-list")!;
  if (!list) return;
  const mainFormWrapper = el.querySelector<HTMLDivElement>(
    ".matecho-comment-form"
  )!;
  initCommentForm(mainFormWrapper);
  list.addEventListener("click", e => {
    if (mainFormWrapper.classList.contains("matecho-comment-form__lock")) {
      return;
    }
    const target = e.target as HTMLElement;
    const replyId = target.getAttribute?.("data-to-comment");
    if (typeof replyId !== "string") return;
    if (document.querySelector("#reply-to-" + replyId)) return;
    const formWrapper = cloneCommentForm();
    const form = formWrapper.querySelector<HTMLFormElement>("form")!;
    const CommentHeader = formWrapper.querySelector<HTMLDivElement>(
      ".matecho-comment-form-title"
    )!;
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
    formWrapper.id = "reply-to-" + replyId;
    (e.target as HTMLElement).parentElement!.parentElement!.after(formWrapper);
    animateInCommentForm(formWrapper);
  });
}

export function initPrism(container: HTMLElement) {
  void import("@/style/prism.css");
  void import("virtual:prismjs").then(({ default: Prism }) => {
    PrismVue(Prism);
    Prism.highlightAllUnder(container);
  });
}

function initFancybox(container: HTMLElement) {
  void import("@fancyapps/ui/dist/fancybox/fancybox.css");
  void Promise.all([
    import("@fancyapps/ui"),
    import("@fancyapps/ui/l10n/Fancybox/zh_CN")
  ]).then(([{ Fancybox: fb }, { zh_CN }]) => {
    container.querySelectorAll<HTMLImageElement>("img").forEach(v => {
      v.setAttribute("data-fancybox", "article");
      if (v.alt ?? v.title) {
        v.setAttribute("data-caption", v.alt ?? v.title);
      }
    });
    fb.bind("[data-fancybox]", {
      l10n: zh_CN
    });
  });
}

export function initShiki(container: HTMLElement) {
  void Promise.all([
    import("shiki/core"),
    import("shiki/langs"),
    import("shiki/themes"),
    import("shiki/onig.wasm?init")
  ]).then(
    async ([
      { createdBundledHighlighter },
      { bundledLanguages, bundledLanguagesAlias },
      { bundledThemes },
      { default: initWasm }
    ]) => {
      const blocks = container.querySelectorAll<HTMLPreElement>(
        "pre code[class*=lang-]"
      );
      const requireLangs = new Set<string>();
      blocks.forEach(el => {
        const lang = /lang-(\w+)/.exec(el.className)?.[1] || "";
        if (lang in bundledLanguages || lang in bundledLanguagesAlias) {
          requireLangs.add(lang);
        }
      });
      const hl = await createdBundledHighlighter(
        bundledLanguages,
        bundledThemes,
        initWasm
      )({
        langs: Array.from(requireLangs),
        themes: ["solarized-light", "solarized-dark"]
      });

      blocks.forEach(el => {
        const lang = /lang-(\w+)/.exec(el.className)?.[1];
        if (!lang) return;
        const result = hl.codeToHtml(el.innerText, {
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
  );
}

export function initKaTeX(container: HTMLElement) {
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
  setTimeout(() => {
    input.focus();
  });
}

function initCodeBlockAction(wrapper: HTMLElement) {
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
      const lang = PrismLangs[codeLang.substring(5)] ?? PrismLangs.none;
      wrapper.appendChild(
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
  });
}

export function init(el: HTMLElement) {
  initComments(el);
  const article = el.querySelector<HTMLElement>("article.mdui-prose");
  const { Highlighter, FancyBox, KaTeX } = window.__MATECHO_OPTIONS__;
  if (article) {
    initCodeBlockAction(article);
    if (article.querySelector("pre > code[class*=lang-]")) {
      if (Highlighter == "Prism") {
        initPrism(article);
      } else if (Highlighter == "Shiki") {
        initShiki(article);
      }
    }
    if (FancyBox && article.querySelector("img")) {
      initFancybox(article);
    }
    if (KaTeX) {
      const count$ = countMoney(article.innerText);
      if (article.innerText.includes("$")) {
        const excludeText = Array.from(
          article.querySelectorAll<HTMLElement>(
            "script, noscript, style, textarea, pre, code, option"
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
