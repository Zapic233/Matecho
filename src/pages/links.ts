import { openSnackbar } from "@/utils/global";
import "@mdui/icons/person--rounded";
import type { Button, Dialog, Fab, TextField } from "mdui";
import { breakpoint, observeResize } from "mdui";
import "virtual:components/page-links";
import "@/style/links.less";
import { sendComment } from "@/main";

const handleLinkAvatarLoading = () => {
  const img = document.querySelectorAll<HTMLImageElement>(
    "img.matecho-link-avatar"
  );
  img.forEach(imgEl => {
    const name = imgEl.getAttribute("name");
    const span = name
      ? document.createElement("span")
      : document.createElement("mdui-icon-person--rounded");
    if (name) {
      span.textContent = name.substring(0, 1).toUpperCase();
    }
    imgEl.style.display = "none";
    imgEl.after(span);
    if (imgEl.height != 0) {
      imgEl.style.display = "";
      span.remove();
    } else {
      imgEl.addEventListener("load", () => {
        imgEl.style.display = "";
        span.remove();
      });
    }
  });
};

const handleLinkApplication = () => {
  const linksAddFab = document.querySelector<Fab>(
    "#matecho-links-add__wrapper mdui-fab"
  );
  const dialog = document.querySelector<Dialog>("#matecho-links-add-dialog");

  const form = document.querySelector<HTMLFormElement>(
    "#matecho-link-add-form"
  );
  if (!linksAddFab || !dialog || !form) return;

  const ob = observeResize(document.body, () => {
    linksAddFab.extended = breakpoint().up("sm");
  });

  document.querySelector("#matecho-pjax-main")?.after(linksAddFab.parentElement!);
  document.addEventListener(
    "pjax:send",
    () => {
      document.addEventListener(
        "pjax:complete",
        () => {
          linksAddFab.parentElement!.remove();
          ob.unobserve();
        },
        { once: true }
      );
    },
    { once: true }
  );
  linksAddFab.addEventListener("click", () => {
    dialog.open = true;
  });
  const author = form.querySelector<TextField>("[name=author]");
  const mail = form.querySelector<TextField>("[name=mail]");
  const url = form.querySelector<TextField>("[name=url]");
  const avatarUrl = form.querySelector<TextField>("[name=avatar-url]");
  const description = form.querySelector<TextField>("[name=description]");
  const namePreview = document.querySelector<HTMLSpanElement>(
    "#matecho-link-preview__name"
  );
  const descriptionPreview = document.querySelector<HTMLSpanElement>(
    "#matecho-link-preview__description"
  );
  const avatarPreview = document.querySelector<HTMLImageElement>(
    "#matecho-link-preview__avatar"
  );
  const cancelBtn = document.querySelector<Button>(
    "#matecho-links-add-cancel"
  );
  const submitBtn = document.querySelector<Button>(
    "#matecho-links-add-submit"
  );
  if (
    !author ||
    !mail ||
    !url ||
    !descriptionPreview ||
    !avatarPreview ||
    !description ||
    !namePreview ||
    !avatarUrl ||
    !cancelBtn ||
    !submitBtn
  ) {
    return;
  }
  author.addEventListener("input", () => {
    namePreview.textContent = author.value;
  });
  description.addEventListener("input", () => {
    descriptionPreview.textContent = description.value;
  });
  avatarUrl.addEventListener("input", () => {
    avatarPreview.src = avatarUrl.value;
    avatarPreview.style.display = "none";
  });
  avatarPreview.style.display = "none";
  avatarPreview.addEventListener("load", () => {
    avatarPreview.style.display = "";
  });

  cancelBtn.addEventListener("click", () => {
    dialog.open = false;
  });
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  submitBtn.addEventListener("click", async () => {
    if (!form.reportValidity()) return;
    submitBtn.loading = true;
    const data = new FormData(form);
    data.delete("avatar-url");
    data.delete("description");
    data.set(
      "text",
      `
头像地址: ${avatarUrl.value}
描述: ${description.value}`
    );
    try {
      const { success, error } = await sendComment(form.action, data);
      if (success) {
        openSnackbar("申请成功, 请等待审核");
        dialog.open = false;
      } else {
        openSnackbar(error || "无法发送申请, 请检查网络连接.");
      }
    } catch (_) {
      openSnackbar("无法发送申请, 请检查网络连接.");
    } finally {
      submitBtn.loading = false;
    }
  });

  dialog.addEventListener("open", () => {
    form.reset();
    avatarPreview.src = "";
    descriptionPreview.textContent = "";
    namePreview.textContent = "";
  });
};

let currentReplyId = "";
const replyApplication = (id: string) => {
  if (!id) return;
  const dialog = document.querySelector<Dialog>("#matecho-links-reply-dialog");
  if (!dialog) return;
  dialog.open = true;
  currentReplyId = id;
};

const handleReplyApplication = () => {
  const dialog = document.querySelector<Dialog>("#matecho-links-reply-dialog");
  if (!dialog) return;
  const form = document.querySelector<HTMLFormElement>(
    "#matecho-link-reply-form"
  );
  const replyBtn = document.querySelectorAll<Button>(
    ".matecho-links-application__reply"
  );
  replyBtn.forEach(el => {
    el.addEventListener("click", () => {
      replyApplication(el.getAttribute("data-to-comment") || "");
      form?.reset();
    });
  });
  const cancel = document.querySelector<Button>("#matecho-links-reply-cancel");
  const submit = document.querySelector<Button>("#matecho-links-reply-submit");
  if (!cancel || !submit) return;
  cancel.addEventListener("click", () => {
    dialog.open = false;
  });
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  submit.addEventListener("click", async () => {
    if (!form) return;
    const data = new FormData(form);
    data.set("parent", currentReplyId);
    submit.loading = true;
    try {
      const { success, error } = await sendComment(form.action, data);
      if (success) {
        dialog.open = false;
        document.querySelector("#comment-" + currentReplyId)?.remove();
        openSnackbar("回复成功.");
      } else {
        openSnackbar(error || "无法发送回复, 请检查网络连接.");
      }
    } catch (_) {
      openSnackbar("无法发送申请, 请检查网络连接.");
    } finally {
      submit.loading = false;
    }
  });
};

export const init = () => {
  handleLinkAvatarLoading();
  handleLinkApplication();
  handleReplyApplication();
};
