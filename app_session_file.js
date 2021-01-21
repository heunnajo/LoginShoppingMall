var express = require('express');
var session = require('express-session');//express-session은 사용자의 세션 데이터를 store옵션이 가리키고 있는 파일에 저장한다.(FileStore())
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
    //secret이란 사용자의 웹 브라우저에 sid(session id)를 심을 때 평문으로 심으면 위험하기 때문에
    //resave-false : 서버에 접속할 때마다 새로운  sid를 발급받지 않겠다.
    //세션을 실제로 사용하기 전까지는 발급하지 말아라.
    secret: 'GOFORHLS!HLS!HLS!',
    resave: false,
    saveUninitialized: true,
    store:new FileStore()//session 데이터를 저장할 'session'이라는 디렉토리를 생성한다!
  }));
//routing
app.get('/count',(req,res)=>{
    //sid와 서버에 저장된 데이터 'count'를 연결하는 방법
    //req.session.count = 1;//서버에'count'라는 값을 1로 저장한다.
    if(req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send('count :'+req.session.count);
    res.send('hi session');
});
app.get('/auth/logout',(req,res)=>{
    delete req.session.displayName;
    res.redirect('/welcome');
});
app.get('/welcome',(req,res)=>{
    if(req.session.displayName) {//displayName이 존재하면(=로그인 성공)
        res.send(`
            <h1>hello, ${req.session.displayName}</h1>
            <a href="/auth/logout">logout</a>
        `);
    } else {//로그인하지 않고 바로 direct로 welcome 페이지 접속했을 때.
        res.send(`
            <h1>Welcome</h1>
            <a href="/auth/login">logout</a>
        `);
    }
});
app.post('/auth/login',(req,res)=>{
    var user = {
        username:'egoing',
        password:'111',
        displayName:'Egoing'
    };
    var uname = req.body.username;
    var pwd = req.body.password;
    if(uname == user.username && pwd == user.password) {
        req.session.displayName = user.displayName;//로그인에 성공하면 그 세션 id의 displayName으로 user.displayName 저장한다. 세션 id에 해당하는 정보를 서버에 저장한다.
        res.redirect('/welcome');
    } else {
        res.send('Your ID or Password is wrong. Please check again.<a href="/auth/login">login</a>');
    }
});
app.get('/auth/login',(req,res)=>{
    var output = `
        <h1>Login</h1>
        <form action="/auth/login" method="post">
            <p>
                <input type="text" name="username" placeholder="username">
            </p>
            <p>
                <input type="password" name="password" placeholder="password">
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
    `;
    res.send(output);
});
app.listen(3004,function(){
    console.log('Connected 3004 port!!!');
});