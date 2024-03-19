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
}

