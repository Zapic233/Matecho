declare module "*.css";
declare module "virtual:prismjs" {
  export default await import("prismjs");
}

declare interface PjaxSuccessEvent extends Event {
  scrollPos: [number, number];
  backward: boolean;
}

declare interface PjaxErrorEvent extends Event {
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
    Prism: boolean;
    KaTeX: boolean;
  };
}

declare const __BUILD_DATE__: string;
declare const __BUILD_COMMIT_ID__: string;
