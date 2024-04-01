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
		!new RegExp("<%= CompatibilityUserAgentRegex %>").test(navigator.userAgent)&&(document.body.innerHTML+='<div class="un-br"><h1 class="un-br_sf">{ ᗜ˰ᗜ }</h1> <h1>浏览器不受支持</h1><p>您当前使用的浏览器不受支持，请更新你的浏览器。</p></div>')
	</script>
    <?php Matecho::themeCSS(); ?>
</body>
</html>