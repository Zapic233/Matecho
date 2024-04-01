<?php
use Typecho\Widget\Helper\Form\Element\Radio;
use Typecho\Widget\Helper\Form\Element\Hidden;
use Typecho\Widget\Helper\Form\Element\Text;
use Typecho\Widget\Helper\Form;
use Utils\Helper;
use Widget\Archive;
function themeConfig(Form $form): void {
    Matecho::generateThemeCSS();
    $form->addInput(new Text("ColorScheme", null, "", "主题色", "十六进制的主题色, 如#E91E63."));
    $form->addInput(new Text("GravatarURL", null, "https://gravatar.loli.net/avatar/", "Gravatar镜像", ""));
    if (!is_writable(__DIR__."/assets/color-scheme.css")) {
        $form->addInput(new Radio("ColorSchemeCache", [false => "禁用"], false, "颜色主题样式缓存", "(无法写入缓存, 检查主题目录权限) 缓存主题样式到本地静态文件, 可以利用缓存加快网页加载速度."));
    } else {
        $form->addInput(new Radio("ColorSchemeCache", [true => "启用", false => "禁用"], false, "颜色主题样式缓存", "缓存主题样式到本地静态文件, 可以利用缓存加快网页加载速度, 需要主题目录可写, 不需要持久化, 在文件不存在时自动生成."));
    }
    $form->addInput(new Hidden("ColorSchemeCSS"));
    require("settings-header.php");
}

function themeInit(Archive $context): void {
    Matecho::$ColorScheme = Helper::options()->ColorScheme;
    Matecho::$GravatarURL = Helper::options()->GravatarURL;
    Matecho::$ColorSchemeCache = Helper::options()->ColorSchemeCache;
    if (Matecho::$ColorSchemeCache && Matecho::$ColorScheme && !file_exists(__DIR__."/assets/color-scheme.css")) {
        Matecho::generateThemeCSS();
    }
}

function themeFields($layout){
    $layout->addItem(new Text("cover", null, null, "文章封面", "替代文章默认的封面"));
    $layout->addItem(new Text("description", null, null, "文章描述", "替代文章内容显示在文章列表中文章标题的下方"));
}

class Matecho {
    static string $ColorScheme;
    static string $GravatarURL;
    static bool $ColorSchemeCache;

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

    static function generateThemeCSS(): void {
        $css = Helper::options()->ColorSchemeCSS;
        file_put_contents(__DIR__."/assets/color-scheme.css", $css);
    }

    static function themeCSS(): void {
        if (!self::$ColorScheme) return;
        if (self::$ColorSchemeCache) {
            echo "<link rel=\"stylesheet\" href=\"". Helper::options()->themeUrl ."/assets/color-scheme.css?" . substr(Matecho::$ColorScheme, 1) . "\">";
        } else {
            $css = Helper::options()->ColorSchemeCSS;
            if (!$css) return;
            echo "<style>".$css."</style>";
        }
    }

    static function pageIcon(string | null $template): string {
        switch ($template) {
            case "page-links.php":
                return "link";
            case "page-board.php":
                return "mode-comment--outlined";
            default:
                return "insert-drive-file";
        }
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
                    <?php if ($comments->status === "waiting") { ?>
                        <span class="ml-2 text-sm">等待审核</span>
                    <?php } ?>
                </div>
                
                <mdui-button class="matecho-comment-reply h-6 min-w-0 w-3rem ml-2 inline-block" data-to-comment="<?php echo $comments->coid ?>" variant="text" class="h-8 min-w-0">
                    回复
                </mdui-button>
                </div>
            </div>
            <div>
                
            </div>
            <?php if (count($comments->children) > 0) { ?>
                <div class="w-full pl-56px box-border mt-4 matecho-comment-children-list">
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
                    <?php if ($comments->status === "waiting") { ?>
                        <span class="ml-2 text-sm">等待审核</span>
                    <?php } ?>
                </div>
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
    <?php }
    }

    static function tpVersion($version) {
        $version1Parts = explode('.', \Typecho\Common::VERSION);
        $version2Parts = explode('.', $version);
    
        $length = max(count($version1Parts), count($version2Parts));
    
        for ($i = 0; $i < $length; $i++) {
            $part1 = isset($version1Parts[$i]) ? intval($version1Parts[$i]) : 0;
            $part2 = isset($version2Parts[$i]) ? intval($version2Parts[$i]) : 0;
    
            if ($part1 < $part2) {
                return -1;
            } elseif ($part1 > $part2) {
                return 1;
            }
        }
    
        return 0;
    }

    static function links(): array {
        $options = \Typecho\Widget::widget('Widget_Options');
		if (!isset($options->plugins['activated']['Links'])) {
			throw new ErrorException("请先激活友链插件");
		}
        $db = \Typecho\Db::get();
		$prefix = $db->getPrefix();
		$options = \Typecho\Widget::widget('Widget_Options');
		$sql = $db->select()->from($prefix.'links');
		$sql = $sql->order($prefix.'links.order', \Typecho\Db::SORT_ASC);
		$links = $db->fetchAll($sql);
        return $links;
    }
}