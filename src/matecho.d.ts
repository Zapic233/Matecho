/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="jquery" />
/// <reference types="prismjs" />

declare module "virtual:prismjs" {
  export default Prism;
}

declare interface PjaxEvent extends Event {
  scrollPos: [number, number];
  backward: boolean;
  request?: XMLHttpRequest;
}

declare global {
  interface Document {
    startViewTransition(
      updateCallback: () => Promise<void> | void
    ): ViewTransition;
  }

  interface ViewTransition {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
    skipTransition(): void;
  }

  interface CSSStyleDeclaration {
    viewTransitionName: string;
  }
}

declare interface Window {
  __MATECHO_ANTI_SPAM__: string;
  __MATECHO_OPTIONS__: {
    FancyBox: boolean;
    Highlighter: "Prism" | "Shiki" | "none";
    KaTeX: boolean;
    ExSearch: string;
  };
  ExSearchCall: (item: JQuery) => void;
}

declare const __BUILD_DATE__: string;
declare const __BUILD_COMMIT_ID__: string;
