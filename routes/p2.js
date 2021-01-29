module.exports = function(app){
    var express = require('express');
    var router = express.Router();

    router.get('/r1',(req,res)=>{
        res.send('Hello /p2/r1');
    });
    router.get('/r2',(req,res)=>{
        res.send('Hello /p2/r1');
    });

    return router;
};