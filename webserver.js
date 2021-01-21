const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

/*
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});*/

var server = http.createServer(function(req,res){
  //어떤 정보를 요청한 사용자에게 응답할 것인가.
  //2번째  매개변수에 의해 결정된다.
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello Heunna Jo<3');//Hello World를  응답하겠다.
});
server.listen(port,hostname,function(){
  console.log(`Server running at http://${hostname}:${port}/`);
});