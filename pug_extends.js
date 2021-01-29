var express = require('express');
var app = express();
app.set('view engine','pug');//view engine = template engine. express프레임워크와 템플릿 엔진을 연결.
app.set('views','views');//2번째 인자 : 템플릿 pug파일이 있는 디렉토리 이름 'views'

//라우팅
app.get('/view',(req,res)=>{
    res.render('view');//템플릿 파일을 사용하여 'view'를 렌더한다. 'vies' 디렉토리 내에 'view'라는 파일 렌더.
});
app.get('/add',(req,res)=>{
    res.render('add');
});
app.listen(3004,function(){
    console.log('Connected 3004 port');
});