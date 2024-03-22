<?php 
if (!defined('__TYPECHO_ROOT_DIR__')) exit; 

/** @var \Widget\Archive $this */
?>
<!DOCTYPE html>
<html lang="zh-CN" class="mdui-theme-auto">
<head>
	<meta charset="<?php $this->options->charset(); ?>">
	<meta name="theme-color" content="<?php echo Matecho::$ThemeColor; ?>">
	<meta name="matecho-template" content="<?php echo $this->getArchiveType() ?>">
	<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
	<title><?php $this->archiveTitle(array(
		'category' => _t('分类 %s 下的文章'),
		'search' => _t('包含关键字 %s 的文章'),
		'tag' => _t('标签 %s 下的文章'),
		'author' => _t('%s 发布的文章')
	),'',' - '); ?><?php $this->options->title(); ?></title>

    <link rel="stylesheet" href="@/style/header.css">
    <script type="module" src="@/index.ts"></script>
    <script>window.__MATECHO_THEME_ROOT__="/__VIRTUAL_THEME_ROOT__/";</script>
    <?php $this->header(); ?>
</head>
<body>
    <mdui-layout>
        <mdui-top-app-bar scroll-behavior="shrink" variant="large" class="fixed! matecho-app-bar__<?php echo $this->archiveType;?>" id="matecho-app-bar">
            <mdui-button-icon id="matecho-drawer-btn">
                <mdui-icon-menu></mdui-icon-menu>
            </mdui-button-icon>
            <mdui-top-app-bar-title class="matecho-app-bar-title">
                <span id="matecho-app-bar-title"><?php $this->archiveType === 'index' ? $this->options->title() : $this->archiveTitle(array(
                    'category' => _t('分类 %s 下的文章'),
                    'search' => _t('包含关键字 %s 的文章'),
                    'tag' => _t('标签 %s 下的文章'),
                    'author' => _t('%s 发布的文章')
                ),'','');?></span>
                <span slot="label-large"></span>
            </mdui-top-app-bar-title>

            <div class="flex flex-grow-1 justify-end">
                <form action="/" method="post" role="search">
                    <mdui-text-field placeholder="搜索" disabled variant="outlined" class="mt--4px" type="search" id="matecho-top-search-bar">
                        <mdui-button-icon slot="icon" id="matecho-top-search-btn">
                            <mdui-icon-search></mdui-icon-search>
                        </mdui-button-icon>
                    </mdui-text-field>
                    <input type="hidden" id="matecho-top-search-bar__hidden" name="s">
                </form>
            </div>
            <mdui-button-icon href="<?php $this->options->adminUrl(); ?>" target="_blank">
                <?php if ($this->user->hasLogin()){ ?>
                    <mdui-icon-settings></mdui-icon-settings>
                <?php } else { ?>
                    <mdui-icon-login></mdui-icon-login>
                <?php } ?>
            </mdui-button-icon>
        </mdui-top-app-bar>
        <?php $this->need('sidebar.php'); ?>
        <mdui-layout-main class="overflow-hidden min-h-100vh" id="matecho-main">
            <div id="matecho-pjax-main">
