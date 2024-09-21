<?php
if (!defined('__TYPECHO_ROOT_DIR__'))
    exit;

/** @var \Widget\Archive $this */
?>

<mdui-navigation-drawer close-on-overlay-click id="matecho-drawer" modal>
    <nav>
        <mdui-list id="matecho-sidebar-list">
            <a href="/">
                <mdui-list-item rounded <?php Matecho::activePage($this, "index"); ?>>
                    <mdui-icon-home slot="icon"></mdui-icon-home>
                    首页
                </mdui-list-item>
            </a>
            <mdui-divider class="my-2"></mdui-divider>
            <mdui-collapse value="categories">
                <mdui-collapse-item value="categories">
                    <mdui-list-item slot="header" rounded>
                        <mdui-icon-widgets slot="icon"></mdui-icon-widgets>
                        <mdui-icon-expand-more slot="end-icon"></mdui-icon-expand-more>
                        分类
                    </mdui-list-item>
                    <?php
                    $this->widget('Widget_Metas_Category_List')->to($category);
                    /** @var \Widget\Metas\Category\Rows $category */
                    while ($category->next()) {
                        if ($category->parent != 0)
                            continue;
                        ?>
                        <a href="<?php $category->permalink() ?>">
                            <mdui-list-item rounded class="pl-40px" <?php Matecho::activePage($this, "category", $category->mid); ?>>
                                <?php echo $category->name ?>
                                <span class="text-xs opacity-60"
                                    slot="description"><?php echo $category->description ?></span>
                                    
                                <span slot="end-icon"><?php echo $category->count ?></span>
                            </mdui-list-item>
                        </a>
                    <?php } ?>
                </mdui-collapse-item>
                <mdui-collapse-item value="tags">
                    <mdui-list-item slot="header" rounded>
                        <mdui-icon-label slot="icon"></mdui-icon-label>
                        <mdui-icon-expand-more slot="end-icon"></mdui-icon-expand-more>
                        标签
                    </mdui-list-item>
                    <?php
                    $this->widget('Widget_Metas_Tag_Cloud')->to($tags);
                    /** @var \Widget\Metas\Tag\Cloud $tags */
                    while ($tags->next()) {
                        if ($tags->parent != 0)
                            continue;
                        ?>
                        <a href="<?php $tags->permalink() ?>">
                            <mdui-list-item rounded class="pl-40px" <?php Matecho::activePage($this, "tag", $tags->mid); ?>>
                                <?php echo $tags->name; ?>
                                <span class="text-xs opacity-60"
                                    slot="description"><?php echo $tags->description ?></span>
                                <span slot="end-icon"><?php echo $tags->count ?></span>
                            </mdui-list-item>
                        </a>
                    <?php } ?>
                </mdui-collapse-item>
            </mdui-collapse>
            <mdui-divider class="my-2"></mdui-divider>
            <?php
            $this->widget('Widget_Contents_Page_List')->to($page);
            /** @var \Widget\Contents\Page\Rows $page */
            while ($page->next()) {
                ?>
                <a href="<?php $page->permalink() ?>">
                    <mdui-list-item rounded <?php Matecho::activePage($this, "page", $page->cid); ?>>
                        <?php
                        $icon = Matecho::pageIcon($page);
                        echo "<mdui-icon-$icon slot=\"icon\"></mdui-icon-$icon>";
                        ?>
                        <?php echo $page->title ?>
                    </mdui-list-item>
                </a>
            <?php } ?>
        </mdui-list>
    </nav>
</mdui-navigation-drawer>