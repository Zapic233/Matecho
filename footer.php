<?php if (!defined('__TYPECHO_ROOT_DIR__')) exit; ?>
            <div class="mdui-color-theme">
                <div class="mdui-container footer-nav">
                    <p class="mdui-float-right">233</p>
                </div>
            </div> 
            <div class="mdui-toolbar mdui-color-theme"></div>
        </div>
        <script>
            var $$ = mdui.JQ;
            var drawer_left = new mdui.Drawer("#drawer-left", {"swipe":true});
            $$("#btn-drawerctl").on("click",function(){drawer_left.toggle();});
        </script>
        <div id="swap" class="mdui-progress mdui-center" style="filter: blur(10px);margin-top: -50vh;width: 30%;transition-duration: .25s;min-width: 150px;transform: scale(1.5);opacity: 0;pointer-events: none;z-index: -999;">
          	<div class="mdui-progress-indeterminate"></div>
        </div>
    </body>
</html>
