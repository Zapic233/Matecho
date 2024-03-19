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
$this->need('header.php');Typecho\Plugin::export();
?>
    <link rel="stylesheet" href="src/style/index.css">
    <div id="matecho-app-bar-large-label">
        <div class="pl-4 md:pl-12 flex flex-col" id="matecho-app-bar-large-label__inner">
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
                } else if ($this->archiveType === "category") {
                    printf("共 %d 篇文章", $this->getTotal());
                } else {
                    echo $this->archiveType;
                }
                ?>
            </div>
        </div>
    </div>
    <div class="px-4 md:px-12 w-full box-border">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xxl:grid-cols-4 grid-gap-4">
            <?php while ($this->next()){ ?>
                <mdui-card clickable="false" class="flex flex-col matecho-article-card">
                        <a href="<?php $this->permalink(); ?>" class="overflow-hidden h-240px rounded-xl">
                            <div class="matecho-article-cover block w-full h-full bg-center bg-cover h-full" style="background-image: url('<?php Matecho::cover($this);?>')">
                                
                            </div>
                        </a>
                        <div class="pa-4 flex-grow-1">
                            <div class="text-sm mb-1 uppercase" style="color: rgb(var(--mdui-color-primary-light));">
                                <?php $this->category(" | "); ?>
                            </div>
                            <a class="text-3xl block line-height-10 matecho-article-link" href="<?php $this->permalink(); ?>">
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
                    <?php if ($this->_currentPage > 1) {
                        $this->pageLink('<mdui-segmented-button>上一页</mdui-segmented-button>');
                    } else { ?>
                        <mdui-segmented-button disabled>上一页</mdui-segmented-button>
                    <?php } ?>
                    <mdui-segmented-button><?php echo $this->_currentPage; ?> / <?php echo $TotalPage; ?></mdui-segmented-button>
                    <?php if ($this->_currentPage < $TotalPage) {
                        $this->pageLink('<mdui-segmented-button>下一页</mdui-segmented-button>','next');
                    } else { ?>
                        <mdui-segmented-button disabled>下一页</mdui-segmented-button>
                    <?php } ?>
                </mdui-segmented-button-group>
            </div>
        <?php } ?>
    </div>
<?php $this->need('footer.php'); ?>