var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();

var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
    //secret이란 사용자의 웹 브라우저에 sid(session id)를 심을 때 평문으로 심으면 위험하기 때문에
    //resave-false : 서버에 접속할 때마다 새로운  sid를 발급받지 않겠다.
    //세션을 실제로 사용하기 전까지는 발급하지 말아라.
    secret: 'GOFORHLS!HLS!HLS!',
    resave: false,
    saveUninitialized: true,
    store:new FileStore()
  }));
app.use(passport.initialize());
app.use(passport.session());//세션에 관한 이코드는 반드시 app.use(session)뒤에 와야한다.세션을 사용하는 것이기 때문에 세션 설정 뒤에 와야한다.
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
    req.logout();
    req.session.save(function(){//저장이 끝났을 때 리다이렉트하는 콜백 함수를 나중에 호출한다.
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
    done(null, user.authId);//(세션 식별자로 user의 authId!)세션에 user의 username 정보가 저장된다!
});
  
passport.deserializeUser(function(id, done) {//serializeUser의 user.username이 id로 들어온다.
    console.log('deserializeUser',id);
    for(var i=0;i<users.length;i++) {
        var user = users[i];
        if(user.authId === id) {
            return done(null,user);
        }
    }
    done('There is no user.');
});
passport.use(new LocalStrategy(//'LocalStretegy'객체를 생성하여 우리가 이전 코드에서 콜백함수로 작성했던 부분을 여기서 수행하는 듯.
    function(username, password, done) {//MongoDB의 API를 쓰고 있는 듯.
        var uname = username;
        var pwd = password;
        for(var i=0;i<users.length;i++) {
            var user = users[i];
            if(uname === user.username) {
                return hasher({password:pwd, salt:user.salt},function(err,pass,salt,hash){
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
//facebook-strategy passport 등록.
passport.use(new FacebookStrategy({
    clientID: '783930845805363',
    clientSecret: 'bdcbfef6bdcbbd1042ff726301eebbd4',
    callbackURL: "/auth/facebook/callback",
    profileFields:['id','email','gender','link','locale','name','timezone','updated_time','verified','displayName']
  },
  function(accessToken, refreshToken, profile, done) {//profile정보를 이용해서 사용자를 찾아본다.
    console.log(profile);
    var authId = 'facebook:'+profile.id;
    for(var i=0;i<users.length;i++){
        var user = users[i];
        if(user.authId === authId){//fb으로 로그인하면 authId가 있음.이미 존재하는 사용자라면.
            return done(null,user);//이미 존재하면 사용자 객체를 리턴. 아래 사용자 새로 생성하는 것은 실행X.
        }//done(null,user)에 의해 serializeUser가 실행된다.
    }
    var newuser = {
        'authId':authId,
        'displayName':profile.displayName,
        'email':profile.emails[0].value
    };
    users.push(newuser);
    done(null,newuser);
  }
));
//local-passport routing!
app.post('/auth/login', 
        passport.authenticate(
            'local',//'local'이라는 strategy가 실행되면 위의 passport.use의 콜백함수가 실행된다!
        { successRedirect: '/welcome', 
        failureRedirect: '/auth/login', 
        failureFlash: false}));
//fb-passport routing!:) 라우트가 두번 진행된다.
app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));
// app.get('/auth/facebook/callback',
//         passport.authenticate(
//             'facebook', 
//         { successRedirect: '/welcome',
//         failureRedirect: '/auth/login' }));
app.get('/auth/facebook/callback',
        passport.authenticate(
            'facebook', 
        { failureRedirect: '/auth/login' }),
        (req, res) => {//세션에 저장을 먼저한 다음 웰컴페이지로 리다이렉트한다!
            req.session.save(() => {
                res.redirect('/welcome');
            })
});
var users=[
    {
        authId:'local:egoing',
        username:'egoing',
        password:'1lRo2i1SARm3EXxNimh/I5itSJsi/nu0pe4pVlmi6pML7vvYuEXVRim+RjgWv1ZkBq9rqUL6z4ybXJl8P1BN8cYS/jxoQPFvyVmkFLvT2wa/To4nmGOwxIRz99GShBDMgL/22gKrM3xZ4BshWf8EB1hNUGXHMVwuG3vyG9SOlJ0=',//pdkdf2 해시값
        salt:'GHDp6JuNrw2k8eUFBA8Zl9FJ6Y93IbL6Dp19LlSb4s/njIzp0MGu2nx6HeMl9YnDtZinwYTxVt9f1rEVnRK6Cw==',
        displayName:'Mr.Egoing'
    }
];
app.post('/auth/register',(req,res)=>{
    hasher({password:req.body.password},function(err,pass,salt,hash){
        var user = {
            authId:'local:'+req.body.username,
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
        <a href="/auth/facebook">facebook</a>
    `;
    res.send(output);
});
app.listen(3003,function(){
    console.log('Connected 3003 port! Facebook Authentication Starts!');
});