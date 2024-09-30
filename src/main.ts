import {
  type NavigationDrawer,
  type Button,
  type ButtonIcon,
  type TextField,
  type LayoutMain,
  type TopAppBar,
  Dropdown,
  List,
  ListItem
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

import "virtual:components-custom-icon";
import "virtual:components/header";
import "virtual:components/functions";
import "virtual:components/sidebar";
import "virtual:components/footer";
import type { IExSearchData } from "./utils/insight";
import { parseKeywords, search } from "./utils/insight";

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
  document.querySelector("#m-loading-wrapper")?.remove();
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

  document.addEventListener("pjax:send", () => {
    drawer.open = false;
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

  if (window.__MATECHO_OPTIONS__.ExSearch.length > 0) {
    void initExSearch(window.__MATECHO_OPTIONS__.ExSearch);
  } else {
    ExSearchIntegration(mGlobal.pjax);
  }

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

async function initExSearch(url: string) {
  function addMenuItem(
    title: string,
    desc: string,
    link?: string,
    keywords?: string
  ) {
    const el = new ListItem();
    const wrapper = Object.assign(document.createElement("div"), {
      slot: "custom"
    });
    el.appendChild(wrapper);
    const titleEl = Object.assign(document.createElement("div"), {
      innerHTML: title,
      className: "search-title"
    });
    const descEl = Object.assign(document.createElement("div"), {
      innerHTML: desc,
      className: "search-desc"
    });
    if (keywords) {
      const keyword = parseKeywords(keywords)
        .map(v => ({
          word: v,
          index: descEl.innerHTML.toUpperCase().indexOf(v)
        }))
        .sort((a, b) => a.index - b.index)[0];
      if (keyword.index != -1) {
        const s = descEl.innerHTML.substring(0, keyword.index).slice(-7);
        const w = descEl.innerHTML.substring(
          keyword.index,
          keyword.index + keyword.word.length
        );
        const e = descEl.innerHTML.substring(
          keyword.index + keyword.word.length
        );
        descEl.innerHTML = s + `<span class="search-keyword">${w}</span>` + e;
      }
    }
    wrapper.appendChild(titleEl);
    wrapper.appendChild(descEl);
    if (!link) {
      el.disabled = true;
    } else {
      el.addEventListener("click", () => {
        mGlobal.pjax?.loadUrl(link);
        dropdown.open = false;
      });
    }
    list.appendChild(el);
  }
  const searchbar = document.querySelector<TextField>(
    "#matecho-top-search-bar"
  );
  if (!searchbar) return;
  const data = (await (await fetch(url)).json()) as IExSearchData;
  const dropdown = new Dropdown();
  dropdown.trigger = "manual";
  dropdown.placement = "bottom-start";
  const list = new List();
  list.classList.add("search-menu");
  searchbar.after(dropdown);
  searchbar.slot = "trigger";
  dropdown.appendChild(searchbar);
  dropdown.appendChild(list);
  searchbar.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const el = list.querySelector<ListItem>("mdui-list-item[active]");
      if (el && dropdown.open) {
        el.click();
        searchbar.value = "";
        searchbar.blur();
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const el = list.querySelector<ListItem>("mdui-list-item[active]");
      if (!el) {
        (list.firstElementChild as ListItem).active = true;
      }
      if (el?.nextElementSibling) {
        (el.nextElementSibling as ListItem).active = true;
        el.active = false;
      } else if (el === list.lastElementChild) {
        (list.firstElementChild as ListItem).active = true;
        el!.active = false;
      }
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const el = list.querySelector<ListItem>("mdui-list-item[active]");
      if (!el) {
        (list.lastElementChild as ListItem).active = true;
      }
      if (el?.previousElementSibling) {
        (el.previousElementSibling as ListItem).active = true;
        el.active = false;
      } else if (el === list.firstElementChild) {
        (list.lastElementChild as ListItem).active = true;
        el!.active = false;
      }
    }
  });
  searchbar.addEventListener(
    "input",
    () => {
      if (searchbar.value.length == 0) return void (dropdown.open = false);
      list.innerHTML = "";
      const result = search(data, searchbar.value);
      result.posts.forEach(post => {
        addMenuItem(
          post.title || "无标题",
          post.text,
          post.path,
          searchbar.value
        );
      });
      result.pages.forEach(page => {
        addMenuItem(
          page.title || "无标题",
          page.text,
          page.path,
          searchbar.value
        );
      });
      result.tags.forEach(tag => {
        addMenuItem(tag.name, tag.slug, tag.permalink, searchbar.value);
      });
      result.categories.forEach(category => {
        addMenuItem(
          category.name,
          category.slug,
          category.permalink,
          searchbar.value
        );
      });
      if (list.childNodes.length == 0) {
        addMenuItem("无搜索结果", "尝试更换搜索词");
      }
      dropdown.open = true;
    },
    { passive: true }
  );
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
