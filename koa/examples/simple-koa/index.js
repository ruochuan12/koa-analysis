// koa-compose
function compose (middleware) {
  // 移除了校验middleware 是数组和数组每一项都是函数的校验
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
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }
}
function respond(ctx){
  console.log('handleResponse');
  console.log('response.end', ctx.body);
}

