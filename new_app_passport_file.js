var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var hasher = bkfd2Password();

var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
    secret: 'GOFORHLS!HLS!HLS!',
    resave: false,
    saveUninitialized: true,
    store:new FileStore()
  }));
app.use(passport.initialize());//passport 등록.
app.use(passport.session());//로그인관련이기때문에 세션 이용.세션에 관한 이코드는 반드시 app.use(session)뒤에 와야한다.세션을 사용하는 것이기 때문에 세션 설정 뒤에 와야한다.
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
});
app.get('/auth/logout',(req,res)=>{//로그아웃할 때
    req.logout();//세션의 데이터를  제거.
    res.session.save(function(){//저장이 끝났을 때 리다이렉트하는 콜백 함수를 나중에 호출한다.
        res.redirect('/welcome');
    });
});
app.get('/welcome',(req,res)=>{
    if(req.user && req.user.displayName) {//객체가 생성되었는지, displayName이 존재하면(=로그인 성공)
        res.send(`
            <h1>hello, ${req.user.displayName}</h1>
            <a href="/auth/logout">logout</a>
        `);
    } else {//로그인하지 않고 바로 direct로 welcome 페이지 접속했을 때.
        res.send(`
            <h1>Welcome</h1>
            <ul>
                <li><a href="/auth/login">login</a></li>
                <li><a href="/auth/register">Register</a></li>
            </ul>
        `);
    }
});
//세션을 이용.
passport.serializeUser(function(user, done) {//done의 인자로 user를 전달.
    console.log('serializeUser',user);
    done(null, user.username);//세션에 사용자를 구분하는 user의 username 정보가 저장된다!(세션에 등록)
});
passport.deserializeUser(function(id, done) {//serializeUser의 user.username이 id로 들어온다.
    console.log('deserializeUser',id);
    for(var i=0;i<users.length;i++) {
        var user = users[i];
        if(user.username === id) {
            return done(null,user);
        }
    }
});
//Local Strategy
passport.use(new LocalStrategy(//'LocalStretegy'객체를 생성하여 우리가 이전 코드에서 콜백함수로 작성했던 부분을 여기서 수행하는 듯.
    function(username, password, done) {//사용자가 입력한 ID(username)과 password가 매개변수로 전달된다.
        var uname = username;
        var pwd = password;
        for(var i=0;i<users.length;i++) {
            var user = users[i];
            if(uname === user.username) {
                return hasher({password:pwd, salt:user.salt},
                function(err,pass,salt,hash){
                if(hash === user.password) {
                    console.log('LocalStrategy',user);
                    done(null,user);//serializeUser의 콜백함수 실행된다.
                } else {
                    done(null,false);//로그인 절차가 끝났지만 로그인에 실패했다는 뜻.
                }
                });
            }
        }
        //user들을 찾는 for문이 끝났는데도 못찾으면 아래를 실행.
        done(null,false);
    }
));
//로그인하는 라우트 설정!:passport가 로그인하는 콜백함수를 대신한다.
app.post('/auth/login', 
        passport.authenticate(//미들웨어라고 한다. 콜백함수를 리턴한다.
            'local',//'local'이라는 strategy가 실행되면 위의 passport.use의 콜백함수가 실행된다!
        { successRedirect: '/welcome', 
        failureRedirect: '/auth/login', 
        failureFlash: false}));
// app.post('/auth/login',(req,res)=>{
//     var uname = req.body.username;
//     var pwd = req.body.password;
//     for(var i=0;i<users.length;i++) {
//         var user = users[i];
//         if(uname === user.username) {
//             //입력한 비밀번호와 사용자의 username의 salt를 조합하여 암호화된 비밀번호를 확인하는데
//             //hasher는 즉시 실행되지만, hasher의 콜백함수는 언제 실행될지 모른다.
//             //=>hasher가 실행되고 for문이 다 돌고, 마지막의 res.send("Whoe are you")가 실행됨
//             //로그인과 동시에 로그인을 동작하는 함수가 다 실행되도록. return 을 사용한다.
//             return hasher({password:pwd, salt:user.salt},function(err,pass,salt,hash){
//                 if(hash === user.password) {
//                     req.session.displayName = user.displayName;
//                     req.session.save(function(){
//                         res.redirect('/welcome');
//                     })
//                 } else {
//                     res.send('Who are you?<a href="/auth/login">Login</a>');
//                 }
//             });
//         }
//     }
//      user들을 찾는 for문이 끝났는데도 못찾으면 Who are you?
//     res.send('Who are you?<a href="/auth/login">Login</a>');
// });
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
        req.login(user, function(err) {
            req.session.save(function(){
                res.redirect('/welcome');
            });
        });
    });//이 콜백함수가 실행될 때 나머지 작업을 한다.
});
app.get('/auth/register',(req,res)=>{
    var output = `
        <h1>Register</h1>
        <form action="/auth/register" method="post">
            <p>
                <input type="text" name="username" placeholder="username">
            </p>
            <p>
                <input type="password" name="password" placeholder="password">
            </p>
            <p>
                <input type="text" name="displayName" placeholder="displayName">
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
    `;
    res.send(output);
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