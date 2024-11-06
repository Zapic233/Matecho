<?php
/**
 * 友情链接
 *
 * @package custom
 */

if (!defined('__TYPECHO_ROOT_DIR__'))
    exit;

/** @var \Widget\Archive $this */
$this->need('header.php');
$links = Matecho::links();
$linksCount = count($links);
?>
<div class="mx-auto px-5 md:px-8 box-border w-full max-w-1440px">
    <div id="matecho-app-bar-large-label">
        <div class="flex flex-col" id="matecho-app-bar-large-label__inner">
            <div class="truncate text-3xl md:text-5xl line-height-[1.4]!">
                <?php $this->archiveTitle(array(
                    'category' => _t('分类 %s 下的文章'),
                    'search' => _t('包含关键字 %s 的文章'),
                    'tag' => _t('标签 %s 下的文章'),
                    'author' => _t('%s 发布的文章')
                ), '', ''); ?>
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
                    <div class="flex items-center h-full">
                        <div class="h-full pt-1 box-border">
                            <mdui-avatar class="mr-2 flex-shrink-0">
                                <img class="w-full h-full object-contain matecho-link-avatar"
                                    src="<?php echo $link["image"] ?>" name="<?php echo $link["name"] ?>">
                            </mdui-avatar>
                        </div>
                        <div>
                            <span class="text-xl truncate"><?php echo $link["name"] ?></span>
                            <div class="opacity-80 text-xs"><?php echo $link["description"] ?></div>
                        </div>
                    </div>
                </mdui-card>
            </a>
        <?php } ?>
    </div>
</div>
<?php if ($this->authorId == $this->user->uid) { ?>
    <div class="max-w-768px mx-auto">
        <div class="text-2xl mt-12 mb-4">友链申请</div>
        <div class="h-120px items-center justify-center hidden matecho-link-apply__empty">
            <span class="opacity-60">没有待处理的申请</span>
        </div>
        <?php $comments = $this->comments();
        while ($comments->next()) {
            if (count($comments->children) > 0) {
                continue;
            } ?>
            <div class="matecho-links-application w-full" id="comment-<?php echo $comments->coid ?>">
                <div class="flex items-center gap-4">
                    <mdui-avatar aria-label="<?php $this->author() ?>"
                        src="<?php Matecho::Gravatar($this->author->mail); ?>"></mdui-avatar>
                    <span><?php $this->author(); ?></span>
                </div>
                <div class="pl-56px">
                    <div class="mt-2">
                        网站名称: <?php echo $comments->author ?><br>
                        网址: <a href="<?php echo $comments->url; ?>" target="_blank"><?php echo $comments->url; ?></a>
                        <?php echo $comments->content ?>
                    </div>
                    <div class="mt-2 flex items-center">
                        <span class="opacity-80 text-sm"><?php $comments->date(); ?></span>
                        <mdui-button class="h-6 min-w-0 w-3rem ml-2 inline-block matecho-links-application__reply"
                            data-to-comment="<?php echo $comments->coid ?>" variant="text" class="h-8 min-w-0">
                            回复
                        </mdui-button>
                    </div>
                    <mdui-divider class="mt-2"></mdui-divider>
                </div>
            </div>
            <?php
        } ?>
    </div>
    <mdui-dialog id="matecho-links-reply-dialog" close-on-esc close-on-overlay-click headline="回复申请">
        <div slot="description" class="w-95vw max-w-540px my-2 px-1">
            <form id="matecho-link-reply-form" method="post" action="<?php $this->commentUrl() ?>" role="form"
                data-pjax-state>
                <mdui-text-field variant="outlined" label="回复" rows="3" name="text" required></mdui-text-field>
            </form>
        </div>
        <div slot="action">
            <mdui-button variant="text" id="matecho-links-reply-cancel">取消</mdui-button>
            <mdui-button variant="tonal" id="matecho-links-reply-submit">回复</mdui-button>
        </div>
    </mdui-dialog>
<?php } ?>
<?php if ($this->allowComment) { ?>
    <div id="matecho-links-add__wrapper" class="sticky bottom-2 pr-4 md:pr-6 mt--48px mb--12px text-right z-2 pointer-events-none">
        <mdui-fab class="pointer-events-auto">
            <mdui-icon-person-add-alt-1 slot="icon"></mdui-icon-person-add-alt-1>
            申请友链
        </mdui-fab>
    </div>
    <mdui-dialog id="matecho-links-add-dialog" close-on-esc close-on-overlay-click headline="申请友链">
        <div slot="description" class="w-95vw max-w-540px px-1">
            <div id="matecho-link-preview">
                <mdui-card clickable class="w-full h-full pa-4 px-2 dark:bg-m-surface-container">
                    <div class="flex items-center h-full">
                        <div class="h-full pt-1 box-border">
                            <mdui-avatar class="mr-2 flex-shrink-0">
                                <img class="w-full h-full object-contain" src="" id="matecho-link-preview__avatar">
                            </mdui-avatar>
                        </div>
                        <div>
                            <span class="text-xl truncate" id="matecho-link-preview__name"></span>
                            <div class="opacity-80 text-xs" id="matecho-link-preview__description"></div>
                        </div>
                    </div>
                </mdui-card>
            </div>
            <form id="matecho-link-add-form" method="post" action="<?php $this->commentUrl() ?>" role="form"
                data-pjax-state>
                <div class="flex flex-wrap my-2">
                    <div class="w-1/2 sm:w-1/3 pr-1 box-border">
                        <mdui-text-field label="网站名称" variant="outlined" type="text" name="author"
                            value="<?php $this->remember('author'); ?>" required></mdui-text-field>

                    </div>
                    <div class="w-1/2 sm:w-1/3 pl-1 sm:pr-1 box-border">
                        <mdui-text-field label="邮箱" variant="outlined" type="email" name="mail"
                            value="<?php $this->remember('mail'); ?>" <?php if ($this->options->commentsRequireMail): ?>
                                required<?php endif; ?>></mdui-text-field>
                    </div>
                    <div class="w-full sm:w-1/3 pt-2 sm:pt-0 sm:pl-1 box-border">
                        <mdui-text-field label="网址" variant="outlined" type="url" name="url"
                            value="<?php $this->remember('url'); ?>" required></mdui-text-field>
                    </div>
                </div>
                <mdui-text-field class="w-full" label="头像地址" variant="outlined" type="url"
                    name="avatar-url"></mdui-text-field>
                <mdui-text-field class="w-full pt-2" label="描述" variant="outlined" name="description"></mdui-text-field>
            </form>
        </div>
        <div slot="action">
            <mdui-button variant="text" id="matecho-links-add-cancel">取消</mdui-button>
            <mdui-button variant="tonal" id="matecho-links-add-submit">申请</mdui-button>
        </div>
    </mdui-dialog>
    <?php if ($this->options->commentsAntiSpam) { ?>
        <script type="text/javascript">
            (function () {
                ['scroll', 'mousemove', 'keyup', 'touchstart'].map(v =>
                    document.addEventListener(v, function () {
                        window.__MATECHO_ANTI_SPAM__ = <?php echo \Typecho\Common::shuffleScriptVar($this->security->getToken($this->request->getRequestUrl())); ?>
                    }, { once: true, passive: true })
                );
            })();
        </script>
    <?php } ?>
<?php } ?>
<?php $this->need('footer.php'); ?>