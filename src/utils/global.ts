import { Snackbar } from "mdui/components/snackbar";
import type Pjax from "pjax";

interface IGlobal {
  pjax: Pjax | null;
}

// This export is required to share global variables to prevent circular dependencies.
// Circular dependencies will break Vite HMR.
export const mGlobal = {
  pjax: null
} as IGlobal;

export function openSnackbar(msg: string) {
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
