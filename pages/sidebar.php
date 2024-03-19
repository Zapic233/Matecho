<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/** @var \Widget\Archive $this */
?>

<mdui-navigation-drawer class="fixed! z-10000 top-64px! md:w-240px" close-on-overlay-click id="matecho-drawer">
    <mdui-list id="matecho-sidebar-list">
        <a href="/">
            <mdui-list-item>
                <mdui-icon-home slot="icon"></mdui-icon-home>
                首页
            </mdui-list-item>
        </a>
        <mdui-collapse accordion value="categories"> 
            <mdui-collapse-item value="categories">
                <mdui-list-item slot="header">
                    <mdui-icon-category slot="icon"></mdui-icon-category>
                    分类
                </mdui-list-item>
                <?php 
                    $this->widget('Widget_Metas_Category_List')->to($category);
                    /** @var \Widget\Metas\Category\Rows $category */
		            while ($category->next()) {
                        if ($category->parent != 0) continue;
                    ?>
                        <a href="<?php $category->permalink() ?>">
                            <mdui-list-item class="pl-10">
                                <?php echo $category->name ?>
                            </mdui-list-item>
                        </a>
		        <?php } ?>
            </mdui-collapse-item>
        </mdui-collapse>
        <mdui-divider></mdui-divider>
        <?php 
            $this->widget('Widget_Contents_Page_List')->to($page);
            /** @var \Widget\Contents\Page\Rows $page */
		    while ($page->next()) {
        ?>
                <a href="<?php $page->permalink() ?>">
                    <mdui-list-item>
                        <?php 
                            $icon = Matecho::pageIcon($page->template);
                            echo "<mdui-icon-$icon slot=\"icon\"></mdui-icon-$icon>" ;
                        ?>
                        <?php echo $page->title ?>
                    </mdui-list-item>
                </a>
		<?php } ?>
    </mdui-list>
</mdui-navigation-drawer>
