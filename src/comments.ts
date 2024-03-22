import type { Button } from "mdui";

function init() {
    const list = document.querySelector("#matecho-comment-list")!;
    const formWrapper = document.querySelector(".matecho-comment-form")! as HTMLDivElement;
    const form = formWrapper.querySelector("form")! as HTMLFormElement;
    const cancelReplyBtn = document.querySelector(".matecho-comment-form .matecho-comment-cancel-btn")! as Button;
    const CommentHeader = document.querySelector(".matecho-comment-form-title")! as HTMLDivElement;

    cancelReplyBtn.addEventListener("click", () => {
        CommentHeader.innerText = "发表评论";
        formWrapper.classList.remove("matecho-comment-form__reply");
        form.querySelector("input[name=parent]")?.remove();
    });

    list.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const replyId = target.getAttribute?.("data-to-comment")
        if (typeof replyId !== "string") return;
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
    });
}

document.addEventListener("DOMContentLoaded", () => init());