<?php
/**
 * 友情链接
 *
 * @package custom
 */

if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** @var \Widget\Archive $this */
$this->need('header.php');
$links = Matecho::links();
$linksCount = count($links);
?>
<div class="mx-auto px-4 md:px-8 box-border w-full max-w-1440px">
    <div id="matecho-app-bar-large-label">    
        <div class="flex flex-col" id="matecho-app-bar-large-label__inner">
            <div class="truncate text-3xl md:text-5xl line-height-[1.4]!">
                <?php $this->archiveTitle(array(
                    'category' => _t('分类 %s 下的文章'),
                    'search' => _t('包含关键字 %s 的文章'),
                    'tag' => _t('标签 %s 下的文章'),
                    'author' => _t('%s 发布的文章')
                ),'','');?>
            </div>
            <div class="text-sm opacity-80 block mt-3 truncate">
                <?php
                    echo "$linksCount 位友人";
                ?>
            </div>
        </div>
    </div>
    <div class="grid grid-gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <?php foreach ($links as $link) { ?>
            <a href="<?php echo $link["url"] ?>" title="<?php echo $link["name"] ?>" target="_blank">
                <mdui-card clickable class="w-full h-full pa-4 px-2 dark:bg-m-surface-container">
                    <div class="flex items-center">
                        <mdui-avatar class="mr-2 flex-shrink-0">
                            <img class="w-full h-full object-contain matecho-link-avatar" src="<?php echo $link["image"] ?>" name="<?php echo $link["name"] ?>">
                        </mdui-avatar>
                        <span class="text-xl truncate"><?php echo $link["name"] ?></span>
                    </div>
                    <div class="opacity-80 pl-48px text-xs"><?php echo $link["description"] ?></div>
                </mdui-card>
            </a>
        <?php } ?>
    </div>
</div>
<?php $this->need('footer.php'); ?>