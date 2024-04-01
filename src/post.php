<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** @var \Widget\Archive $this */
$this->need('header.php');
?>
    <div class="matecho-article-wrapper mx-auto px-0 md:px-2 box-border max-w-840px">
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
                <mdui-avatar aria-label="<?php $this->author() ?>" src="<?php Matecho::Gravatar($this->author->mail); ?>"></mdui-avatar>
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
            <article class="mdui-prose mt-8 box-border line-numbers">
                <?php echo $this->content; ?>
            </article>
            <?php
                if (count($this->tags) > 0) { ?>
                    <div class="flex flex-gap-2 items-center text-sm mt-8 overflow-hidden">
                        <mdui-icon-label--outlined class="mr--1 opacity-80"></mdui-icon-label--outlined>
                        <?php foreach($this->tags as $tag) {
                            echo "<a href=\"" . $tag["permalink"] . "\">" . $tag["name"] . "</a>";
                        }?>
                    </div>
                <?php }
            ?>
            <mdui-divider class="mt-4 mb-4"></mdui-divider>
            <div class="mt-2">
                <?php $comments = $this->comments(); ?>
                <div class="text-2xl mb-4">
                    评论 
                    <span class="text-sm ml-1 opacity-80"><?php $this->commentsNum('%d'); ?></span>
                </div>
                <div id="matecho-comment-list">
                    <?php 
                        while($comments->next()) {
                            Matecho::toComment($comments);
                        }
                    ?>  
                </div>
                <?php if ($comments->___length() === 0) { ?>
                    <div class="my-12 text-md text-center opacity-50" id="matecho-no-comment-placeholder">没有评论</div>
                <?php } ?>
                <div class="pa-4 matecho-comment-form relative w-full box-border" id="<?php $this->respondId(); ?>">
                    <div class="matecho-comment-loading-mask opacity-0 transition pointer-events-none absolute top-0 left-0 w-full h-full flex items-center justify-center z-10000">
                        <mdui-circular-progress></mdui-circular-progress>
                    </div>
                    <div class="mb-4 text-xl matecho-comment-form-title">发表评论</div>
                    <!-- "data-pjax-state" prevent Pjax handle this form. -->
                    <form class="transition" method="post" action="<?php $this->commentUrl() ?>" role="form" data-pjax-state>
                        <?php if ($this->user->hasLogin()): ?>
                            <p><?php _e('登录身份: '); ?><a
                                href="<?php $this->options->profileUrl(); ?>"><?php $this->user->screenName(); ?></a>. <a
                                href="<?php $this->options->logoutUrl(); ?>" title="Logout"><?php _e('退出'); ?> &raquo;</a>
                            </p>
                        <?php else: ?>
                            <div class="flex flex-wrap">
                                <mdui-text-field class="w-1/2 sm:w-1/3 pr-1" label="称呼" variant="outlined" type="text" name="author"
                                       value="<?php $this->remember('author'); ?>" required></mdui-text-field>
                                <mdui-text-field class="w-1/2 sm:w-1/3 pl-1 sm:pr-1" label="邮箱" variant="outlined" type="email" name="mail"
                                       value="<?php $this->remember('mail'); ?>" <?php if ($this->options->commentsRequireMail): ?> required<?php endif; ?>></mdui-text-field>
                                <mdui-text-field class="w-full sm:w-1/3 pt-2 sm:pt-0 sm:pl-1" label="网址" variant="outlined" type="url" name="url"
                                       value="<?php $this->remember('url'); ?>" <?php if ($this->options->commentsRequireURL): ?> required<?php endif; ?>></mdui-text-field>
                            
                            </div>
                        <?php endif; ?>
                        <div class="flex flex-gap-2 flex-col items-center mt-4">
                            <mdui-text-field variant="outlined" label="评论内容" rows="3" name="text" required><?php $this->remember('text'); ?></mdui-text-field>
                            <div class="mt-2">
                                <mdui-button class="matecho-comment-submit-btn" type="submit">评论</mdui-button>
                                <mdui-button class="matecho-comment-cancel-btn" variant="outlined">取消回复</mdui-button>
                            </div>
                            
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <?php if ($this->options->commentsAntiSpam) { ?>
        <script type="text/javascript">
            (function () {
                ['scroll', 'mousemove', 'keyup', 'touchstart'].map(v => 
                    document.addEventListener(v, function () {
                        window.__MATECHO_ANTI_SPAM__ = <?php echo \Typecho\Common::shuffleScriptVar($this->security->getToken($this->request->getRequestUrl()));?>
                    }, { once: true, passive: true})
                );
            })();
        </script>
    <?php } ?>
<?php $this->need('footer.php'); ?>