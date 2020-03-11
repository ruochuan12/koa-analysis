function createCopyright(){
  const template = `<div>
    <h1><a href="https://lxchuan12.cn" target="_blank" >若川的博客</a></h1>
    <p><a href="https://github.com/lxchuan12/koa-analysis" target="_blank">本文地址《学习 koa 源码的整体架构，可能是最好懂的koa中间件原理和co原理》</a></p>
  </div>`;
  const node = document.createElement('div');
  node.innerHTML = template;
  document.body.appendChild(node);
}
createCopyright();
