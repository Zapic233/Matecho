<?php if (!defined('__TYPECHO_ROOT_DIR__')) exit; ?>
<!DOCTYPE html>
<html lang="zh-CN" class="mdui-theme-auto">
<head>
	<meta charset="<?php $this->options->charset(); ?>">
	<meta name="theme-color" content="<?php echo Matecho::$ThemeColor; ?>">
	<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
	<title><?php $this->archiveTitle(array(
		'category' => _t('分类 %s 下的文章'),
		'search' => _t('包含关键字 %s 的文章'),
		'tag' => _t('标签 %s 下的文章'),
		'author' => _t('%s 发布的文章')
	),'',' - '); ?><?php $this->options->title(); ?></title>

    <link rel="stylesheet" crossorigin href="src/index.css">
    <?php $this->header(); ?>
</head>
<body>
    <mdui-layout>
        <mdui-top-app-bar scroll-behavior="shrink" variant="large" class="fixed! matecho-app-bar__<?php echo $this->archiveType;?>" id="matecho-app-bar">
            <mdui-button-icon id="matecho-drawer-btn">
                <mdui-icon-menu></mdui-icon-menu>
            </mdui-button-icon>
            <mdui-top-app-bar-title class="matecho-app-bar-title">
                <?php $this->archiveType === 'index' ? $this->options->title() : $this->archiveTitle(array(
                    'category' => _t('分类 %s 下的文章'),
                    'search' => _t('包含关键字 %s 的文章'),
                    'tag' => _t('标签 %s 下的文章'),
                    'author' => _t('%s 发布的文章')
                ),'','');?>
                <div slot="label-large" id="matecho-app-bar-large-label">
                    <div class="md:pl-8 flex flex-col" id="matecho-app-bar-large-label__inner">
                        <?php if ($this->archiveType === "post") { ?>
                        <div class="text-sm mb-2 uppercase" style="color: rgb(var(--mdui-color-primary-light));">
                            <?php $this->category(" | "); ?>
                        </div>
                        <?php } ?>
                        <div class="truncate text-5xl line-height-[1.4]">
                            <?php $this->archiveType === 'index' ? $this->options->title() : $this->archiveTitle(array(
                                'category' => _t('分类 %s 下的文章'),
                                'search' => _t('包含关键字 %s 的文章'),
                                'tag' => _t('标签 %s 下的文章'),
                                'author' => _t('%s 发布的文章')
                            ),'','');?>
                        </div>
                        <div class="text-sm opacity-80 block mt-3">
                            <?php
                            if ($this->archiveType === 'index') {
                                $this->options->description();
                            } else if ($this->archiveType === 'post') {
                                if (!$this->hidden && $this->fields->description) {
                                    echo $this->fields->description;
                                }
                            } else if ($this->archiveType === "category") {
                                printf("共 %d 篇文章", $this->getTotal());
                            } else {
                                echo $this->archiveType;
                            }
                            ?>
                        </div>
                    </div>
                </div>
            </mdui-top-app-bar-title>

            <div style="flex-grow: 1"></div>
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
