# 学习 koa 源码的整体架构，打造属于自己的nodejs库

## 前言

>这是`学习源码整体架构系列`第七篇。整体架构这词语好像有点大，姑且就算是源码整体结构吧，主要就是学习是代码整体结构，不深究其他不是主线的具体函数的实现。本篇文章学习的是实际仓库的代码。

源码类文章，一般阅读量不高。已经有能力看懂的，自己就看了。不想看，不敢看的就不会去看源码。<br>
所以我的文章，尽量写得让想看源码又不知道怎么看的读者能看懂。

`学习源码整体架构系列`文章如下：
>1.[学习 jQuery 源码整体架构，打造属于自己的 js 类库](https://juejin.im/post/5d39d2cbf265da1bc23fbd42)<br>
>2.[学习 underscore 源码整体架构，打造属于自己的函数式编程类库](https://juejin.im/post/5d4bf94de51d453bb13b65dc)<br>
>3.[学习 lodash 源码整体架构，打造属于自己的函数式编程类库](https://juejin.im/post/5d767e1d6fb9a06b032025ea)<br>
>4.[学习 sentry 源码整体架构，打造属于自己的前端异常监控SDK](https://juejin.im/post/5dba5a39e51d452a2378348a)<br>
>5.[学习 vuex 源码整体架构，打造属于自己的状态管理库](https://juejin.im/post/5dd4e61a6fb9a05a5c010af0)<br>
>6.[学习 axios 源码整体架构，打造属于自己的请求库](https://juejin.im/post/5df349b5518825123751ba66)<br>

感兴趣的读者可以点击阅读。计划中：`express`、`vue-rotuer`源码。

本文学习的`koa`版本是`v2.11.0`。克隆的官方仓库的`master`分支。
TODO:
截至目前（2020年2月2日），最新一次`commit`是`2019-12-09 15:52 ZhaoXC` `dc4bc49673943e352`，`fix: fix ignore set withCredentials false (#2582)`。

本文仓库在这里[若川的 koa-analysis github 仓库 https://github.com/lxchuan12/koa-analysis](https://github.com/lxchuan12/koa-analysis)。求个`star`呀。

## vscode 调试 koa 源码方法

之前，我在知乎回答了一个问题[一年内的前端看不懂前端框架源码怎么办？](https://www.zhihu.com/question/350289336/answer/910970733)
推荐了一些资料，阅读量还不错，大家有兴趣可以看看。主要有四点：<br>
>1.借助调试<br>
>2.搜索查阅相关高赞文章<br>
>3.把不懂的地方记录下来，查阅相关文档<br>
>4.总结<br>

看源码，调试很重要，所以我详细写下 `axios` 源码调试方法，帮助一些可能不知道如何调试的读者。

```bash
git clone https://github.com/koajs/koa.git
```

克隆源码后，看`package.json`找到`main`，就知道入口文件是`lib/application.js`了。

```json
// package.json
{
  "name": "koa",
  "version": "2.11.0",
  "description": "Koa web app framework",
  "main": "lib/application.js",
}
```

大概看完项目结构后发现没有`examples`文件夹（一般项目都会有这个文件夹，告知用户如何使用该项目），这时仔细看`README.md`。
如果看英文`README.md`有些吃力，会发现在`Community`标题下有一个[中文文档 v2.x](https://github.com/demopark/koa-docs-Zh-CN)。同时也有一个[`examples`仓库](https://github.com/koajs/examples)。

```bash
git clone https://github.com/koajs/examples.git
```

这时再把`examples`克隆到自己电脑。本文就是通过这个`examples`文件夹中的例子，来调试阅读源码的。

```bash
# 给examples 和 koa 两个目录安装依赖
npm i
```

`koa` 洋葱模型比较重要，本文就根据`examples`中的`compose`例子来调试阅读源码。用`vscode`，打开`koa-analysis/examples/compose/app.js`文件。按`F5`打开调试模式。

```json
{
    // 使用 IntelliSense 了解相关属性。 
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "启动程序",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/examples/compose/app.js"
        }
    ]
}
```

读者可以直接克隆我的代码来学习。

```bash
git clone https://github.com/lxchuan12/koa-analysis.git
```

上述比较啰嗦的写了一堆调试方法。主要是想着`授人予鱼不如授人予渔`，这样换成其他源码也会调试了。更多调试相关也可以看慕课网这个视频[node.js调试入门](https://www.imooc.com/learn/1093)，讲得还是比较详细的。

### 先看 new Koa() 结果是什么

看示例文件路径
`koa-analysis/examples/compose/app.js`，

```js
const compose = require('koa-compose');
const Koa = require('../../koa/lib/application');
const app = module.exports = new Koa();

console.log({koa: app}, 'app-new-koa()');
```

开始有这么几行代码，我们先不研究具体实现。先看下执行`new Koa()`之后，`app`是什么，有个初步印象。

TODO: 画图。

### componse

```js
const compose = require('koa-compose');
const Koa = require('../../koa/lib/application');
// const Koa = require('koa');
const app = module.exports = new Koa();

console.log({koa: app}, 'app-new-koa()');
// x-response-time

async function responseTime(ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.set('X-Response-Time', ms + 'ms');
}

// logger

async function logger(ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  if ('test' != process.env.NODE_ENV) {
    console.log('%s %s - %s', ctx.method, ctx.url, ms);
  }
}

// response

async function respond(ctx, next) {
  await next();
  if ('/' != ctx.url) return;
  ctx.body = 'Hello World';
}

// composed middleware

const all = compose([
  responseTime,
  logger,
  respond
]);

app.use(all);

if (!module.parent) app.listen(3000);
```

![中间件gif图](./images/middleware.gif)


## 源码

## 推荐阅读

[知乎@姚大帅：可能是目前市面上比较有诚意的Koa2源码解读](https://zhuanlan.zhihu.com/p/34797505)<br>
[koa 官网](https://koajs.com/)<br>
[koa 仓库](https://github.com/koajs/koa)<br>
[koa2 中文文档](https://github.com/demopark/koa-docs-Zh-CN)<br>
[知乎@零小白：十分钟带你看完 KOA 源码](https://zhuanlan.zhihu.com/p/24559011)<br>
[微信开放社区@小丹の：可能是目前最全的koa源码解析指南](https://developers.weixin.qq.com/community/develop/article/doc/0000e4c9290bc069f3380e7645b813)<br>
[思否@RickyLong 高质量 - Koa 源码解析](https://segmentfault.com/a/1190000021109975)

## 另一个系列

[面试官问：JS的继承](https://juejin.im/post/5c433e216fb9a049c15f841b)<br>
[面试官问：JS的this指向](https://juejin.im/post/5c0c87b35188252e8966c78a)<br>
[面试官问：能否模拟实现JS的call和apply方法](https://juejin.im/post/5bf6c79bf265da6142738b29)<br>
[面试官问：能否模拟实现JS的bind方法](https://juejin.im/post/5bec4183f265da616b1044d7)<br>
[面试官问：能否模拟实现JS的new操作符](https://juejin.im/post/5bde7c926fb9a049f66b8b52)<br>

## 关于

作者：常以**若川**为名混迹于江湖。前端路上 | PPT爱好者 | 所知甚少，唯善学。<br>
[若川的博客](https://lxchuan12.cn/posts/)，使用`vuepress`重构了，阅读体验可能更好些<br>
[掘金专栏](https://juejin.im/user/57974dc55bbb500063f522fd/posts)，欢迎关注~<br>
[`segmentfault`前端视野专栏](https://segmentfault.com/blog/lxchuan12)，欢迎关注~<br>
[知乎前端视野专栏](https://zhuanlan.zhihu.com/lxchuan12)，欢迎关注~<br>
[github blog](https://github.com/lxchuan12/blog)，相关源码和资源都放在这里，求个`star`^_^~

## 欢迎加微信交流 微信公众号

可能比较有趣的微信公众号，长按扫码关注。欢迎加我微信`lxchuan12`（注明来源，基本来者不拒），拉您进【前端视野交流群】，长期交流学习~

![若川视野](https://github.com/lxchuan12/blog/raw/master/docs/about/wechat-official-accounts-mini.jpg)