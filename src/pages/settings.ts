import { setColorScheme } from "mdui/functions/setColorScheme";

function handleColorSchemeUpdate() {
  const colorInput = document.querySelector<HTMLInputElement>(
    "input[name=ColorScheme]"
  )!;
  const cssInput = document.querySelector<HTMLInputElement>(
    "input[name=ColorSchemeCSS]"
  )!;
  const color = colorInput.value;
  if (!/^#[0-9a-f]{6}$/i.test(color)) {
    cssInput.value = "";
    return;
  }

  setColorScheme(color, {
    target: "#matecho-theme-handler"
  });

  const colorStyle = document.querySelector<HTMLStyleElement>(
    "style[id^=mdui-custom-color-scheme-]"
  );
  if (!colorStyle) throw Error("Color scheme style not found.");
  const id = colorStyle.id;
  const style = colorStyle.innerText.replaceAll(
    "." + id,
    ".matecho-theme-scheme"
  );
  cssInput.value = style;
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("form")
    ?.addEventListener("submit", handleColorSchemeUpdate);
});
