<?php
if (!defined('__TYPECHO_ROOT_DIR__'))
    exit;

/** @var \Widget\Archive $this */
$this->need('header.php');
?>
<div class="matecho-article-wrapper mx-auto px-0 md:px-2 box-border max-w-840px">
    <?php if (!$this->hidden) { ?>
        <div id="matecho-app-bar-large-label">
            <div class="box-border pr-2 pl-4 md:pl-0 " id="matecho-app-bar-large-label__inner">
                <div class="text-sm mb-2 uppercase h-5 text-m-primary">
                    <?php $this->category(" | "); ?>
                </div>
                <div class="truncate text-3xl md:text-5xl line-height-[1.4]!">
                    <?php $this->title(); ?>
                </div>
                <div class="text-sm opacity-80 block mt-3 truncate h-5">
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
        <div class="matecho-article-cover mb-8 md:rounded-xl transition block h-240px w-full overflow-hidden bg-center bg-cover"
            style="background-image: url('<?php Matecho::cover($this); ?>')">
        </div>
        <div class="w-full px-4 box-border">
            <div class="flex gap-2">
                <mdui-avatar aria-label="<?php $this->author() ?>"
                    src="<?php Matecho::Gravatar($this->author->mail); ?>"></mdui-avatar>
                <div class="flex flex-col">
                    <div>
                        <?php $this->author(); ?>
                    </div>
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
            <article class="mdui-prose mt-8 box-border line-numbers">
                <?php echo $this->content(); ?>
            </article>
            <?php
            if (count($this->tags) > 0) { ?>
                <div class="flex flex-gap-2 items-center text-sm mt-8 overflow-hidden">
                    <mdui-icon-label--outlined class="mr--1 opacity-80"></mdui-icon-label--outlined>
                    <?php foreach ($this->tags as $tag) {
                        echo "<a href=\"" . $tag["permalink"] . "\">" . $tag["name"] . "</a>";
                    } ?>
                </div>
            <?php }
            ?>
            <mdui-divider class="mt-4 mb-4"></mdui-divider>
            <div class="mt-2">
                <?php $comments = $this->comments(); ?>
                <div class="text-2xl mb-4">
                    评论
                    <span class="text-sm ml-1 opacity-80">
                        <?php $this->commentsNum('%d'); ?>
                    </span>
                </div>
                <div id="matecho-comment-list">
                    <?php
                        while ($comments->next()) {
                            Matecho::toComment($comments, $this->allowComment);
                        }
                    ?>
                </div>
                <?php if ($this->commentsNum === 0) { ?>
                    <div class="my-12 text-md text-center opacity-50" id="matecho-no-comment-placeholder">没有评论</div>
                <?php } ?>
                <div class="py-4 matecho-comment-form matecho-comment-form__main w-full box-border relative <?php echo $this->allowComment ? "" : "matecho-comment-form__lock"; ?>"
                    id="<?php $this->respondId(); ?>">
                    <div class="matecho-form-lock-mask text-xl">
                        <mdui-icon-lock class="mr-2 opacity-90"></mdui-icon-lock>
                        评论已关闭
                    </div>
                    <div class="matecho-form-loading-mask">
                        <mdui-circular-progress></mdui-circular-progress>
                    </div>
                    <div class="mb-4 text-xl matecho-comment-form-title">发表评论</div>
                    <!-- "data-pjax-state" prevent Pjax handle this form. -->
                    <form class="transition" method="post" action="<?php $this->commentUrl() ?>" role="form"
                        data-pjax-state>
                        <?php if ($this->user->hasLogin()) { ?>
                            <div class="flex items-center gap-2">
                                <mdui-avatar src="<?php Matecho::Gravatar($this->user->mail) ?>"></mdui-avatar>
                                <span><?php $this->user->screenName(); ?></span>
                            </div>
                        <?php } else { ?>
                            <div class="flex flex-wrap">
                                <mdui-text-field class="w-1/2 sm:w-1/3 pr-1" label="称呼" variant="outlined" type="text"
                                    name="author" value="<?php $this->remember('author'); ?>" required></mdui-text-field>
                                <mdui-text-field class="w-1/2 sm:w-1/3 pl-1 sm:pr-1" label="邮箱" variant="outlined" type="email"
                                    name="mail" value="<?php $this->remember('mail'); ?>" <?php if ($this->options->commentsRequireMail): ?> required<?php endif; ?>></mdui-text-field>
                                <mdui-text-field class="w-full sm:w-1/3 pt-2 sm:pt-0 sm:pl-1" label="网址" variant="outlined"
                                    type="url" name="url" value="<?php $this->remember('url'); ?>" <?php if ($this->options->commentsRequireURL): ?> required<?php endif; ?>></mdui-text-field>
                            </div>
                        <?php } ?>
                        <div class="flex flex-gap-2 flex-col items-center mt-4">
                            <mdui-text-field variant="outlined" label="评论内容" rows="3" name="text"
                                required></mdui-text-field>
                            <div class="mt-2">
                                <mdui-button class="matecho-comment-submit-btn" type="submit">评论</mdui-button>
                                <mdui-button class="matecho-comment-cancel-btn" variant="outlined">取消回复</mdui-button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    <?php } else { ?>
        <div id="matecho-app-bar-large-label">
            <div class="box-border mt-24 px-2 md:pl-0 flex justify-center flex-gap-4 items-center"
                id="matecho-app-bar-large-label__inner">
                <mdui-icon-lock class="text-3xl"></mdui-icon-lock>
                <div class="truncate text-3xl">
                    <?php $this->archiveTitle(
                        array(),
                        '',
                        ''
                    ); ?>
                </div>
            </div>
        </div>
        <form class="max-w-420px pa-2 box-border md:pa-0 w-full mx-auto relative" id="matecho-password-form" method="post"
            action="<?php echo $this->security->getTokenUrl($this->permalink); ?>" data-pjax-state>
            <div class="matecho-form-loading-mask">
                <mdui-circular-progress></mdui-circular-progress>
            </div>
            <mdui-text-field enterkeyhint="done" toggle-password required label="密码" variant="outlined" type="password"
                name="protectPassword">
                <span slot="helper" class="invisible">密码</span>
            </mdui-text-field>
            <input type="hidden" name="protectCID" value="<?php $this->cid(); ?>" />
            <mdui-button type="submit" class="w-full mt-2">解锁</mdui-button>
        </form>
    <?php } ?>
</div>
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
<?php $this->need('footer.php'); ?>