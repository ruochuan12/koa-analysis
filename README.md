# 学习 koa 源码的整体架构，可能是最好懂的koa中间件原理和co原理

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

感兴趣的读者可以点击阅读。<br>
其他源码计划中的有：[`express`](https://github.com/lxchuan12/express-analysis)、[`vue-rotuer`](https://github.com/lxchuan12/vue-router-analysis)、[`redux`](https://github.com/lxchuan12/redux-analysis)、  [`react-redux`](https://github.com/lxchuan12/react-redux-analysis) 等源码，不知何时能写完，欢迎持续关注我（若川）。

本文学习的`koa`版本是`v2.11.0`。克隆的官方仓库的`master`分支。
截至目前（2020年3月11日），最新一次`commit`是`2020-01-04 07:41 Olle Jonsson` `eda27608`，`build: Drop unused Travis sudo: false directive (#1416)`。

本文仓库在这里[若川的 koa-analysis github 仓库 https://github.com/lxchuan12/koa-analysis](https://github.com/lxchuan12/koa-analysis)。求个`star`呀。

**本文阅读最佳方式**：先`star`一下我的仓库，再把它`git clone https://github.com/lxchuan12/koa-analysis.git`克隆下来。不用管你是否用过`nodejs`。会一点点`promise、generator、await`等知识即可看懂。如果一点点也不会，可以边看阮一峰老师的[《ES6标准入门》](https://es6.ruanyifeng.com/#docs/generator)相关章节。**跟着文章节奏调试和示例调试，动手调试（用`vscode`或者`chrome`）印象更加深刻**。文章长段代码不用细看，可以调试时再细看。

```bash
# 克隆我的这个仓库
git clone https://github.com/lxchuan12/koa-analysis.git
# chrome 调试：
# 全局安装 http-server
npm i -g http-server
hs koa/examples/
# 可以指定端口 -p 3001
# hs -p 3001 koa/examples/
# 浏览器中打开
# 然后在浏览器中打开localhost:8080，开心的把代码调试起来
```

这里把这个`examples`文件夹做个简单介绍。<br>
`middleware`文件夹是用来`vscode`调试整体流程的。<br>
`simpleKoa` 文件夹是`koa`简化版，为了调试koa-compose中间件的。<br>
`koa-convert`，是用来调试`koa-convert`和`co`源码的。<br>
`co-generator`文件夹是模拟实现`co`的示例代码。<br>


TODO: 导读：
如果你简历上一不小心写了熟悉`koa2`，面试官大概率会问：
>1、`koa2`洋葱模型怎么实现的。<br>
>2、如果中间件中的`next()`方法报错了会怎样。<br>
>3、`co`的原理是怎样的。<br>
>等等问题<br>

## vscode 调试 koa 源码方法

之前，我在知乎回答了一个问题[一年内的前端看不懂前端框架源码怎么办？](https://www.zhihu.com/question/350289336/answer/910970733)
推荐了一些资料，阅读量还不错，大家有兴趣可以看看。主要有四点：<br>
>1.借助调试<br>
>2.搜索查阅相关高赞文章<br>
>3.把不懂的地方记录下来，查阅相关文档<br>
>4.总结<br>

看源码，调试很重要，所以我详细写下 `koa` 源码调试方法，帮助一些可能不知道如何调试的读者。

```bash
# 我已经克隆到我的koa-analysis仓库了
git clone https://github.com/koajs/koa.git
```

```json
// package.json
{
  "name": "koa",
  "version": "2.11.0",
  "description": "Koa web app framework",
  "main": "lib/application.js",
}
```

克隆源码后，看`package.json`找到`main`，就知道入口文件是`lib/application.js`了。

大概看完项目结构后发现没有`examples`文件夹（一般项目都会有这个文件夹，告知用户如何使用该项目），这时仔细看`README.md`。
如果看英文`README.md`有些吃力，会发现在`Community`标题下有一个[中文文档 v2.x](https://github.com/demopark/koa-docs-Zh-CN)。同时也有一个[`examples`仓库](https://github.com/koajs/examples)。

```bash
git clone https://github.com/koajs/examples.git
```

这时再开心的把`examples`克隆到自己电脑。可以安装好依赖，逐个研究学习下这里的例子，然后可能就一不小心掌握了`koa`的基本用法。当然，我这里不详细写这一块了。

继续看文档会发现**使用指南**讲述`编写中间件`。

### 使用文档中的中间件（koa-compose）例子来调试

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

看到这个`gif`图，我把之前写的`examples/koa-compose`的调试方法**含泪删除**了。默默写上`gif`图上的这些代码，想着这个读者们更容易读懂。
我把这段代码写在这里 [`koa/examples/middleware/app.js`](https://github.com/lxchuan12/koa-analysis/blob/master/koa/examples/middleware/app.js)便于调试。

<details>
<summary>gif图中的代码，点击这里展开/收缩，可以复制</summary>

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

在项目路径下配置新建[.vscode/launch.json](https://github.com/lxchuan12/koa-analysis/blob/master/.vscode/launch.json)文件，`program`配置为自己写的`koa/examples/middleware/app.js`文件，按`F5键`开始调试，调试时先走主流程，不要一开始就关心细枝末节。

>**断点调试要领：**<br>
**赋值语句可以一步跳过，看返回值即可，后续详细再看。**<br>
**函数执行需要断点跟着看，也可以结合注释和上下文倒推这个函数做了什么。**<br>

<details>
<summary>.vscode/launch.json 代码，点击这里展开/收缩，可以复制</summary>

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

上述比较啰嗦的写了一堆调试方法。主要是想着`授人予鱼不如授人予渔`，这样换成其他源码也会调试了。

简单说下`chrome`调试，`chrome`浏览器打开`chrome://inspect`，点击配置**configure...**配置`127.0.0.1:端口号`(端口号在Vscode 调试控制台显示了)。

更多可以查看[English Debugging Guide](https://nodejs.org/en/docs/inspector)

[中文调试指南](https://nodejs.org/zh-cn/docs/guides/debugging-getting-started/)

喜欢看视频的读者也可以看慕课网这个视频[node.js调试入门](https://www.imooc.com/learn/1093)，讲得还是比较详细的。

## 先看看 `new Koa()` 结果`app`是什么

看源码我习惯性看**它的实例对象结构**。

先看下执行`new Koa()`之后，`app`是什么，有个初步印象。

```js
// 文件 koa/examples/middleware/app.js
const Koa = require('../../lib/application');

// const Koa = require('koa');
// 这里打个断点
const app = new Koa();
// x-response-time

// 这里打个断点
app.use(async (ctx, next) => {

});
```

在控制台打印`app`。会有一张这样的图。
[koa 实例对象](../koa-analysis/images/koa-instance.jpeg)

也有一个插件查看图片形式。

TODO: 画图。

[index API](https://github.com/demopark/koa-docs-Zh-CN/blob/master/api/index.md)

### context

[context API](https://github.com/demopark/koa-docs-Zh-CN/blob/master/api/context.md)

### request

[request API](https://github.com/demopark/koa-docs-Zh-CN/blob/master/api/request.md)

### response

[response API](https://github.com/demopark/koa-docs-Zh-CN/blob/master/api/response.md)

## koa 主流程梳理简化

通过`F5启动调试（直接跳到下一个断点处）`、`F10单步跳过`、`F11单步调试`等，配合重要的地方断点，调试完整体代码，其实比较容易整理出如下主流程的代码。

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

重点就在`compose`这个函数，接下来我们就详细来**欣赏**下这个函数。

## koa-compose 源码

传入一个数组，返回一个函数。对入参是不是数组和校验数组每一项是不是函数。

```js
function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

 //  传入对象 context 返回Promise
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
hs koa/examples/
# 然后可以打开localhost:8080/simpleKoa，开心的把代码调试起来
```

不过这样好像还是有点麻烦，我还把这些代码放在[`codepen` https://codepen.io/lxchuan12/pen/wvarPEb](https://codepen.io/lxchuan12/pen/wvarPEb)中，**直接可以在线调试啦**。是不是觉得很贴心^_^，自己多调试几遍便于消化理解。

你会发现`compose`就是类似这样的结构（移除一些判断）。

```js
// 这样就可能更好理解了。
const [fn1, fn2, fn3] = this.middleware;
const fnMiddleware = function(context){
    return Promise.resolve(
      fn1(context, function next(){
        return Promise.resolve(
          fn2(context, function next(){
              return Promise.resolve(
                  fn3(context, function next(){
                    return Promise.resolve();
                  })
              )
          })
        )
    })
  );
};
fnMiddleware(ctx).then(handleResponse).catch(onerror);
```

不得不说非常惊艳，“玩还是大神会玩”。

这种把函数存储下来的方式，在很多源码中都有看到。比如`lodash`源码的惰性求值，`vuex`也是把`action`等函数存储下，最后才去调用。

搞懂了`koa-compose` 中间件代码，其他代码就不在话下了。

## 错误处理 TODO:

[中文文档 错误处理](https://github.com/demopark/koa-docs-Zh-CN/blob/master/error-handling.md)

```js
```

## koa2 和 koa1 的对比

[中文文档中描述了 koa2 和 koa1 的区别](https://github.com/demopark/koa-docs-Zh-CN/blob/master/migration.md)

`koa1`中主要是`generator`函数。`koa2`中会自动转换`generator`函数。

```js
// Koa 将转换
app.use(function *(next) {
  const start = Date.now();
  yield next;
  const ms = Date.now() - start;
  console.log(`${this.method} ${this.url} - ${ms}ms`);
});
```

### koa-convert 源码

在`vscode/launch.json`文件，找到这个`program`字段，修改为`"program": "${workspaceFolder}/koa/examples/koa-convert/app.js"`。

通过`F5启动调试（直接跳到下一个断点处）`、`F10单步跳过`、`F11单步调试`调试走一遍流程。重要地方断点调试。

`app.use`时有一层判断，是否是`generator`函数，没有则用`koa-convert`暴露的方法`convert`来转换重新赋值，再存入`middleware`，后续再使用。

```js
class Koa extends Emitter{
  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    if (isGeneratorFunction(fn)) {
      deprecate('Support for generators will be removed in v3. ' +
                'See the documentation for examples of how to convert old middleware ' +
                'https://github.com/koajs/koa/blob/master/docs/migration.md');
      fn = convert(fn);
    }
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);
    return this;
  }
}
```

`koa-convert`源码挺多，核心代码其实是这样的。

```js
function convert(){
 return function (ctx, next) {
    return co.call(ctx, mw.call(ctx, createGenerator(next)))
  }
  function * createGenerator (next) {
    return yield next()
  }
}
```

最后还是通过`co`来转换的。所以接下来看`co`的源码。

### co 源码

[co 仓库](https://github.com/tj/co)

本小节的示例代码都在这个文件夹中，可以自行打开调试查看。

TODO: 示例地址

看`co`源码前，先看几段代码。

```js
// 写一个请求简版请求
function request(ms= 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({name: '若川'});
    }, ms);
  });
}
```

```js
// 获取generator的值
function* generatorFunc(){
  const res = yield request();
  console.log(res, 'generatorFunc-res');
}
generatorFunc(); // 报告，我不会输出你想要的结果的
```

简单来说`co`，就是把`generator`自动执行，再返回一个`promise`。
`generator`函数这玩意它不自动执行呀，还要一步步调用`next()`，也就是叫它走一步才走一步。

所以有了`async、await`函数。

```js
// await 函数 自动执行
async function asyncFunc(){
    const res = await request();
    console.log(res, 'asyncFunc-res await 函数 自动执行');
}
asyncFunc(); // 输出结果
```

也就是说`co`需要做的事情，是让`generator`向`async、await`函数一样自动执行。

#### 模拟实现简版 co（第一版）

这时，我们来模拟实现第一版的`co`。根据`generator`的特性，其实容易写出如下代码。

```js
// 获取generator的值
function* generatorFunc(){
  const res = yield request();
  console.log(res, 'generatorFunc-res');
}

function coSimple(gen){
  gen = gen();
  console.log(gen, 'gen');

  const ret = gen.next();
  const promise = ret.value;
  promise.then(res => {
    gen.next(res);
  });
}
coSimple(generatorFunc);
// 输出了想要的结果
// {name: "若川"}"generatorFunc-res"
```

#### 模拟实现简版 co（第二版）

但是实际上，不会上面那么简单的。有可能是多个`yield`，和传参数的情况。
传参可以通过
`const args = Array.prototype.slice.call(arguments, 1);
    gen = gen.apply(ctx, args);`
来解决。
两个`yield`，我大不了重新调用一下，搞定。

```js
// 多个yeild，传参情况
function* generatorFunc(suffix = ''){
  const res = yield request();
  console.log(res, 'generatorFunc-res' + suffix);

  const res2 = yield request();
  console.log(res2, 'generatorFunc-res-2' + suffix);
}

function coSimple(gen){
  const ctx = this;
  const args = Array.prototype.slice.call(arguments, 1);
  gen = gen.apply(ctx, args);
  console.log(gen, 'gen');

  const ret = gen.next();
  const promise = ret.value;
  promise.then(res => {
    const ret = gen.next(res);
    const promise = ret.value;
      promise.then(res => {
        gen.next(res);
      });
  });
}

coSimple(generatorFunc, ' 哎呀，我真的是后缀');
```

#### 模拟实现简版 co（第三版）

问题是肯定不止两次，无限次的`yield`的呢，这时肯定要把重复的封装起来。而且返回是`promise`，这就实现了如下版本的代码。

```js
function* generatorFunc(suffix = ''){
  const res = yield request();
  console.log(res, 'generatorFunc-res' + suffix);

  const res2 = yield request();
  console.log(res2, 'generatorFunc-res-2' + suffix);

  const res3 = yield request();
  console.log(res3, 'generatorFunc-res-3' + suffix);

  const res4 = yield request();
  console.log(res4, 'generatorFunc-res-4' + suffix);
}

function coSimple(gen){
  const ctx = this;
  const args = Array.prototype.slice.call(arguments, 1);
  gen = gen.apply(ctx, args);
  console.log(gen, 'gen');

  return new Promise((resolve, reject) => {

    onFulfilled();

    function onFulfilled(res){
      const ret = gen.next(res);
      next(ret);
    }

    function next(ret) {
      const promise = ret.value;
      promise && promise.then(onFulfilled);
    }

  });
}

coSimple(generatorFunc, ' 哎呀，我真的是后缀');
```

但第三版的模拟实现简版`co`中，还没有考虑报错、和一些参数合法的情况。

#### 最终来看下`co`源码

```js
function co(gen) {
  var ctx = this;
  var args = slice.call(arguments, 1)

  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  // see https://github.com/tj/co/issues/180
  return new Promise(function(resolve, reject) {
    if (typeof gen === 'function') gen = gen.apply(ctx, args);
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    onFulfilled();

    /**
     * @param {Mixed} res
     * @return {Promise}
     * @api private
     */

    function onFulfilled(res) {
      var ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * @param {Error} err
     * @return {Promise}
     * @api private
     */

    function onRejected(err) {
      var ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * Get the next value in the generator,
     * return a promise.
     *
     * @param {Object} ret
     * @return {Promise}
     * @api private
     */

    function next(ret) {
      if (ret.done) return resolve(ret.value);
      var value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  });
}
```

## koa 和 express 对比

[文档 koa 和 express 对比](https://github.com/demopark/koa-docs-Zh-CN/blob/master/koa-vs-express.md)

文档里写的挺全面的。简单来说`koa2`语法更先进，更容易深度定制（`egg.js`、`think.js`、底层框架都是`koa`）。

web 框架有很多，比如`Express.js`，`Koa.js`、`Egg.js`、`Nest.js`、`Next.js`、`Fastify.js`、`Hapi.js`、`Restify.js`、`Loopback.io`、`Sails.js`、`Midway.js`等等。

## 总结

主要总结四个核心概念，中间件，http请求上下文（context）、http请求对象、响应对象。

HTTP协议、TCP/IP协议网络相关。不属于koa的知识，但需深入学习掌握。

## 还能做些什么？

文章通过`授人予鱼不如授人予鱼`的方式，告知如何调试源码，看完了`koa-compose`中间件，`koa-convert`和`co`等源码。

还能根据我文章说的调试方式调试[koa 组织](https://github.com/koajs)中的各种中间件，比如`koa-bodyparser`, `koa-router`，`koa-jwt`，`koa-session`、`koa-cors`等等。

还能把[`examples`仓库](https://github.com/koajs/examples)克隆下来，挨个调试学习下源码。

## 推荐阅读

[koa 官网](https://koajs.com/)<br>
[koa 仓库](https://github.com/koajs/koa)<br>
[koa 组织](https://github.com/koajs)<br>
[koa2 中文文档](https://github.com/demopark/koa-docs-Zh-CN)<br>
[co 仓库](https://github.com/tj/co)<br>
[知乎@姚大帅：可能是目前市面上比较有诚意的Koa2源码解读](https://zhuanlan.zhihu.com/p/34797505)<br>
[知乎@零小白：十分钟带你看完 KOA 源码](https://zhuanlan.zhihu.com/p/24559011)<br>
[微信开放社区@小丹の：可能是目前最全的koa源码解析指南](https://developers.weixin.qq.com/community/develop/article/doc/0000e4c9290bc069f3380e7645b813)<br>
[IVWEB官方账号: KOA2框架原理解析和实现](https://ivweb.io/article.html?_id=100334)<br>
[深入浅出vue.js 作者 berwin: 深入浅出 Koa2 原理](https://github.com/berwin/Blog/issues/9)<br>
[阮一峰老师：co 函数库的含义和用法](http://www.ruanyifeng.com/blog/2015/05/co.html)<br>

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