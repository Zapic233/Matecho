<?php
use Typecho\Request;
use Typecho\Response;
use Typecho\Widget\Helper\Form\Element\Radio;
use Typecho\Widget\Helper\Form\Element\Hidden;
use Typecho\Widget\Helper\Form\Element\Text;
use Typecho\Widget\Helper\Form;
use Typecho\Widget\Helper\Form\Element\Textarea;
use Utils\Helper;
use Widget\Archive;

function themeConfig(Form $form): void {
    Matecho::generateThemeCSS();
    $form->addInput(new Text("ColorScheme", null, "", "主题色", "十六进制的主题色, 如#E91E63."));
    $form->addInput(new Text("GravatarURL", null, "https://gravatar.loli.net/avatar/", "Gravatar镜像", ""));
    if (!is_writable(__DIR__."/assets/color-scheme.css")) {
        $form->addInput(new Radio("ColorSchemeCache", [0 => "禁用"], 0, "颜色主题样式缓存", "(无法写入缓存, 检查主题目录权限) 缓存主题样式到本地静态文件, 可以利用缓存加快网页加载速度."));
    } else {
        $form->addInput(new Radio("ColorSchemeCache", [1 => "启用", 0 => "禁用"], 0, "颜色主题样式缓存", "缓存主题样式到本地静态文件, 可以利用缓存加快网页加载速度, 需要主题目录可写, 不需要持久化, 在文件不存在时自动生成."));
    }
    $form->addInput(new Radio("EnableFancyBox", [1 => "自动", 0 => "禁用"], 1, "FancyBox", "允许用户放大查看文章内的图片"));
    $form->addInput(new Radio("CodeHighlighter", ["Prism" => "Prism", "Shiki" => "Shiki", "none" => "禁用"], "Prism", "代码高亮", "选择代码高亮引擎, Prism(~50KB)更小更快, Shiki(~600KB)更大更准确."));
    $form->addInput(new Radio("EnableKaTeX", [1 => "自动", 0 => "禁用"], 1, "KaTeX", "渲染LaTeX公式, 在使用\$或者\$\$包裹LaTeX公式即可自动渲染."));
    $form->addInput(new Radio("EnableMermaid", [1 => "自动", 0 => "禁用"], 1, "Mermaid", "渲染流程图, 将Mermaid代码包括在mermaid代码块(```mermaid```)中, 即可自动渲染."));
    $form->addInput(new Radio("ExSearchIntegration", ["enhanced" => "增强", "normal" => "普通"], "enhanced", "ExSearch即时搜索集成", "ExSearch集成模式, 在普通的状态下使用原版搜索框, 在增强状态下使用主题自带的搜索框."));
    $form->addInput(new Text("GlotAccessToken", null, "", "glot.io 访问密钥", "填入后, 可以通过调用glot.io API直接运行代码块中的代码, 详细获取方法请查看文档,"));
    $form->addInput(new Text("BeiAnText", null, "", "备案信息", "显示在页脚版权信息下方"));
    $form->addInput(new Textarea("ExtraCode", null, "", "页脚HTML代码", "插入统计代码或者额外的插件"));
    $form->addInput(new Text("TwitterCardRef", null, "", "X(Twitter) 引用的用户名", "给站点设置twitter:site值, 在Twitter分享此站点的链接时引用到自己的Twitter账号, 例如@KawaiiZapic."));
    $form->addInput(new Radio("TwitterCardDefaultStyle", ["summary" => "小图(标题+描述)", "summary_large_image" => "大图(仅标题)"], "summary", "X(Twitter) 链接卡片样式", "设置默认twitter:card值, 在把文章链接分享到Twitter时展示成不同样式, 可为文章单独指定样式."));
    $form->addInput(new Text("LinkBilibili", null, "", "哔哩哔哩链接", "哔哩哔哩主页链接, 显示在页脚."));
    $form->addInput(new Text("LinkTwitter", null, "", "X(Twitter) 链接", "X(Twitter)主页链接, 显示在页脚."));
    $form->addInput(new Text("LinkGithub", null, "", "Github 链接", "Github主页链接, 显示在页脚."));
    $form->addInput(new Hidden("ColorSchemeCSS"));
    require("settings-header.php");
}

