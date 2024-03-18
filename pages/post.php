<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
$this->need('header.php');
/** @var \Widget\Archive $this */
?>
    <div class="mx-auto max-w-768px">
        <div class="mb-8 rounded-xl transition block h-240px w-full overflow-hidden bg-center bg-cover" style="background-image: url('<?php Matecho::cover($this);?>')">
        </div>
        <div class="w-full mx-2">
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
            <div class="mdui-prose mt-8 user-select-inherit">
                <?php echo $this->content; ?>
            </div>
        </div>
    </div>
<?php $this->need('sidebar.php'); ?>
<?php $this->need('footer.php'); ?>