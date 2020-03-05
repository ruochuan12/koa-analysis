# 学习 koa 源码的整体架构，可能是最好懂的koa中间件分析

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

感兴趣的读者可以点击阅读。计划中：`express`、`vue-rotuer`源码，欢迎持续关注。

本文学习的`koa`版本是`v2.11.0`。克隆的官方仓库的`master`分支。
TODO:
截至目前（2020年2月29日），最新一次`commit`是`2020-01-04 07:41 Olle Jonsson` `eda27608`，`build: Drop unused Travis sudo: false directive (#1416)`。

本文仓库在这里[若川的 koa-analysis github 仓库 https://github.com/lxchuan12/koa-analysis](https://github.com/lxchuan12/koa-analysis)。求个`star`呀。

TODO: 导读：
如果你简历上一不小心写了熟悉`koa2`，面试官大概率会问：
>`koa2`洋葱模型怎么实现的。
>如果中间件中的`next()`方法报错了会怎样。

## vscode 调试 koa 源码方法

之前，我在知乎回答了一个问题[一年内的前端看不懂前端框架源码怎么办？](https://www.zhihu.com/question/350289336/answer/910970733)
推荐了一些资料，阅读量还不错，大家有兴趣可以看看。主要有四点：<br>
>1.借助调试<br>
>2.搜索查阅相关高赞文章<br>
>3.把不懂的地方记录下来，查阅相关文档<br>
>4.总结<br>

看源码，调试很重要，所以我详细写下 `koa` 源码调试方法，帮助一些可能不知道如何调试的读者。

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

这时再开心的把`examples`克隆到自己电脑。可以安装好依赖，逐个研究学习下这里的例子，然后可能就一不小心掌握了`koa`的基本用法。当然，我这里不详细写这一块了。

继续看文档会发现**使用指南**讲述`编写中间件`。

## 使用文档中的 中间件（koa-compose）例子来调试

学习 `koa-compose` 前，
引用[Koa中文文档](https://github.com/demopark/koa-docs-Zh-CN/blob/master/guide.md#debugging-koa)中的一段：

如果您是前端开发人员，您可以将 `next()`; 之前的任意代码视为“捕获”阶段，这个简易的 `gif` 说明了 `async` 函数如何使我们能够恰当地利用堆栈流来实现请求和响应流：
![中间件gif图](./images/middleware.gif)
>
>   1. 创建一个跟踪响应时间的日期
>   2. 等待下一个中间件的控制
>   3. 创建另一个日期跟踪持续时间
>   4. 等待下一个中间件的控制
>   5. 将响应主体设置为“Hello World”
>   6. 计算持续时间
>   7. 输出日志行
>   8. 计算响应时间
>   9. 设置 `X-Response-Time` 头字段
>   10. 交给 Koa 处理响应

看到这个`gif`图，我把之前写的`examples/koa-compose`的调试方法含泪删除了。默默写上`gif`图上的这些代码，想着这个读者们更容易读懂。
我把这段代码写在这里 [`koa/examples/middleware/app.js`](https://github.com/lxchuan12/koa-analysis/blob/master/koa/examples/middleware/app.js)便于调试。

<details>
<summary>gif图中的代码，点击这里展开，可以复制</summary>

```js
const Koa = require('../../lib/application');

// const Koa = require('koa');

const app = new Koa();

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

// response

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

</details>

`koa` 洋葱模型比较重要，用`vscode`，按`koa/examples/middleware/app.js`文件。按`F5`打开调试模式。

在项目路径下配置新建[.vscode/launch.json](https://github.com/lxchuan12/koa-analysis/blob/master/.vscode/launch.json)文件，`program`配置为自己写的`koa/examples/middleware/app.js`文件，按`F5键`开始调试。

<details>
<summary>.vscode/launch.json 代码，点击这里展开，可以复制</summary>

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
            "program": "${workspaceFolder}/koa/examples/middleware/app.js"
        }
    ]
}
```

</details>

读者可以直接克隆我的代码来学习。

```bash
git clone https://github.com/lxchuan12/koa-analysis.git
```

上述比较啰嗦的写了一堆调试方法。主要是想着`授人予鱼不如授人予渔`，这样换成其他源码也会调试了。

简单说下`chrome`调试，`chrome`浏览器打开`chrome://inspect`，点击配置**configure...**配置`127.0.0.1:端口号`(端口号在Vscode 调试控制台显示了)。

更多可以查看[English Debugging Guide](https://nodejs.org/en/docs/inspector)

[中文调试指南](https://nodejs.org/zh-cn/docs/guides/debugging-getting-started/)

更多调试相关也可以看慕课网这个视频[node.js调试入门](https://www.imooc.com/learn/1093)，讲得还是比较详细的，也可以用`chrome`调试。

## koa 主流程梳理简化

通过`F5`、`F10、F11`调试完整体其实比较容易整理出如下主流程的代码。

```js
class Emitter{
  // node 内置模块
  constructor(){
  }
}
class Koa extends Emitter{
  constructor(options){
    super();
    options = options || {};
    this.middleware = [];
    this.context = {
      method: 'GET',
      url: '/url',
      body: undefined,
      set: function(key, val){
        console.log('context.set', key, val);
      },
    };
  }
  use(fn){
    this.middleware.push(fn);
    return this;
  }
  listen(){
    const  fnMiddleware = compose(this.middleware);
    const ctx = this.context;
    const handleResponse = () => respond(ctx);
    const onerror = function(){
      console.log('onerror');
    };
    fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }
}
function respond(ctx){
  console.log('handleResponse');
  console.log('response.end', ctx.body);
}
```

重点就在`compose`这个函数，接下来我们就详细来欣赏下这个函数。

## koa-compose 源码

```js
/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

把简化的代码和`koa-compose`代码写在了一个文件中。[koa/examples/simpleKoa/koa-compose.js](https://github.com/lxchuan12/koa-analysis/blob/master/koa/examples/simpleKoa/koa-compose.js)

```bash
npm i http-server -g
```

不得不说惊艳，“玩还是作者会玩”。

这种把函数存储下来的方式，在很多源码中都有看到。比如`lodash`源码的惰性求值，`vuex`也是把`action`等函数存储下，最后才去调用。

搞懂了`koa-compose` 中间件代码，其他代码就不在话下了。

## 先看 new Koa() 结果是什么

看源码我习惯性看**它的实例对象结构**。

看示例文件路径
`koa-analysis/examples/compose/app.js`，

```js
const compose = require('koa-compose');
const Koa = require('../../koa/lib/application');
const app = module.exports = new Koa();

console.log('app-new-koa():', {koaInstance: app});
```

开始有这么几行代码，我们先不研究具体实现。先看下执行`new Koa()`之后，`app`是什么，有个初步印象。

TODO: 画图。

## 源码

## 推荐阅读

[知乎@姚大帅：可能是目前市面上比较有诚意的Koa2源码解读](https://zhuanlan.zhihu.com/p/34797505)<br>
[koa 官网](https://koajs.com/)<br>
[koa 仓库](https://github.com/koajs/koa)<br>
[koa2 中文文档](https://github.com/demopark/koa-docs-Zh-CN)<br>
[知乎@零小白：十分钟带你看完 KOA 源码](https://zhuanlan.zhihu.com/p/24559011)<br>
[微信开放社区@小丹の：可能是目前最全的koa源码解析指南](https://developers.weixin.qq.com/community/develop/article/doc/0000e4c9290bc069f3380e7645b813)<br>
[思否@RickyLong 高质量 - Koa 源码解析](https://segmentfault.com/a/1190000021109975)
[berwin: 深入浅出 Koa2 原理](https://github.com/berwin/Blog/issues/9)

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