var express = require('express');
var app = express();

var p1 = require('./routes/p1')(app);//p1파일에서 모듈을 가져온다.
app.use('/p1',p1);//'/p1' 페이지로 접속해서 들어오는 것들은 'p1'이라는 라우터가 처리한다.

var p2 = require('./routes/p2')(app);
app.use('/p2',p2);

app.listen(3003,function(){
    console.log('Connected port 3000');
});