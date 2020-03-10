const Koa = require('../../lib/application');
const app = new Koa();
app.use(function *(next) {
  const start = Date.now();
  yield next;
  const ms = Date.now() - start;
  console.log(`${this.method} ${this.url} - ${ms}ms`);
});

app.listen(3001);
