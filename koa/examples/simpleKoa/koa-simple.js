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

    /**
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
    */

    const ctx = this.context;
    const handleResponse = () => respond(ctx);
    const onerror = function(err){
      console.log('onerror:', err);
    };
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }
}
function respond(ctx){
  console.log('handleResponse');
  console.log('response.end', ctx.body);
}

