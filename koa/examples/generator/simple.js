function sleep(ms) {
  return function(done){
    setTimeout(done, ms);
  }
}

function *work(vlaue) {
  yield sleep(1000);
  console.log(1);
  // return vlaue;
}

function* generator() {
  yield work;
}

const gen = work();

// console.log(gen.next().value);
// // expected output: 10

// console.log(gen.next().value);
// expected output: 20

// function *run(){
//   var a = yield work;
//   var b = yield work;
//   console.log('a, b:', a, b);
// }


co(generator)
.then(res => {
  console.log(res);
})
