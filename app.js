var express = require('express');//npm으로 설치한 express를 가져온다.
var app = express();//express는 함수이고, 이 함수를 실행하면 이것은 어플리케이션을 리턴한다.
var bodyParser = require('body-parser');

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({exdtend:false}));
app.locals.pretty = true;
app.set('view engine','pug');//framework(express)와 사용할 템플릿 엔진(jade)을 연결한다.
app.set('views','./views');//2번째 인자에 템플릿이 있는 디렉토리를 넣어준다.(jade파일을 views폴더 안에 넣어주면 된다.)
app.use(express.static('public'));//정적인 파일을 로드할  때.'public'이라는 디렉토리 안에 로드하고자하는 정적인파일이 들어있음.

/*   라우터 설정(컨트롤러 연결)  */
app.get('/form',(req,res)=>{
    res.render('form');
});
app.get('/form_receiver',(req,res)=>{
    var title = req.query.title;
    var desc =  req.query.desc;
    res.send(title+','+desc);
});
app.post('/form_receiver',(req,res)=>{
    var title = req.body.title;
    var desc =  req.body.desc;
    res.send('Hello POST');
    res.send(title+','+desc);
});
app.get('/topic/:id',(req,res)=>{//express가 익명함수를 호출한다.
    var topics = [//실제로는 이 부분에 파일이나 DB가 들어간다.
        'Javascript is...',
        'Nodejs is...',
        'Express is...'
    ];
    var str = `
        <a href="/topic?id=0">JavaScript</a><br>
        <a href="/topic?id=1">Nodejs</a><br>
        <a href="/topic?id=2">Express</a><br>
        ${topics[req.params.id]}
    `;

    //topics[index] : index에 해당하는 것은 query string으로 받는 req.query.id이기 때문에
    var output = str + topics[req.query.id];
    res.send(output);
});
app.get('/topic/:id/:mode',(req,res)=>{//id가1인 페이지를 편집하는 페이지로 가고 싶다면.../topic/1/edit
    res.send(req.params.id+','+req.params.mode);
});
app.get('/')
app.get('/template',(req,res)=>{//template engine을 이용하기 때문에  res.send()=>render()
    res.render('temp',{time:Date(), _title:'PUG'});//template엔진으로 만들어진, template 파일'temp'을 읽어온다.
});
app.get('/route',(req,res)=>{//글자와 함께 이미지 파일을 로드할 때.
    res.send('Hello Router, <img src="lovely_heun.jpg">');
});
//홈으로 접속한 사용자에게 두번째 인자인 함수를 실행
app.get('/',(req,res) => {
    res.send('Hello home page!');//res의 send메서드로 응답할 수 있다!
});
app.get('/login',(req,res)=>{
    res.send('<h1>Login please</h1>');
});
app.get('/dynamic',(req,res)=>{
    var lis = '';
    for(var i=0;i<5;i++){
        lis = lis + '<li>coding</li>';
    }
    var time = Date();

    var output = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        Hello Dynamic!
        <ul>
        ${lis}
        </ul>
        ${time}
    </body>
    </html>`;
    res.send(output);
});
app.listen(3000,() => {
    console.log('Connected 3000 port!');
    //console.log(`Example app listening at http://localhost:${port}`)
});