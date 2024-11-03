import "@mdui/icons/person--rounded";

export const init = () => {
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
