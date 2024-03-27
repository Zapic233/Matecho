<?php 
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
Typecho\Plugin::export();
/** @var \Widget\Archive $this */
?>
                </div>
            <div class="h-120px w-full"></div>
            <mdui-card class="h-100px absolute bottom-0 left-0 w-full flex justify-center items-center rounded-b-0">
                <div class="mdui-prose">Copyright &copy; <?php echo date("Y"); ?> <a href="<?php $this->options->siteUrl(); ?>"><?php $this->options->title(); ?></a></div>
            </mdui-card>
        </mdui-layout-main>
    </mdui-layout>
    <script type="text/javascript">
		!new RegExp("<%= CompatibilityUserAgentRegex %>").test(navigator.userAgent)&&(document.body.innerHTML+="<div class='un-br'><div><h1 class='un-br_sf'>X_X</h1> <h1>浏览器不受支持</h1><p>您当前使用的浏览器不受支持，请更新你的浏览器。</p></div></div><style>html,body{overflow:hidden;}.un-br{position:fixed;top:0;left:0;width:100%;height:100%;background-color:#eee;text-align:center;z-index: 99999;}.un-br_sf{font-size: 5em; color:#999;}@media(prefers-color-scheme:dark){.un-br{color:white;background-color:#1f1f1f;}.un-br_sf{color: #ccc;}}</style>")
	</script>
</body>
</html>