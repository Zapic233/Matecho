<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** @var \Widget\Archive $this */
$this->need('header.php');
$links = Matecho::links();
$linksCount = count($links);
?>
    <div class="mx-auto md:px-0 box-border">
        <div id="matecho-app-bar-large-label">    
            <div class="box-border pl-4 md:pl-12 " id="matecho-app-bar-large-label__inner">
                <div class="text-sm mb-2 uppercase" style="color: rgb(var(--mdui-color-primary-light));">
                    <?php $this->category(" | "); ?>
                </div>
                <div class="truncate text-3xl md:text-5xl line-height-[1.4]!">
                    <?php $this->archiveType === 'index' ? $this->options->title() : $this->archiveTitle(array(
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
        <div class="grid grid-gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 px-4 md:px-12">
            <?php foreach ($links as $link) { ?>
                <a href="<?php echo $link["url"] ?>" title="<?php echo $link["name"] ?>">
                    <mdui-card clickable class="w-full h-full pa-4 px-2">
                        <div class="flex items-center">
                            <mdui-avatar class="mr-2 flex-shrink-0" src="<?php echo $link["image"] ?>"></mdui-avatar>
                            <span class="text-xl truncate"><?php echo $link["name"] ?></span>
                        </div>
                        <div class="opacity-80 pl-48px"><?php echo $link["description"] ?></div>
                    </mdui-card>
                </a>
            <?php } ?>
        </div>
    </div>
    <!--matecho-assets-injection-->
    <link rel="stylesheet" href="@/style/post.css">
<?php $this->need('footer.php'); ?>