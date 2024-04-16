<?php
/**
 * 基于 <a target="_blank" href="https://www.mdui.org/">MDUI</a> 的Typecho主题
 * 
 * @package Matecho
 * @author KawaiiZapic
 * @version 0.1.0
 * @link https://github.com/KawaiiZapic/Matecho
 */

if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** @var \Widget\Archive $this */
$this->need('header.php');
Typecho\Plugin::export();
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
                <mdui-card clickable="false" class="flex flex-col matecho-article-card">
                        <a href="<?php $this->permalink(); ?>" title="<?php $this->title(); ?>" class="h-240px rounded-xl block w-full bg-center bg-cover block" style="background-image: url('<?php Matecho::cover($this);?>')"></a>
                        <div class="pa-4 flex-grow-1">
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
                        <div class="flex gap-2 pl-4 pr-1 mb-2 items-center">
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
        <?php $TotalPage=ceil($this->getTotal()/$this->parameter->pageSize); ?>
        <?php if ($TotalPage > 1){ ?>
            <div class="flex justify-center mt-6 mb-3">
                <mdui-segmented-button-group>
                    <?php if ($this->_currentPage > 1) {
                        $this->pageLink('<mdui-segmented-button><mdui-icon-arrow-back slot="icon"></mdui-icon-arrow-back>上一页</mdui-segmented-button>');
                    } else { ?>
                        <mdui-segmented-button disabled><mdui-icon-arrow-back slot="icon"></mdui-icon-arrow-back>上一页</mdui-segmented-button>
                    <?php } ?>
                    <mdui-segmented-button><?php echo $this->_currentPage; ?> / <?php echo $TotalPage; ?></mdui-segmented-button>
                    <?php if ($this->_currentPage < $TotalPage) {
                        $this->pageLink('<mdui-segmented-button><mdui-icon-arrow-forward slot="end-icon"></mdui-icon-arrow-forward>下一页</mdui-segmented-button>','next');
                    } else { ?>
                        <mdui-segmented-button disabled><mdui-icon-arrow-forward slot="end-icon"></mdui-icon-arrow-forward>下一页</mdui-segmented-button>
                    <?php } ?>
                </mdui-segmented-button-group>
            </div>
        <?php } ?>
</div>
<?php $this->need('footer.php'); ?>