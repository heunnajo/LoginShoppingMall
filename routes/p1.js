module.exports = function(app){//함수를 만든다. 매개변수로 전달되는 app을 받아서 처리한다.
    var express = require('express');
    var router = express.Router();
    router.get('/r1',(req,res)=>{
        res.send('Hello /p1/r1');
    });
    router.get('/r2',(req,res)=>{
        res.send('Hello /p1/r1');
    });
    app.get('/p3/r1',(req,res)=>{
        res.send('Hello /p3/r1');
    });
    return router;
};