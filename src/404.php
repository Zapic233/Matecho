<?php
/**
 * 基于 <a target="_blank" href="https://www.mdui.org/">MDUI</a> 的Typecho主题
 * 
 * @package Matecho
 * @author KawaiiZapic
 * @version 0.0.1
 * @link https://github.com/KawaiiZapic/Matecho
 */

if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** @var \Widget\Archive $this */
$this->need('header.php');
Typecho\Plugin::export();
?>
    <div id="matecho-app-bar-large-label">
        <div class="pl-4 md:pl-12 flex flex-col" id="matecho-app-bar-large-label__inner">
            <div class="truncate text-4xl md:text-5xl line-height-[1.4]!">
                页面未找到
            </div>
            <div class="text-sm opacity-80 block mt-3 truncate">
                404 Not Found
            </div>
        </div>
    </div>
    <div class="pl-42px">
        <mdui-button onclick="history.back()">返回上一页</mdui-button>
        <mdui-button href="<?php $this->options->siteUrl() ?>" variant="outlined">返回首页</mdui-button>
    </div>
    <!--matecho-assets-injection-->
<?php $this->need('footer.php'); ?>