import type {
  NavigationDrawer,
  Button,
  ButtonIcon,
  TextField,
  LayoutMain,
  TopAppBar
} from "mdui";

import "virtual:uno.css";
import { observeResize } from "mdui/functions/observeResize";
import { breakpoint } from "mdui/functions/breakpoint";
import { mGlobal } from "@/utils/global";
import Pjax from "pjax";
import np from "nprogress";

import "@/utils/polyfill";
import "@mdui/icons/insert-drive-file";
import "@mdui/icons/link";

import "virtual:components/header";
import "virtual:components/functions";
import "virtual:components/sidebar";
import "virtual:components/footer";

interface IInit {
  init?: (el: HTMLElement) => void | Promise<void>;
}

function loadPageScript(type: string): Promise<IInit> {
  switch (type) {
    case "post":
    case "page":
      return import("@/pages/post");
    default:
      return import("@/pages/index");
  }
}

function toHexColor(color: string): string {
  return (
    "#" +
    color
      .split(",")
      .map(v =>
        parseInt(v.replace("rgb(", "").replace(")", "").trim()).toString(16)
      )
      .join("")
  );
}

function ExSearchIntegration(pjax: Pjax) {
  window.ExSearchCall = item => {
    if (item && item.length) {
      const url = item.attr("data-url");
      if (url) {
        document.querySelector<HTMLElement>(".ins-close")?.click();
        pjax.loadUrl(url);
      }
    }
  };
}

function initOnce() {
  // app bar title will have animation in first time loaded
  setTimeout(() => {
    document
      .getElementById("matecho-app-bar-title")
      ?.style.setProperty("display", "");
  }, 300);
  // Drawer
  const drawer = document.querySelector<NavigationDrawer>("#matecho-drawer");
  const topBtn = document.querySelector<Button>("#matecho-drawer-btn");
  const mainWrapper = document.querySelector<LayoutMain>("#matecho-main");

  if (!drawer || !topBtn || !mainWrapper)
    throw Error("Required element not found.");

  topBtn.addEventListener("click", () => {
    drawer.open = !drawer.open;
  });

  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')!.content =
    toHexColor(
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("background-color")
    );

  // Search bar
  const searchBtn = document.querySelector(
    "#matecho-top-search-btn"
  ) as ButtonIcon;
  const searchInput = document.querySelector(
    "#matecho-top-search-bar"
  ) as TextField;
  searchBtn.addEventListener("click", () => {
    if (searchInput.disabled) {
      searchInput.disabled = false;
      setTimeout(() => searchInput.focus(), 0);
    } else {
      (searchInput.parentElement as HTMLFormElement).requestSubmit();
    }
  });

  searchInput.addEventListener("blur", () => {
    if (!searchInput.value) {
      searchInput.disabled = true;
    }
  });

  const signal = {
    resolve: undefined as unknown as (value: string) => void,
    promise: undefined as unknown as Promise<string>
  };

  let PjaxBackward = false;

  mGlobal.pjax = new Pjax({
    selectors: [
      "title",
      "#matecho-pjax-main",
      "#matecho-app-bar-title__inner",
      "#matecho-sidebar-list",
      "meta[name=matecho-template]"
    ],
    cacheBust: false,
    switches: {
      "meta[name=matecho-template]": function (oldEl: Element, el: Element) {
        signal.resolve((el as HTMLMetaElement).content);
        oldEl.replaceWith(el);
        this.onSwitch(oldEl, el);
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      "#matecho-pjax-main": async function (oldEl: Element, el: Element) {
        const type = await signal.promise;
        const scripts = await loadPageScript(type);
        oldEl.replaceWith(el);
        const wrapper = document.querySelector("#matecho-pjax-main");
        if (wrapper) {
          const className = PjaxBackward ? "slide-out" : "slide-in";
          wrapper.addEventListener(
            "animationend",
            () => {
              wrapper.classList.remove(className);
            },
            { once: true }
          );
          wrapper.classList.add(className);
        }
        await scripts.init?.(el as HTMLDivElement);
        this.onSwitch(oldEl, el);
      }
    }
  });

  document.addEventListener("pjax:success", (() => {
    void init();
  }) as EventListener);

  document.addEventListener("pjax:complete", e => {
    const scrollPos = (e as PjaxEvent).scrollPos;
    if (scrollPos) {
      setTimeout(() => {
        document.scrollingElement?.scrollTo({
          left: scrollPos[0],
          top: scrollPos[1]
        });
      }, 0);
    }
    np.done();
  });
  document.addEventListener("pjax:send", e => {
    PjaxBackward = (e as PjaxEvent).backward === true;
    np.start();
    if (breakpoint().down("md")) {
      drawer.open = false;
    }
    signal.promise = new Promise<string>(resolve => {
      signal.resolve = resolve;
    });
  });

  document.addEventListener("pjax:error", ((e: PjaxEvent) => {
    const newUrl = e.request?.responseURL;
    if (newUrl) {
      location.href = newUrl;
    } else {
      location.reload();
    }
  }) as EventListener);

  const type = (
    document.querySelector("meta[name=matecho-template]") as HTMLMetaElement
  ).content;

  ExSearchIntegration(mGlobal.pjax);

  void loadPageScript(type)
    .then(i => {
      return i.init?.(document.querySelector("#matecho-pjax-main")!);
    })
    .then(() => init());
}

function handleLabelShrink(el: HTMLElement) {
  const appBar = document.querySelector("#matecho-app-bar") as TopAppBar;
  const inner = el.querySelector(
    "#matecho-app-bar-large-label__inner"
  ) as HTMLElement;
  if (!inner) return;
  const labelShrinkOb = new MutationObserver(() => {
    if (!document.body.contains(el)) {
      labelShrinkOb.disconnect();
      ro.unobserve();
      return;
    }
    if (appBar.shrink) {
      el.classList.add("shrink");
    } else {
      el.classList.remove("shrink");
    }
  });
  labelShrinkOb.observe(appBar, {
    attributes: true,
    attributeFilter: ["shrink"]
  });
  const ro = observeResize(inner, e => {
    const h = e.contentRect.height;
    const scroll = document.scrollingElement!;
    appBar.scrollThreshold = h / 2;
    if (h > scroll.scrollHeight - window.screen.availHeight) {
      appBar.scrollBehavior = undefined;
    } else {
      appBar.scrollBehavior = "shrink";
    }
  });
  np.configure({
    showSpinner: false,
    trickle: true
  });
}

function init() {
  const header = document.getElementById("matecho-app-bar-large-label");
  header && handleLabelShrink(header);
}

if (document.readyState !== "loading") {
  initOnce();
} else {
  document.addEventListener("DOMContentLoaded", () => initOnce());
}
console.log(
  `%c Matecho %c By Zapic \n`,
  "color: #fff; background: #E91E63; padding:5px 0;",
  "color: #000;background: #efefef; padding:5px 0;",
  `${__BUILD_COMMIT_ID__} @ ${__BUILD_DATE__} `
);
