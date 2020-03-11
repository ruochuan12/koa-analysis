const app = new Koa();

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// 普通函数
// app.use((ctx, next) => {
//   // const start = Date.now();
//   return next().then(() => {
//     console.log('common-ctx', ctx);
//     throw {error: 2};
//   });
// });

// logger

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

// response

app.use(async (ctx, next) => {
  ctx.body = 'Hello World';
  // await next();
});

app.listen(3000);
