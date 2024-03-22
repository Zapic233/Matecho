import type { NavigationDrawer, Button, ButtonIcon, TextField, LayoutMain, TopAppBar } from "mdui";
import "virtual:uno.css";
import { setColorScheme } from "mdui/functions/setColorScheme";
import { observeResize } from "mdui/functions/observeResize";

import "./components";

function init() {
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
    searchBtn.addEventListener("click", () => {
        searchInput.disabled = false;
        setTimeout(() => searchInput.focus(), 0);
    });

    searchInput.addEventListener("blur", () => {
        searchInput.disabled = true;
    });

    // whatever
    setColorScheme('#e91e63');

    handleLabelShrink(document.getElementById("matecho-app-bar-large-label")!);
    

    const mainWrapperPaddingWorkaround = new MutationObserver(() => {
        if (!drawer.open) {
            mainWrapper.style.padding = "64px 0 0";
        }
    });
    mainWrapperPaddingWorkaround.observe(mainWrapper, {
        attributes: true,
        attributeFilter: [ "style" ]
    });
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
}

init();