import type { TextField, Button } from "mdui";
import { openSnackbar } from "@/utils/global";
import { sendComment } from "@/main";

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
    data.set("receiveMail", "yes");
    formWrapper.classList.add("matecho-form__loading");
    try {
      const { success, error, root } = await sendComment(form.action, data);
      if (success) {
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
        openSnackbar(error || "无法发送评论, 请检查网络连接.");
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

export function initComments(el: HTMLElement) {
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
