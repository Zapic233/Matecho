<?php 
if (!defined('__TYPECHO_ROOT_DIR__')) exit; 

/** @var \Widget\Archive $this */
?>
<!DOCTYPE html>
<html lang="zh-CN" class="mdui-theme-auto matecho-theme-scheme">
<head>
	<meta charset="<?php $this->options->charset(); ?>">
	<meta name="matecho-template" content="<?php echo $this->template ? substr($this->template, 0, -4) : $this->getArchiveType(); ?>">
    <meta name="theme-color" content="">
	<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
	<title><?php $this->archiveTitle(array(
		'category' => _t('分类 %s 下的文章'),
		'search' => _t('包含关键字 %s 的文章'),
		'tag' => _t('标签 %s 下的文章'),
		'author' => _t('%s 发布的文章')
	),'',' - '); ?><?php $this->options->title(); ?></title>
    <style>.un-br{position:fixed;top:0;left:0;width:100%;height:100%;background-color:#eee;text-align:center;z-index: 99999;}.un-br_sf{font-size: 5em; color:#999;}@media(prefers-color-scheme:dark){.un-br{color:white;background-color:#1f1f1f;}.un-br_sf{color: #ccc;}}:not(:defined){visibility:hidden}#m-loading-wrapper{position:fixed;top:0;left:0;z-index:100;display:flex;width:100%;height:100vh;align-items:center;justify-content:center;background:rgb(var(--mdui-color-background))}.loading-circle{display:block;animation:rotate 2s linear infinite;height:75px;transform-origin:center center;width:75px;fill:none;stroke-width:3;stroke:rgb(var(--mdui-color-primary))}.loading-path{stroke-dasharray:150,200;stroke-dashoffset:-10;animation:dash 1.5s ease-in-out infinite;stroke-linecap:round}@keyframes rotate{to{transform:rotate(360deg)}}@keyframes dash{0%{stroke-dasharray:1,200;stroke-dashoffset:0}50%{stroke-dasharray:89,200;stroke-dashoffset:-35}to{stroke-dasharray:89,200;stroke-dashoffset:-124}}</style>
    <link rel="stylesheet" href="/src/style/main.less">
    <script type="module" src="/src/main.ts"></script>
    <?php Matecho::generateOG($this) ?>
    <?php $this->header("commentReply=&antiSpam="); ?>
</head>
<body>
    <noscript>
        <div class="un-br">
			<h1 class="un-br_sf">{ >_ ; }</h1> 
			<h1>必须启用Javascript</h1>
			<p>您禁止了JavaScript，本站依赖于JavaScript正常工作。</p>
        </div>
	</noscript>
    <div id="m-loading-wrapper">
		<svg class="loading-circle" viewBox="25 25 50 50">
			<circle
				class="loading-path"
				cx="50"
				cy="50"
				r="20"
			/>
		</svg>
	</div>
    <mdui-top-app-bar scroll-behavior="shrink" variant="large" class="matecho-app-bar__<?php echo $this->archiveType;?>" id="matecho-app-bar">
        <mdui-button-icon aria-label="导航栏" id="matecho-drawer-btn">
            <mdui-icon-menu></mdui-icon-menu>
        </mdui-button-icon>
        <mdui-top-app-bar-title id="matecho-app-bar-title" style="display: none;">
            <span id="matecho-app-bar-title__inner"><?php $this->archiveType === 'index' ? $this->options->title() : $this->archiveTitle(array(
                'category' => _t('分类 %s 下的文章'),
                'search' => _t('包含关键字 %s 的文章'),
                'tag' => _t('标签 %s 下的文章'),
                'author' => _t('%s 发布的文章')
            ),'','');?></span>
            <span slot="label-large"></span>
        </mdui-top-app-bar-title>

        <div class="flex flex-grow-1 justify-end">
            <form action="/" method="post" role="search" enctype="multipart/form-data">
                <mdui-text-field autocomplete="off" name="s" placeholder="搜索" disabled variant="outlined" clearable class="mt--4px search-form-input" type="search" id="matecho-top-search-bar">
                    <mdui-button-icon name="搜索" slot="icon" id="matecho-top-search-btn">
                        <mdui-icon-search></mdui-icon-search>
                    </mdui-button-icon>
                </mdui-text-field>
            </form>
        </div>
        <mdui-button-icon name="管理面板" href="<?php $this->options->adminUrl(); ?>" target="_blank" nofollow>
            <?php if ($this->user->hasLogin()){ ?>
                <mdui-icon-settings></mdui-icon-settings>
            <?php } else { ?>
                <mdui-icon-login></mdui-icon-login>
            <?php } ?>
        </mdui-button-icon>
    </mdui-top-app-bar>
    <main id="matecho-main">
        <?php $this->need('sidebar.php'); ?>
        <div id="matecho-pjax-main">
