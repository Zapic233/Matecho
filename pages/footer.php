<?php 
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** @var \Widget\Archive $this */
Typecho\Plugin::export(); ?>
<div class="h-120px w-full"></div>
<mdui-card class="h-100px absolute bottom-0 left-0 w-full flex justify-center items-center rounded-b-0">
    <div class="mdui-prose">Copyright &copy; <?php echo date("Y"); ?> <a href="<?php $this->options->siteUrl(); ?>"><?php $this->options->title(); ?></a></div>
</mdui-card>

        </mdui-layout-main>
    </mdui-layout>
    <script type="module" src="src/index.ts"></script>
</body>
</html>