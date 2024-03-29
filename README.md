# Matecho

Material Design typecho theme base on MDUI.
![screenshot](https://media.githubusercontent.com/media/KawaiiZapic/Matecho/md3/public/screenshot.png)

## 特性

1. 自定义主题色
2. 使用分块和按需加载技术, 首屏(不包括图片)只需要`100 KBytes`的资源, 根据文章的内容自动确定需要加载的插件.
3. 支持`Fancybox`图片灯箱(按需加载)
4. 支持`Prism`代码高亮(按需加载)
5. 支持`KaTeX`公式渲染(按需加载)
6. 使用最新的Web技术构建, 并向后兼容到`Chrome >= 63`, `Firefox >= 67`, `Safari >= 11`(对于较旧的浏览器仅包括有限的支持)

## 安装

1. 从Releases下载最新版的主题文件或者Action中下载自动构建的测试版主题
2. 将主题解压到`/usr/themes/Matecho/`中
3. 在Typecho设置中启用主题

## 开发

```
pnpm i
pnpm dev
```

这将自动检测文件修改并重新构建项目, 将`dist`文件夹软链接到`/usr/themes/Matecho`, 启用主题即可.  
这会禁用代码压缩, 不建议用于最终上线环境.

**注意**

1. 该项目并未预期直接修改编译后产物, 构建过程包括很多重要的逻辑, 务必从源码修改后编译
2. 以`m-`开头的CSS类在由UnoCSS在构建过程中自动生成, 会随源码改变而改变, 不可依赖其定位元素

## 构建

```
pnpm i
pnpm build
```

生成在`dist`目录下, 重命名`dist`文件夹到`Matecho`, 并放在`usr/theme`下.
