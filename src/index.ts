import { type NavigationDrawer, type Button, type ButtonIcon, type TextField, type LayoutMain, type TopAppBar, Switch } from "mdui";
import "virtual:uno.css";
import { setColorScheme } from "mdui/functions/setColorScheme";
import { observeResize } from "mdui/functions/observeResize";
import Pjax from "pjax";
import np from "nprogress";

import '@mdui/icons/insert-drive-file';

import "virtual:components/header";
import "virtual:components/functions";
import "virtual:components/sidebar";
import "virtual:components/footer";

function initOnce() {

    // Drawer
    const drawer = document.querySelector("#matecho-drawer") as NavigationDrawer;
    const topBtn = document.querySelector("#matecho-drawer-btn") as Button;
    const mainWrapper = document.querySelector("#matecho-main") as LayoutMain;
    
    topBtn.addEventListener("click", () => {
        drawer.open = !drawer.open;
    });

    // Search bar
    const searchBtn = document.querySelector("#matecho-top-search-btn") as ButtonIcon;
    const searchInput = document.querySelector("#matecho-top-search-bar") as TextField;
    const searchInputHidden = document.querySelector("#matecho-top-search-bar__hidden") as HTMLInputElement;
    searchBtn.addEventListener("click", () => {
        searchInput.disabled = false;
        setTimeout(() => searchInput.focus(), 0);
    });
    searchInput.addEventListener("change", () => {
        searchInputHidden.value = searchInput.value;
    });

    searchInput.addEventListener("blur", () => {
        searchInput.disabled = true;
    });

    const themeColor = (document.querySelector("meta[name=theme-color]") as HTMLMetaElement).content || "#e91e63";
    setColorScheme(themeColor);

    const mainWrapperPaddingWorkaround = new MutationObserver(() => {
        if (!drawer.open) {
            mainWrapper.style.padding = "64px 0 0";
        }
    });
    mainWrapperPaddingWorkaround.observe(mainWrapper, {
        attributes: true,
        attributeFilter: [ "style" ]
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

    init();
};

function handleLabelShrink(el: HTMLElement) {
    const appBar = document.querySelector("#matecho-app-bar") as TopAppBar;
    const inner = el.querySelector("#matecho-app-bar-large-label__inner") as HTMLElement;
    if (!inner) return;
    const labelShrinkOb = new MutationObserver(() => {
        if (!document.body.contains(el)) {
            labelShrinkOb.disconnect();
            ro.unobserve();
            return;
        }
        if (appBar.shrink) {
            el.classList.add("shrink") ;
        } else {
            el.classList.remove("shrink");
            document.scrollingElement!.scrollTop = 0;
        }
    });
    labelShrinkOb.observe(appBar, {
        attributes: true,
        attributeFilter: [ "shrink" ]
    });
    const ro = observeResize(inner, () => {
        const h = inner.getBoundingClientRect().height;
        const scroll = document.scrollingElement!;
        el.style.height = h + "px";
        if (h > (scroll.scrollHeight - window.screen.availHeight)) {
            appBar.scrollBehavior = undefined;
        } else {
            appBar.scrollBehavior = "shrink";
        }
    });
    np.configure({
        showSpinner: false
    });
}

async function init() {
    const header = document.getElementById("matecho-app-bar-large-label");
    header && handleLabelShrink(header);

    const CurrentModule = document.querySelector("meta[name=matecho-template]") as HTMLMetaElement;
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
document.addEventListener("pjax:complete", () => {
    np.done();
    const wrapper = document.querySelector("#matecho-pjax-main");
    if (wrapper) {
        wrapper.addEventListener("animationend", () => {
            wrapper.classList.remove("slide-in");
        }, { once: true })
        wrapper.classList.add("slide-in");
    }
    init();
});
document.addEventListener("pjax:send", () => {
    np.start();
});