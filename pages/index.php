<?php
/**
 * 基于 <a target="_blank" href="https://www.mdui.org/">MDUI</a> 的Typecho主题
 * 
 * @package Matecho
 * @author KawaiiZapic
 * @version 0.0.1
 * @link https://github.com/KawaiiZapic/Matecho
 */

if (!defined('__TYPECHO_ROOT_DIR__')) exit;$this->need('header.php');Typecho\Plugin::export();
/** @var \Widget\Archive $this */
?>
    <div class="flex justify-center">
        <div class="px-4 md:px-12 w-full pt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xxl:grid-cols-4 grid-gap-4">
            <?php while ($this->next()){ ?>
                <mdui-card clickable="false" class="mb-4 flex flex-col matecho-article-card">
                        <a href="<?php $this->permalink(); ?>" class="matecho-article-cover transition block h-240px w-full rounded-xl overflow-hidden bg-center" style="background-image: url('<?php Matecho::cover($this);?>')">
                        </a>
                        <div class="pa-4 flex-grow-1">
                            <div class="text-sm mb-1 uppercase" style="color: rgb(var(--mdui-color-primary-light));">
                                <?php $this->category(" | "); ?>
                            </div>
                            <a class="text-3xl block truncate line-height-10 matecho-article-link" href="<?php $this->permalink(); ?>">
                                <?php $this->title(); ?>
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
                            <a href="<?php $this->permalink(); ?>">
                                <mdui-button class="matecho-article-enter" variant="text">
                                    阅读全文
                                    <mdui-icon-chevron-right slot="end-icon"></mdui-icon-chevron-right>
                                </mdui-button>
                            </a>
                        </div>
                    </mdui-card>

            <?php } ?>

            </div>
            <?php $TotalPage=ceil($this->getTotal()/$this->parameter->pageSize); ?>
            <?php if ($TotalPage > 1){ ?>
                <div class="flex justify-center my-3">
                    <mdui-segmented-button-group>
                        <?php if ($this->_currentPage > 1) { ?>
                            <?php $this->pageLink('<mdui-segmented-button>上一页</mdui-segmented-button>'); ?>
                        <?php } else { ?>
                            <mdui-segmented-button disabled>上一页</mdui-segmented-button>
                        <?php } ?>
                        <mdui-segmented-button><?php echo $this->_currentPage; ?> / <?php echo $TotalPage; ?></mdui-segmented-button>
                        <?php if ($this->_currentPage < $TotalPage) { ?>
                            <?php $this->pageLink('<mdui-segmented-button>下一页</mdui-segmented-button>','next'); ?>
                        <?php } else { ?>
                            <mdui-segmented-button disabled>下一页</mdui-segmented-button>
                        <?php } ?>
                    </mdui-segmented-button-group>
                </div>
            <?php } ?>
        </div>
    </div>
<?php $this->need('footer.php'); ?>