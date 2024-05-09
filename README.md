# Matecho

Material Design typecho theme base on MDUI.
![screenshot](https://media.githubusercontent.com/media/KawaiiZapic/Matecho/md3/public/screenshot.png)

## 特性

1. 自定义主题色
2. 使用分块和按需加载技术, 首屏(不包括图片)只需要`100 KBytes`的资源, 根据文章的内容自动确定需要加载的插件.
3. 支持`Fancybox`图片灯箱
4. 支持`Prism`/`Shiki`代码高亮
5. 支持`KaTeX`公式渲染
6. 支持`Mermaid`图表绘制
7. 支持`OpenGraph`/`TwitterCard`, 在受支持的应用中以卡片形式展示文章链接
8. `ExSearch`前端即时搜索增强集成(使用主题自带样式而不是使用它默认的搜索弹窗)
9. `Mailer`邮件插件集成
10. 完善的响应式支持, 手机电脑共用一套主题
11. 使用最新的Web技术构建, 并向前兼容到`Chrome >= 63`, `Firefox >= 67`, `Safari >= 11`(对于较旧的浏览器仅包括有限的支持)

## 安装

1. 从Releases下载最新版的主题文件或者Action中下载自动构建的测试版主题
2. 将主题解压到`/usr/themes/Matecho/`中
3. 在Typecho设置中启用主题

## 自定义

如果需要快速修改源码, 可以Fork此仓库, 并启用Github Action, 在网页上直接修改源码, 提交后自动触发构建, 可以在Artifact里找到构建好的主题.
在项目根目录下创建`matecho.config.ts`, 写入以下模板:

```ts
export default {
    PrismLanguages: [];
    ExtraMaterialIcons: [];
}
```

#### 自定义Prism支持的语言

Prism语言包较小, 如果按Shiki动态加载语言会造成较大的overhead, 因此引入Prism时会直接将所有需要的语言包打包好. 主题默认自带超过30种常用语言, 如果发现你所需的语言没有被打包, 可以在`PrismLanguages`中添加自己想要的语言:

```ts
export default {
    PrismLanguages: ["rust", "groovy"];
    ExtraMaterialIcons: [];
}
```

默认自带的语言参考`vite.config.ts`的`PrismJS`插件配置部分.

#### 自定义Material Icon图标

Material Icon图标非常多, 如果全部加载会使得文件巨大, 故主题只选取了部分图标打包. 如果需要其他的图标, 参考[MDUI图标组件库](https://www.mdui.org/zh-cn/docs/2/libraries/icons)添加.  
只需要写入图标名称即可, 如`import '@mdui/icons/4k-plus.js';`, 只需要填入`4k-plus`.

```ts
export default {
    PrismLanguages: [];
    ExtraMaterialIcons: ["4k-plus", "adjust--rounded"];
}
```

提交代码后, 如果已经启用Action, 主题会自动开始构建, 下载最新构建产物即可.

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

1. 该项目并未预期直接修改编译后产物, 构建过程包括很多重要的逻辑, 务必从源码修改后编译(参考上方"自定义"章节快速修改源码)
2. 以`m-`开头的CSS类在由UnoCSS在构建过程中自动生成, 会随源码改变而改变, 不可依赖其定位元素

## 构建

```
pnpm i
pnpm build
```

生成在`dist`目录下, 重命名`dist`文件夹到`Matecho`, 并放在`usr/theme`下.
