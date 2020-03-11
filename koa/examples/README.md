# 本文阅读最佳方式

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
`simpleKoa` 文件夹是`koa`简化版，为了调试`koa-compose`中间件的。<br>
`koa-convert`，是用来调试`koa-convert`和`co`源码的。<br>
`co-generator`文件夹是模拟实现`co`的示例代码。<br>
