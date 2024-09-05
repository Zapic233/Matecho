<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** @var \Widget\Archive $this */
?>

<mdui-navigation-rail id="matecho-side-nav" class="hidden md:block fixed" contained>
    <a href="/">
        <mdui-navigation-rail-item <?php Matecho::activePage($this, "index"); ?> >
            <mdui-icon-home slot="icon"></mdui-icon-home>
            首页
        </mdui-navigation-rail-item>
    </a>
    <a>
    <mdui-navigation-rail-item>
        <mdui-icon-category slot="icon"></mdui-icon-category>
        分类
    </mdui-navigation-rail-item>
    </a>
    <?php 
            $this->widget('Widget_Contents_Page_List')->to($page);
            /** @var \Widget\Contents\Page\Rows $page */
		    while ($page->next()) {
        ?>
                <a href="<?php $page->permalink() ?>">
                    <mdui-navigation-rail-item <?php Matecho::activePage($this, "page", $page->cid); ?> >
                        <?php 
                            $icon = Matecho::pageIcon($page);
                            echo "<mdui-icon-$icon slot=\"icon\"></mdui-icon-$icon>" ;
                        ?>
                        <?php echo $page->title ?>
                    </mdui-navigation-rail-item>
                </a>
		<?php } ?>
</mdui-navigation-rail>

<mdui-navigation-drawer close-on-overlay-click id="matecho-drawer" modal>
    <nav>
        <mdui-list id="matecho-sidebar-list">
        <a href="/">
            <mdui-list-item rounded <?php Matecho::activePage($this, "index"); ?> >
                <mdui-icon-home slot="icon"></mdui-icon-home>
                首页
            </mdui-list-item>
        </a>
        <mdui-divider></mdui-divider>
        <mdui-list-subheader>分类</mdui-list-subheader>
        <?php 
            $this->widget('Widget_Metas_Category_List')->to($category);
            /** @var \Widget\Metas\Category\Rows $category */
		    while ($category->next()) {
                if ($category->parent != 0) continue;
            ?>
                <a href="<?php $category->permalink() ?>">
                    <mdui-list-item rounded class="pl-42px" <?php Matecho::activePage($this, "category", $category->mid); ?> >
                        <?php echo $category->name ?>
                        <span class="text-xs opacity-60" slot="description"><?php echo $category->description ?></span>
                    </mdui-list-item>
                </a>
		<?php } ?>
        <mdui-divider></mdui-divider>
        <?php 
            $this->widget('Widget_Contents_Page_List')->to($page);
            /** @var \Widget\Contents\Page\Rows $page */
		    while ($page->next()) {
        ?>
                <a href="<?php $page->permalink() ?>">
                    <mdui-list-item rounded <?php Matecho::activePage($this, "page", $page->cid); ?> >
                        <?php 
                            $icon = Matecho::pageIcon($page);
                            echo "<mdui-icon-$icon slot=\"icon\"></mdui-icon-$icon>" ;
                        ?>
                        <?php echo $page->title ?>
                    </mdui-list-item>
                </a>
		<?php } ?>
        </mdui-list>
    </nav>
</mdui-navigation-drawer>
