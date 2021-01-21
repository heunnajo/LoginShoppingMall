var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
    secret: 'eoieiioeioiowioewioioeirwo',
    resave: false,
    saveUninitialized: true,
 }));
 app.get('/count',(req,res)=>{
     if(req.session.count) {
        req.session.count++;
     } else {
        req.session.count = 1;
     }
     
     res.send('count: '+req.session.count);
 });
app.get('/auth/logout',(req,res)=>{
    delete req.session.displayName;
    res.redirect('/welcome');
});
app.get('/welcome',(req,res)=>{//로그인했을 때와 로그인하지 않았을 때로 나눠서 처리해준다.
    if(req.session.displayName) {///로그인
        res.send(`
            <h1>Hello,${req.session.displayName}</h1>
            <a href="/auth/logout">logout</a>
        `);
    } else {//로그인 안 했을 때
        res.send(`
            <h1>Welcome</h1>
            <a href="/auth/login">Login</a>
        `);
    }
});
app.post('/auth/login',(req,res)=>{
    //로그인 접속시 이용되는 데이터.
    var user = {
        username:'egoing',
        password:'111',
        Name:'Mr.Egoing'
    };
    var uname = req.body.username;
    var pwd = req.body.password;
    if(uname === user.username && pwd === user.password) {
        req.session.displayName = user.Name;//세션 객체에 'displayName'이라는 값으로 user객체의 Name을 서버에 저장한다.
        res.redirect('/welcome');
    } else {
        res.send('Who are you? <a href="/auth/login">Login</a>');
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
app.listen(3003,function(){
    console.log('Connected 3003 port! Count Page with Session');
});