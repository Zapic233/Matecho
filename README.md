# Matecho

Material Design typecho theme base on MDUI.
![screenshot](https://media.githubusercontent.com/media/KawaiiZapic/Matecho/md3/public/screenshot.png)

## 特性

1. 自定义主题色
2. 使用分块和按需加载技术, 首屏(不包括图片)只需要`100 KBytes`的资源, 根据文章的内容自动确定需要加载的插件.
3. 支持`Fancybox`图片灯箱
4. 支持`Prism`/`Shiki`代码高亮
5. 支持`KaTeX`公式渲染
6. 支持`OpenGraph`/`TwitterCard`, 在受支持的应用中以卡片形式展示文章链接
7. `ExSearch`前端即时搜索增强集成(使用主题自带样式而不是使用它默认的搜索弹窗)
8. `Mailer`邮件插件集成
9. 完善的响应式支持, 手机电脑共用一套主题
10. 使用最新的Web技术构建, 并向前兼容到`Chrome >= 63`, `Firefox >= 67`, `Safari >= 11`(对于较旧的浏览器仅包括有限的支持)

## 安装

1. 从Releases下载最新版的主题文件或者Action中下载自动构建的测试版主题
2. 将主题解压到`/usr/themes/Matecho/`中
3. 在Typecho设置中启用主题

## 开发

使用`localhost`作为域名安装Typecho, 并暴露在`80`, 安装Typecho后, 将`dist`文件夹软链接到Typecho目录中`/usr/themes/Matecho/`  
Vite被配置为从PHP服务器拉取HTML再处理, 故Vite需要能够访问到PHP服务器.  
同时需要配置Typecho的`站点地址`为Vite暴露的开发服务器地址, 否则某些静态资源可能会出现跨域问题.  
如果需要使用其他域名, 需要修改Vite设置`server.host`为相同域名.  
使用其他域名时, 由于浏览器安全限制, 除`localhost`外的域名在不启用SSL的情况下无法使用某些特性.  
如果需要启用SSL, 需要同时为PHP服务器和Vite都配置SSL, 否则会导致请求来源不匹配, 无法在`dev`环境里使用评论等功能.

```
pnpm i
pnpm dev
```

**注意**

1. 该项目并未预期直接修改编译后产物, 构建过程包括很多重要的逻辑, 务必从源码修改后编译
2. 以`m-`开头的CSS类在由UnoCSS在构建过程中自动生成, 会随源码改变而改变, 不可依赖其定位元素

## 构建

```
pnpm i
pnpm build
```

生成在`dist`目录下, 重命名`dist`文件夹到`Matecho`, 并放在`usr/theme`下.
