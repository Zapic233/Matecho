import type Pjax from "pjax";

interface IGlobal {
  pjax: Pjax | null;
}

// This export is required to share global variables to prevent circular dependencies.
// Circular dependencies will break Vite HMR.
export const mGlobal = {
  pjax: null
} as IGlobal;
