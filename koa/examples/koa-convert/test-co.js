const app = new Koa();
app.use(convert(function *(next) {
  const start = Date.now();
  yield next;
  const ms = Date.now() - start;
  console.log(`${this.method} ${this.url} - ${ms}ms`);
}));

app.use(async (ctx, next) => {
  ctx.body = 'hello koa-convert and co';
});

app.listen(3001);
