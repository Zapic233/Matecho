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
import Pjax from "pjax";
import np from "nprogress";

import "./polyfill";
import "@mdui/icons/insert-drive-file";
import "@mdui/icons/link";

import "virtual:components/header";
import "virtual:components/functions";
import "virtual:components/sidebar";
import "virtual:components/footer";

function initOnce() {
  // Drawer
  const drawer = document.querySelector<NavigationDrawer>("#matecho-drawer");
  const topBtn = document.querySelector<Button>("#matecho-drawer-btn");
  const mainWrapper = document.querySelector<LayoutMain>("#matecho-main");

  if (!drawer || !topBtn || !mainWrapper)
    throw Error("Required element not found.");

  topBtn.addEventListener("click", () => {
    drawer.open = !drawer.open;
  });

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

  const mainWrapperPaddingWorkaround = new MutationObserver(() => {
    if (!drawer.open) {
      mainWrapper.style.padding = "64px 0 0";
    }
  });
  mainWrapperPaddingWorkaround.observe(mainWrapper, {
    attributes: true,
    attributeFilter: ["style"]
  });

  new Pjax({
    selectors: [
      "title",
      "#matecho-pjax-main",
      "#matecho-app-bar-title",
      "#matecho-sidebar-list",
      "meta[name=matecho-template]"
    ],
    cacheBust: false
  });

  document.addEventListener("pjax:success", ((e: PjaxSuccessEvent) => {
    const wrapper = document.querySelector("#matecho-pjax-main");
    if (wrapper) {
      const className = e.backward ? "slide-out" : "slide-in";
      wrapper.addEventListener(
        "animationend",
        () => {
          wrapper.classList.remove(className);
        },
        { once: true }
      );
      wrapper.classList.add(className);
    }
    void init();
  }) as EventListener);

  document.addEventListener("pjax:complete", () => {
    np.done();
  });
  document.addEventListener("pjax:send", () => {
    np.start();
    if (breakpoint().down("md")) {
      drawer.open = false;
    }
  });

  document.addEventListener("pjax:error", ((e: PjaxErrorEvent) => {
    const newUrl = e.request?.responseURL;
    if (newUrl) {
      location.href = newUrl;
    } else {
      location.reload();
    }
  }) as EventListener);

  void init();
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
      const o = appBar.scrollBehavior;
      el.addEventListener(
        "transitionend",
        () => {
          appBar.scrollBehavior = o;
        },
        { once: true }
      );
      el.classList.remove("shrink");
      appBar.scrollBehavior = undefined;
      document.scrollingElement!.scrollTop = 0;
    }
  });
  labelShrinkOb.observe(appBar, {
    attributes: true,
    attributeFilter: ["shrink"]
  });
  const ro = observeResize(inner, e => {
    const h = e.contentRect.height;
    const scroll = document.scrollingElement!;
    el.style.height = h + "px";
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

async function init() {
  const header = document.getElementById("matecho-app-bar-large-label");
  header && handleLabelShrink(header);

  const CurrentModule = document.querySelector(
    "meta[name=matecho-template]"
  ) as HTMLMetaElement;
  switch (CurrentModule.content) {
    case "post":
    case "page":
      (await import("./page/post")).init();
      break;
    default:
      import("./page/index");
  }
}

document.addEventListener("DOMContentLoaded", () => initOnce());

console.log(
  `%c Matecho %c By Zapic \n`,
  "color: #fff; background: #E91E63; padding:5px 0;",
  "color: #000;background: #efefef; padding:5px 0;",
  `${__BUILD_COMMIT_ID__} @ ${__BUILD_DATE__} `
);
