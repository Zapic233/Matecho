<?php
/**
 * 基于 <a target="_blank" href="https://www.mdui.org/">MDUI</a> 的Typecho主题
 * 
 * @package Matecho
 * @author KawaiiZapic
 * @version __COMMIT_ID__
 * @link https://github.com/KawaiiZapic/Matecho
 */

if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** @var \Widget\Archive $this */
$this->need('header.php');
?>
<div class="mx-auto px-4 md:px-8 box-border w-full max-w-1440px">
    <div id="matecho-app-bar-large-label">
        <div class="flex flex-col" id="matecho-app-bar-large-label__inner">
            <div class="truncate text-4xl md:text-5xl line-height-[1.4]!">
                <?php $this->archiveType === 'index' ? $this->options->title() : $this->archiveTitle(array(
                    'category' => _t('分类 %s 下的文章'),
                    'search' => _t('包含关键字 %s 的文章'),
                    'tag' => _t('标签 %s 下的文章'),
                    'author' => _t('%s 发布的文章')
                ),'','');?>
            </div>
            <div class="text-sm opacity-80 block mt-3 truncate">
                <?php
                if ($this->archiveType === 'index') {
                    $this->options->description();
                } else if ($this->archiveType === "category" || $this->archiveType == "tag" || $this->archiveType === "search") {
                    $description = Matecho::tpVersion("1.2.1") > 0 ? $this->archiveDescription : $this->description;
                    if ($description) {
                        echo $description;
                    } else {
                        printf("共 %d 篇文章", $this->getTotal());
                    }
                } else {
                    echo $this->archiveType;
                }
                ?>
            </div>
        </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 grid-gap-4">
            <?php while ($this->next()){ ?>
                <mdui-card clickable="false" class="flex flex-col matecho-article-card" <?php if($this->hidden) { ?> data-article-hidden <?php } ?> >
                        <a href="<?php $this->permalink(); ?>" title="<?php $this->title(); ?>" class="h-240px flex-shrink-0 block w-full bg-center bg-cover block" style="background-image: url('<?php Matecho::cover($this);?>')"></a>
                        <div class="matecho-article-card__meta pa-4 flex-grow-1">
                            <div class="text-sm mb-1 uppercase" style="color: rgb(var(--mdui-color-primary-light));">
                                <?php $this->category(" | "); ?>
                            </div>
                            <a title="<?php $this->title(); ?>" class="text-3xl block line-height-10 matecho-article-link" href="<?php $this->permalink(); ?>">
                                <?php $this->title(); ?>
                                <?php if (strlen($this->title) == 0) {?>
                                    <i>无标题文章</i>
                                <?php } ?>
                            </a>
                            <div class="mt-4 text-sm font-300 opacity-80 line-clamp-2">
                                <?php if (!$this->hidden && $this->fields->description) echo $this->fields->description; else $this->excerpt(300,'...'); ?>
                            </div>
                        </div>
                        <div class="matecho-article-card__meta flex gap-2 pl-4 pr-1 mb-2 items-center">
                            <div class="flex flex-wrap flex-grow-1">
                                <mdui-button variant="text" class="rounded matecho-info-button" disabled>
                                    <mdui-icon-calendar-month slot="icon"></mdui-icon-calendar-month>
                                    <?php $this->date(); ?>
                                </mdui-button>
                                <mdui-button variant="text" class="rounded matecho-info-button" disabled>
                                    <mdui-icon-mode-comment--outlined slot="icon"></mdui-icon-mode-comment--outlined>
                                    <?php $this->commentsNum('%d'); ?>
                                </mdui-button>
                            </div>
                            <a title="<?php $this->title(); ?>" href="<?php $this->permalink(); ?>">
                                <mdui-button class="matecho-article-enter" variant="text">
                                    阅读全文
                                    <mdui-icon-chevron-right slot="end-icon"></mdui-icon-chevron-right>
                                </mdui-button>
                            </a>
                        </div>
                    </mdui-card>

            <?php } ?>

        </div>
        <?php if($this->getTotal() == 0) { ?>
            <div class="pt-8 w-full flex items-center flex-col justify-center text-3xl opacity-50">
                <mdui-icon-inbox class="w-24 h-24 mb-4"></mdui-icon-inbox>
                没有文章
            </div>
        <?php } ?>
        <?php 
            $CurrentPage = $this->getCurrentPage();
            $TotalPage=ceil($this->getTotal()/$this->parameter->pageSize);
            $PageLinkTemp = Typecho\Router::url(
                $this->parameter->type .
                (false === strpos($this->parameter->type, '_page') ? '_page' : null),
                $this->pageRow,
                $this->options->index
            );
        ?>
        <?php if ($TotalPage > 1){ ?>
            <div class="flex justify-center items-center mt-6 mb-3 line-height-0 select-none text-sm ">
            <?php if ($CurrentPage > 1) {
                $this->pageLink('<mdui-button-icon><mdui-icon-chevron-left></mdui-icon-chevron-left></mdui-button-icon>');
            } else { ?>
                <mdui-button-icon disabled><mdui-icon-chevron-left></mdui-icon-chevron-left></mdui-button-icon>
            <?php } ?>
            
            <div class="px-2">
                <?php
                    if ($CurrentPage > 4 && $TotalPage > 5) { ?>
                        <a class="decoration-none!" href="<?php echo str_replace("{page}", "1", $PageLinkTemp); ?>">
                            <mdui-button-icon class="w-8 h-8 min-w-8">
                                <span class="text-sm">
                                    1
                                </span>
                            </mdui-button-icon>
                        </a>
                        <mdui-button-icon class="w-8 h-8 min-w-8">
                            <mdui-icon-more-horiz class="text-sm"></mdui-icon-more-horiz>
                        </mdui-button-icon>
                    <?php } 
                    $StartPage = $CurrentPage - 2;
                    if ($CurrentPage < 5) {
                        $StartPage = 1;
                    } else if ($TotalPage - $CurrentPage < 4) {
                        $StartPage = $TotalPage - 4;
                    }

                    for ($i = $StartPage; $i < $StartPage + 5; $i++) {
                        if ($i > $TotalPage) break; ?> 
                        <a class="decoration-none!" href="<?php echo str_replace("{page}", (string)$i, $PageLinkTemp); ?>" >
                            <mdui-button-icon class="w-8 h-8 min-w-8" <?php if ($i == $CurrentPage) { ?> variant="tonal" <?php } ?> >
                                <span class="text-sm">
                                    <?php echo $i; ?>
                                </span>
                            </mdui-button-icon>
                        </a>
                    <?php }
                    if ($TotalPage - $CurrentPage > 3 && $TotalPage > 5) { ?>
                        <mdui-button-icon class="w-8 h-8 min-w-8">
                            <mdui-icon-more-horiz class="text-sm"></mdui-icon-more-horiz>
                        </mdui-button-icon>
                        <a class="decoration-none!" href="<?php echo str_replace("{page}", (string)$TotalPage, $PageLinkTemp); ?>">
                            <mdui-button-icon class="w-8 h-8 min-w-8">
                                <span class="text-sm">
                                    <?php echo $TotalPage; ?>
                                </span>
                            </mdui-button-icon>
                        </a>
                    <?php } ?>
            </div>

            <?php if ($CurrentPage < $TotalPage) {
                $this->pageLink('<mdui-button-icon><mdui-icon-chevron-right></mdui-icchevron-right></mdui-button-icon>','next');
            } else { ?>
                <mdui-button-icon disabled><mdui-icon-chevron-right></mdui-icchevron-right></mdui-button-icon>
            <?php } ?>
            </div>
        <?php } ?>
</div>
<?php $this->need('footer.php'); ?>