function themeInit(Archive $context): void {
    $responder = Matecho::ApiProvider($context);
    if ($responder) {
        $responder->respond();
        exit();
    }
    $options = Helper::options();
    Matecho::$BeiAnText = $options->BeiAnText ?? "";
    Matecho::$ExtraCode = $options->ExtraCode ?? "";
    Matecho::$LinkBilibili = $options->LinkBilibili ?? "";
    Matecho::$LinkTwitter = $options->LinkTwitter ?? "";
    Matecho::$LinkGithub = $options->LinkGithub ?? "";
    if ($options->ColorSchemeCache && $options->ColorScheme && !file_exists(__DIR__."/assets/color-scheme.css")) {
        Matecho::generateThemeCSS();
    }

    if ($options->ExSearchIntegration === "enhanced") {
        Matecho::ExSearchIntegration();
    }

    Matecho::$CoverList = array_values(array_filter(scandir(__DIR__."/assets/covers"), function($c) {
        return $c != "." && $c != "..";
    }));
}

function themePageFields(\Typecho\Widget\Helper\Layout $layout) {
    $layout->addItem(new Text("CustomIcon", null, null, "自定义图标", "独立页面可指定展示在侧栏时的图标, 需要在编译时加入"));
}
function themeFields(\Typecho\Widget\Helper\Layout $layout){
    $layout->addItem(new Text("cover", null, null, "文章封面", "替代文章默认的封面"));
    $layout->addItem(new Text("description", null, null, "文章描述", "替代文章内容显示在文章列表中文章标题的下方"));
    $layout->addItem(new Radio("TwitterCardStyle", ["" => "默认", "summary" => "小图(标题+描述)", "summary_large_image" => "大图(仅标题)"], null, "X(Twitter) 链接卡片样式", "设置twitter:card值, 在把文章链接分享到Twitter时展示成不同样式."));
    require_once("editor-helper.php");
}

class Matecho {
    static string $BeiAnText;
    static string $ExtraCode;
    static string $LinkBilibili;
    static string $LinkTwitter;
    static string $LinkGithub;
    static array $CoverList = [];

    static array $LangExtMap = [
        "assembly" => "asm",
        "ats" => "ats",
        "bash" => "sh",
        "c" => "c",
        "clisp" => "lsp",
        "clojure" => "clj",
        "cobol" => "cob",
        "coffeescript" => "coffee",
        "cpp" => "cpp",
        "crystal" => "cr",
        "csharp" => "cs",
        "d" => "d",
        "dart" => "dart",
        "elixir" => "ex",
        "elm" => "elm",
        "erlang" => "erl",
        "fsharp" => "fs",
        "go" => "go",
        "groovy" => "groovy",
        "guile" => "scm",
        "hare" => "ha",
        "haskell" => "hs",
        "idris" => "idr",
        "java" => "java",
        "javascript" => "js",
        "julia" => "jl",
        "kotlin" => "kt",
        "lua" => "lua",
        "mercury" => "m",
        "nim" => "nim",
        "nix" => "nix",
        "ocaml" => "ml",
        "pascal" => "pp",
        "perl" => "perl",
        "php" => "php",
        "python" => "py",
        "raku" => "raku",
        "ruby" => "ruby",
        "rust" => "rs",
        "sac" => "sac",
        "scala" => "scala",
        "swift" => "swift",
        "typescript" => "ts",
        "zig" => "zig"
    ];

    static function assets(string $path = ''): void {
        echo Helper::options()->themeUrl.'/'.$path;
    }

    static function ApiProvider(Archive $context): ?Response {
        $options = Helper::options();
        $req = Request::getInstance();
        $res = Response::getInstance();
        $path = $req->getPathInfo();
        if ($req->isPost() && $path == "/api/runner") {
            $res->clean();
            $res->setContentType("application/json");
            if (!$options->GlotAccessToken) {
                $res->setStatus(500);
                return $res->addResponder(function() {
                    print_r('{ "message": "glot.io access token not exists." }');
                });
            }
            $body = json_decode(file_get_contents("php://input"), true);;
            if (!isset(self::$LangExtMap[$body["lang"]])) {
                $res->setStatus(500);
                return $res->addResponder(function() {
                    print_r('{ "message": "this lang is not supported." }');
                });
            }
            $curl = curl_init("https://glot.io/api/run/" . $body["lang"] . "/latest");
            curl_setopt_array($curl, [
                CURLOPT_POST => true,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_HEADER => false,
                CURLOPT_HTTPHEADER => [
                    "Content-Type: application/json",
                    "Authorization: Token " . $options->GlotAccessToken
                ],
                CURLOPT_POSTFIELDS => json_encode([
                    "files" => [
                        [
                            "name" => "main." . self::$LangExtMap[$body["lang"]],
                            "content" => $body["code"]
                        ]
                    ]
                ]),
                CURLOPT_RETURNTRANSFER => true
            ]);
            $resp = curl_exec($curl);
            curl_close($curl);
            return $res->addResponder(function() use ($resp) {
                print_r($resp);
            });
        }
        return null;
    }

