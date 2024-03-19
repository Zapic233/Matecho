<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** @var \Widget\Archive $this */
$this->need('header.php');
?>

    <link rel="stylesheet" href="src/style/post.css">
    <div class="mx-auto md:px-0 box-border max-w-768px">
    
    <div id="matecho-app-bar-large-label">    
        <div class="box-border px-2 md:pl-0 " id="matecho-app-bar-large-label__inner">
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
                if ($this->archiveType === 'post') {
                    if (!$this->hidden && $this->fields->description) {
                        echo $this->fields->description;
                    }
                } 
                ?>
            </div>
        </div>
    </div>
        <div class="mb-8 md:rounded-xl transition block h-240px w-full overflow-hidden bg-center bg-cover" style="background-image: url('<?php Matecho::cover($this);?>')">
        </div>
        <div class="w-full px-2 box-border">
            <div class="flex gap-2">
                <mdui-avatar src="<?php Matecho::Gravatar($this->author->mail); ?>"></mdui-avatar>
                <div class="flex flex-col">
                    <div><?php $this->author(); ?></div>
                    <div class="flex flex-wrap flex-grow-1 opacity-60">
                        <mdui-button variant="text" class="rounded matecho-info-button" disabled>
                            <mdui-icon-calendar-month slot="icon"></mdui-icon-calendar-month>
                            <?php $this->date(); ?>
                        </mdui-button>
                        <mdui-button variant="text" class="rounded matecho-info-button" disabled>
                            <mdui-icon-mode-comment--outlined slot="icon"></mdui-icon-mode-comment--outlined>
                            <?php $this->commentsNum('%d'); ?>
                        </mdui-button>
                    </div>
                </div>
            </div>
            <article class="mdui-prose mt-8 box-border">
                <?php echo $this->content; ?>
            </article>
        </div>
    </div>
<?php $this->need('sidebar.php'); ?>
<?php $this->need('footer.php'); ?>