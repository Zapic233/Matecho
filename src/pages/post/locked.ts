import type { TextField, Button } from "mdui";
import { mGlobal } from "@/utils/global";

export function handlePasswordForm(form: HTMLFormElement) {
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