    static function ExSearchIntegration() {
        $options = \Typecho\Widget::widget('Widget_Options');
		if (!isset($options->plugins['activated']['ExSearch'])) {
			return;
		}
        
        $hooks = \Typecho\Plugin::export();
        foreach($hooks["handles"]["Widget_Archive:header"] as $key => $hook) {
            if ($hook[0] === "ExSearch_Plugin" && $hook[1] === "header") {
                unset($hooks["handles"]["Widget_Archive:header"][$key]);
            }
        }
        foreach($hooks["handles"]["Widget_Archive:footer"] as $key => $hook) {
            if ($hook[0] === "ExSearch_Plugin" && $hook[1] === "footer") {
                unset($hooks["handles"]["Widget_Archive:footer"][$key]);
            }
        }

        \Typecho\Plugin::init($hooks);
    }

    static function ExSearchURL(): string {
        $options = \Typecho\Widget::widget('Widget_Options');
		if (!isset($options->plugins['activated']['ExSearch'])) {
			return "";
		}
        $db = \Typecho\Db::get();
        $row = $db->fetchRow($db->select()->from('table.exsearch')
                ->order('table.exsearch.id', \Typecho\Db::SORT_DESC)
                ->limit(1));
        $key = $row['key'];
        $setting = Helper::options()->plugin('ExSearch');
        if ($setting->static == 'true') {
            $ExSearch = \Typecho\Common::url('ExSearch/cache/cache-'.$key.'.json', Helper::options()->pluginUrl);
        } else {
            $ExSearch = \Typecho\Common::url('/ExSearch/?action=api&key='.$key, Helper::options()->index);
        }

        return $ExSearch;
    }

    static function Gravatar(string $mail,int $size = 40): void {
        echo Helper::options()->GravatarURL.md5(strtolower($mail)).'?s='.$size.'&d=mp';
    }

    static function cover(Archive $archive): void {
        if (!$archive->fields->cover) {
            $covers = self::$CoverList;
            if (!$covers || !count($covers)) return;
            $count = count($covers);
            self::assets("assets/covers/" . $covers[$archive->cid % $count]);
        } else {
            echo $archive->fields->cover;
        }

    }

    static function generateJSOptions(): void {
        $options = Helper::options();
        echo "<script>window.__MATECHO_OPTIONS__=" . json_encode([
            "KaTeX" => $options->EnableKaTeX ? true : false,
            "FancyBox" => $options->EnableFancyBox ? true : false,
            "Mermaid" => $options -> EnableMermaid ? true : false,
            "Highlighter" => $options->CodeHighlighter ?? "Prism",
            "ExSearch" => $options->ExSearchIntegration === "enhanced" ? self::ExSearchURL() : ""
        ]) . ";</script>";
    }

    static function toTag(string $tag, array $values, bool $self = false): string {
        $tag = "<" . $tag . " ";
        foreach ($values as $attr => $val) {
            $val = htmlspecialchars($val);
            $tag .= "$attr=\"$val\" ";
        }
        if ($self) {
            $tag .= "/>";
        } else {
            $tag .= "></" . $tag . ">";
        }
        return $tag;
    }

