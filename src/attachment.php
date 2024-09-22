<?php
if (!defined('__TYPECHO_ROOT_DIR__'))
    exit;

/** @var \Widget\Archive $this */
$this->need('header.php');
abstract class TypechoAttachment extends \Typecho\Config {
    public string $name;
    public string $path;
    public string $type;
    public string $mime;
    public string $url;
    public bool $isImage;
    public int $size;
}
function formatBytes($size, $precision = 2) {
    $base = log($size, 1024);
    $suffixes = ['B', 'KB', 'MB', 'GB', 'TB'];   

    return round(pow(1024, $base - floor($base)), $precision) .' '. $suffixes[floor($base)];
}

/** @var TypechoAttachment $file */
$file = $this->attachment;
?>

<div class="matecho-article-wrapper mx-auto px-0 md:px-2 box-border max-w-840px h-full">
    <div class="flex pt-20 items-center justify-center flex-col flex-gap-1 px-2">
        <?php if ($file->isImage) { ?>
            <img class="w-full max-w-640px h-auto object-contain" src="<?php echo $file->url; ?>" alt="<?php echo $file->name ?>">
        <?php } else { ?>
            <mdui-icon-insert-drive-file class="w-72px h-72px"></mdui-icon-insert-drive-file>
        <?php } ?>
        <span class="mt-2">
            <?php echo $file->name; ?>
        </span>
        <span class="opacity-60 text-sm">
            <?php echo formatBytes($file->size); ?>
        </span>
        <a download="<?php echo $file->name ?>" href="<?php echo $file->url; ?>" class="mt-3">
            <mdui-button>
                <mdui-icon-file-download--outlined slot="icon"></mdui-icon-file-download--outlined>
                下载
            </mdui-button>
        </a>
    </div>
</div>
<script type="module">
    import "virtual:components/attachment";
</script>
<?php $this->need('footer.php'); ?>