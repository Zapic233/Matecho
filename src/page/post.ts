import type { TextField, Button } from "mdui";
import { Snackbar } from "mdui/components/snackbar";

import "virtual:components/post";

function openSnackbar(msg: string) {
    const sb = new Snackbar();
    sb.textContent = msg;
    document.body.appendChild(sb);
    sb.placement = "bottom-end";
    sb.addEventListener("closed", () => {
        sb.remove();
    }, { once: true });
    setTimeout(() => {sb.open = true});
}

export function init() {
    const list = document.querySelector("#matecho-comment-list")!;
    const formWrapper = document.querySelector(".matecho-comment-form")! as HTMLDivElement;
    const form = formWrapper.querySelector("form")! as HTMLFormElement;
    const cancelReplyBtn = document.querySelector(".matecho-comment-form .matecho-comment-cancel-btn")! as Button;
    const submitBtn = document.querySelector(".matecho-comment-form .matecho-comment-submit-btn") as Button;
    const CommentHeader = document.querySelector(".matecho-comment-form-title")! as HTMLDivElement;

    const clearFormReplyState = () => {
        CommentHeader.innerText = "发表评论";
        formWrapper.classList.remove("matecho-comment-form__reply");
        form.querySelector("input[name=parent]")?.remove();
        list.after(formWrapper);
    }

    cancelReplyBtn.addEventListener("click", () => {
        clearFormReplyState();
    });

    list.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const replyId = target.getAttribute?.("data-to-comment")
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
    form.addEventListener("submit", (e) => e.preventDefault());
    submitBtn.addEventListener("click", () => {
        const token = (window as any).__MATECHO_ANTI_SPAM__;
        if (!token) return;
        if (form.reportValidity()) {
            const data = new FormData(form);
            data.set("_", token);
            formWrapper.classList.add("matecho-comment-form__loading")
            fetch(form.action, {
                body: data,
                method: "POST",
                credentials: "same-origin"
            }).then(async (e) => {
                const resp = await e.text();
                const root = Object.assign(document.createElement("html"), {
                    innerHTML: resp
                }) as HTMLHtmlElement;
                if (e.status === 200) {
                    const currentRoot = document.getElementById("matecho-comment-list");
                    if (!currentRoot) return location.reload();
                    root.querySelectorAll("#matecho-comment-list .matecho-comment-wrapper").forEach(v => {
                        if (!document.getElementById(v.id)) {
                            if (v.classList.contains("matecho-comment-child")) {
                                const parentId = v.parentElement?.parentElement?.id || "";
                                const parent = document.getElementById(parentId);
                                if (!parent) {
                                    return location.reload();
                                }
                                const parentList = parent.querySelector(".matecho-comment-children-list");
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
                    const errMsg = (root.querySelector(".container") as HTMLDivElement)?.innerText;
                    openSnackbar(errMsg || "无法发送评论, 请检查网络连接.");
                }
            }).catch(async (e) => {
                openSnackbar("无法发送评论, 请检查网络连接.");
            }).finally(() => {
                formWrapper.classList.remove("matecho-comment-form__loading")
            });
        }
    });
    import("virtual:prismjs").then(async ({ default: Prism }) => {
        Prism.highlightAll();
    });
}