    static function generateOG(Archive $archive): void {
        $options = Helper::options();
        $meta = "";
        $meta .= self::toTag("meta", [
            "property" => "og:site_name",
            "content" => Helper::options()->title
        ], true);
        
        $meta .= self::toTag("meta", [
            "property" => "og:url",
            "content" => $archive->getArchiveUrl()
        ], true);

        if (strlen($options->TwitterCardRef) > 0) {
            $meta .= self::toTag("meta", [
                "property" => "twitter:site",
                "content" => $options->TwitterCardRef
            ], true);
        }

        if ($archive->getArchiveType() === "post" || $archive->getArchiveType() === "page") {
            $meta .= self::toTag("meta", [
                "property" => "og:type",
                "content" => "article"
            ], true);
            $title = $archive->title;
            if (strlen($title) == 0) {
                $title = "无标题文章";
            }
            $meta .= self::toTag("meta", [
                "property" => "og:title",
                "content" => $title
            ], true);

            if (!$archive->fields->cover) {
                $cover = $options->themeUrl.'/'."assets/images/" . $archive->cid % 6 .  ".png";
            } else {
                $cover = $archive->fields->cover;
                
            }
            $meta .= self::toTag("meta", [
                "property" => "og:image",
                "content" => $cover
            ], true);

            if (!$archive->hidden && $archive->fields->description) {
                $description = $archive->fields->description;
            } else {
                $description = $archive->description;
            }
            
            $meta .= self::toTag("meta", [
                "property" => "og:description",
                "content" => $description
            ], true);

            if (is_string($archive->fields->TwitterCardStyle) && $archive->fields->TwitterCardStyle !== "") {
                $style = $archive->fields->TwitterCardStyle;
            } else {
                $style = $options->TwitterCardDefaultStyle;
            }
            
            $meta .= self::toTag("meta", [
                "property" => "twitter:card",
                "content" => $style
            ], true);
        } else if ($archive->getArchiveType() === "index") {
            $meta .= self::toTag("meta", [
                "property" => "og:type",
                "content" => "website"
            ], true);
            $meta .= self::toTag("meta", [
                "property" => "og:title",
                "content" => Helper::options()->title
            ], true);

            
            $meta .= self::toTag("meta", [
                "property" => "og:description",
                "content" => Helper::options()->description
            ], true);
        }
        echo $meta;
    }

    static function generateThemeCSS(): void {
        $css = Helper::options()->ColorSchemeCSS;
        file_put_contents(__DIR__."/assets/color-scheme.css", $css);
    }

    static function themeCSS(): void {
        $options = Helper::options();
        if (!$options->ColorScheme) return;
        if ($options->ColorSchemeCache) {
            echo "<link rel=\"stylesheet\" href=\"". Helper::options()->themeUrl ."/assets/color-scheme.css?" . substr($options->ColorScheme, 1) . "\">";
        } else {
            $css = $options->ColorSchemeCSS;
            if (!$css) return;
            echo "<style>".$css."</style>";
        }
    }

    static function pageIcon(\Widget\Contents\Page\Rows $archive): string {
        if (strlen($archive->fields->CustomIcon) > 0) {
            return $archive->fields->CustomIcon;
        }
        switch ($archive->template) {
            case "page-links.php":
                return "link";
            default:
                return "insert-drive-file";
        }
    }

    static function activePage(Archive $archive, string $type, int $id = -1): void {
        $thisType = $archive->getArchiveType();
        if ($thisType == $type) {
            if ($thisType === "category" && $archive->getPageRow()["mid"] !== $id) return;
            if ($thisType === "tag" && $archive->getPageRow()["mid"] !== $id) return;
            if ($thisType === "page" && $archive->cid !== $id) return;
            echo "active";
        }
    }

    static function toComment(\Widget\Comments\Archive &$comments, bool $allowComment): void {   
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
                
                <mdui-button class="matecho-comment-reply h-6 min-w-0 w-3rem ml-2 inline-block" data-to-comment="<?php echo $comments->coid ?>" variant="text" class="h-8 min-w-0" <?php if(!$allowComment) {echo "disabled"; } ?>>
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
                        $row->setAccessible(true);
                        $r = $row->getValue($comments);
                        foreach($comments->children as $child) {
                            $row->setValue($comments, $child);
                            self::toComment($comments, $allowComment);
                        }                
                        $row->setValue($comments, $r);
                        $row->setAccessible(false);
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
                    <mdui-button class="matecho-comment-reply h-6 min-w-0 w-3rem ml-2 inline-block" data-to-comment="<?php echo $comments->coid ?>" variant="text" class="h-8 min-w-0" <?php if(!$allowComment) {echo "disabled"; } ?>>
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
                $row->setAccessible(true);
                $r = $row->getValue($comments);
                foreach($comments->children as $child) {
                    $row->setValue($comments, $child);
                    self::toComment($comments, $allowComment);
                }                
                $row->setValue($comments, $r); 
                $row->setAccessible(false);
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