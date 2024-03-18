import type { NavigationDrawer, Button } from "mdui";
import "virtual:uno.css";
import {TopAppBar, setColorScheme, breakpoint } from "mdui";

import "./components";

function init() {
    const drawer = document.querySelector("#matecho-drawer") as InstanceType<NavigationDrawer>;
    const topBtn = document.querySelector("#matecho-drawer-btn") as InstanceType<Button>;
    const topBar = document.querySelector("#matecho-app-bar") as InstanceType<TopAppBar>;
    const largeLabel = document.querySelector("#matecho-app-bar-large-label");
    const wrapper = document.querySelector("#matecho-main");
    topBtn.addEventListener("click", () => {
        drawer.open = !drawer.open;

    });
    ["open", "close"].map(evt => drawer.addEventListener(evt, () => {
        if (breakpoint().up("md")) {
            largeLabel.style.marginLeft = drawer.open ? "240px" : "0px";
            largeLabel.style.transition = drawer.open ? "margin-left 500ms cubic-bezier(0.2, 0, 0, 1) 0s" : "margin-left 200ms cubic-bezier(0.2, 0, 0, 1) 0s";
            largeLabel.addEventListener("transitionend", () => {
                largeLabel.style.transition = "";
            }, { once: true });
        }
    }));
    // drawer.open = true;

    setColorScheme('#e91e63');

}

init();