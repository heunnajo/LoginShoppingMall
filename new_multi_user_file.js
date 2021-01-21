var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

/* 업데이트된 pbkdf2 사용법
var pbkdf2 = require('pbkdf2')
var derivedKey = pbkdf2.pbkdf2Sync('helloworld', 'salt', 1, 32, 'sha512');*/
//var md5 = require('md5');
//var sha256 = require('sha256');//미설치
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
    //secret이란 사용자의 웹 브라우저에 sid(session id)를 심을 때 평문으로 심으면 위험하기 때문에
    //resave-false : 서버에 접속할 때마다 새로운  sid를 발급받지 않겠다.
    //세션을 실제로 사용하기 전까지는 발급하지 말아라.
    secret: 'GOFORHLS!HLS!HLS!',
    resave: false,
    saveUninitialized: true,
    store:new OrientoStore({
        server:'host=localhost&port=2424&username=root&password=111111&db=o2'
    })
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
app.get('/auth/logout',(req,res)=>{//로그아웃할 때
    delete req.session.displayName;//세션데이터를 지우는 작업을 하는데, 로그인할 때와 로그아웃할 때 둘다 welcome으로 리다이렉트되는데. 이때 마치 로그인이 안된 것처럼 나올 수가 있다. 데이터 동기화가 안되서.
    res.session.save(function(){//저장이 끝났을 때 리다이렉트하는 콜백 함수를 나중에 호출한다.
        res.redirect('/welcome');
    });
    
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
            <a href="/auth/login">login</a>
        `);
    }
});
app.post('/auth/login',(req,res)=>{
    var uname = req.body.username;
    var pwd = req.body.password;
    for(var i=0;i<users.length;i++) {
        var user = users[i];
        if(uname === user.username) {
            //입력한 비밀번호와 사용자의 username의 salt를 조합하여 암호화된 비밀번호를 확인하는데
            //hasher는 즉시 실행되지만, hasher의 콜백함수는 언제 실행될지 모른다.
            //=>hasher가 실행되고 for문이 다 돌고, 마지막의 res.send("Whoe are you")가 실행됨
            //로그인과 동시에 로그인을 동작하는 함수가 다 실행되도록. return 을 사용한다.
            return hasher({password:pwd, salt:user.salt},function(err,pass,salt,hash){
                if(hash === user.password) {
                    req.session.displayName = user.displayName;
                    req.session.save(function(){
                        res.redirect('/welcome');
                    })
                } else {
                    res.send('Who are you?<a href="/auth/login">Login</a>');
                }
            });
        }
    }
    res.send('Who are you?<a href="/auth/login">Login</a>');
    // if(uname === user.username && pwd === user.password) {
    //     req.session.displayName = user.displayName;//로그인에 성공하면 그 세션 id의 displayName으로 user.displayName 저장한다. 세션 id에 해당하는 정보를 서버에 저장한다.
    //     req.session.save(function(){//save된 다음 리다이렉트한다.
    //         res.redirect('/welcome');
    //     });
    // } else {
    //     res.send('Your ID or Password is wrong. Please check again.<a href="/auth/login">login</a>');
    // }
});
//salt : 원래 비밀번호와 salt(임의 문자열) 더해서 md5한다.
var users=[
    {
        username:'egoing',
        password:'1lRo2i1SARm3EXxNimh/I5itSJsi/nu0pe4pVlmi6pML7vvYuEXVRim+RjgWv1ZkBq9rqUL6z4ybXJl8P1BN8cYS/jxoQPFvyVmkFLvT2wa/To4nmGOwxIRz99GShBDMgL/22gKrM3xZ4BshWf8EB1hNUGXHMVwuG3vyG9SOlJ0=',//pdkdf2 해시값
        salt:'GHDp6JuNrw2k8eUFBA8Zl9FJ6Y93IbL6Dp19LlSb4s/njIzp0MGu2nx6HeMl9YnDtZinwYTxVt9f1rEVnRK6Cw==',
        displayName:'Mr.Egoing'
    }
];
app.post('/auth/register',(req,res)=>{
    hasher({password:req.body.password},function(err,pass,salt,hash){
        var user = {
            username:req.body.username,
            password:hash,
            salt:salt,
            displayName:req.body.displayName
        };
        users.push(user);
        req.session.displayName = req.body.displayName;
        req.session.save(function(){
            res.redirect('/welcome');
        });
    });//이 콜백함수가 실행될 때 나머지 작업을 한다.
    
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
    console.log('Connected 3003 port!!!');
});