<?php
use Typecho\Widget\Helper\Form\Element\Text;
use Typecho\Widget\Helper\Form;
use Utils\Helper;
use Widget\Archive;

function ThemeConfig(Form $form): void {
    $form->addInput(new Text("ThemeColor", null, "#E91E63", "主题色", "十六进制的主题色"));
    $form->addInput(new Text("GravatarURL", null, "https://gravatar.loli.net/avatar/", "Gravatar镜像", ""));
}

function ThemeInit(Archive $context): void {
    Matecho::$ThemeColor = Helper::options()->ThemeColor ?? "#E91E63";
    Matecho::$GravatarURL = Helper::options()->GravatarURL ?? "https://gravatar.loli.net/avatar/";
}

function ThemeFields($layout){
    $layout->addItem(new Text("cover", null, null, "文章封面", "替代文章默认的封面"));
    $layout->addItem(new Text("description", null, null, "文章描述", "替代文章内容显示在文章列表中文章标题的下方"));
}

class Matecho {
    static string $ThemeColor;
    static string $GravatarURL;

    static function assets(string $path = ''): void {
        echo Helper::options()->themeUrl.'/'.$path;
    }


    static function Gravatar(string $mail,int $size = 40): void {
        echo self::$GravatarURL.md5(strtolower($mail)).'?s='.$size.'&d=mp';
    }

    static function cover(Archive $archive): void {
        if (!$archive->fields->cover) {
            self::assets("assets/images/" . $archive->cid % 6 .  ".png");
        } else {
            echo $archive->fields->cover;
        }

    }
    static function pageIcon(string | null $template): string {
        return "insert-drive-file";
    }

    static function activePage(Archive $archive, string $type, int $id = -1): void {
        $thisType = $archive->getArchiveType();
        if ($thisType == $type) {
            if ($thisType === "category" && $archive->categories[0]["mid"] !== $id) return;
            if ($thisType === "page" && $archive->cid !== $id) return;
            echo "active";
        }
    }

    static function toComment(\Widget\Comments\Archive &$comments): void {   
        $isTopLevel = $comments->levels === 0;
        if ($isTopLevel) {
    ?>
        <div class="w-full box-border matecho-comment-wrapper matecho-comment-parent" id="comment-<?php echo $comments->coid ?>">
            <div class="flex items-center">
                <mdui-avatar class="matecho-comment-avatar"><?php $comments->gravatar(40) ?></mdui-avatar>
                <div class="ml-4 matecho-comment-author">
                    <?php $comments->author(); ?>
                </div>
                <span class="flex-grow text-right text-sm opacity-60">#<?php echo $comments->coid; ?></span>
            </div>
            <div class="pl-56px">
                <div class="mdui-prose mb-2">
                    <?php $comments->content(); ?>
                </div>
                <div class="flex items-center">
                    
                <div class="opacity-60 text-sm">
                    <?php $comments->date(); ?>
                </div>
                <mdui-button class="matecho-comment-reply h-6 min-w-0 w-3rem ml-2 inline-block" data-to-comment="<?php echo $comments->coid ?>" variant="text" class="h-8 min-w-0">
                    回复
                </mdui-button>
                </div>
            </div>
            <div>
                
            </div>
            <?php if (count($comments->children) > 0) { ?>
                <div class="w-full pl-56px box-border mt-4">
                    <?php 
                        $row = (new ReflectionClass(\Widget\Comments\Archive::class))->getProperty("row");
                        $r = $row->getValue($comments);
                        foreach($comments->children as $child) {
                            $row->setValue($comments, $child);
                            self::toComment($comments);
                        }                
                        $row->setValue($comments, $r);
                    ?>
                </div>
            <?php } ?>
            <mdui-divider class="ml-56px mt-2"></mdui-divider> 
        </div>
    <?php } else {?>
        <div class="w-full box-border matecho-comment-wrapper matecho-comment-child" id="comment-<?php echo $comments->coid ?>">
            <div class="flex items-center">
                <mdui-avatar class="matecho-comment-avatar w-28px h-28px flex-shrink-0"><?php $comments->gravatar(28) ?></mdui-avatar>
                <div class="ml-2 matecho-comment-author">
                    <?php $comments->author(); ?>
                </div>
                <span class="flex-grow text-right text-sm opacity-60">#<?php echo $comments->coid; ?></span>
            </div>
            <div class="pl-35px">
                <div class="mdui-prose mb-2">
                    <?php if($comments->levels > 1) { ?>
                        <a class="text-sm" href="#comment-<?php echo $comments->parent; ?>">回复 #<?php echo $comments->parent; ?>:</a>
                    <?php } ?>
                    <?php $comments->content(); ?>
                </div>
                <div class="flex items-center">
                    <div class="opacity-60 text-sm">
                        <?php $comments->date(); ?>
                    </div>
                    <mdui-button class="matecho-comment-reply h-6 min-w-0 w-3rem ml-2 inline-block" data-to-comment="<?php echo $comments->coid ?>" variant="text" class="h-8 min-w-0">
                        回复
                    </mdui-button>
                </div>
            </div>
            <?php if (count($comments->children) > 0) { 
                $row = (new ReflectionClass(\Widget\Comments\Archive::class))->getProperty("row");
                $r = $row->getValue($comments);
                foreach($comments->children as $child) {
                    $row->setValue($comments, $child);
                    self::toComment($comments);
                }                
                $row->setValue($comments, $r); 
            } ?>         
        </div>
    <?php }
    }
}