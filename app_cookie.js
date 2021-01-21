var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser('f;qljefoiutonsdks!@#$'));

var products = {
    1:{title:'The history of web 1'},//property이름 : '1'
    2:{title:'The history of web 2'}
};
//routing
app.get('/count',(req,res)=>{
    //서버에서 브라우저에 응답할 때 쿠키값을 '1' 셋팅해서 보낸다.
    //다음에 재방문하면 브라우저는 서버에 쿠키값 '1'을 전송한다.
    //처음에 접속할 땐 쿠키가 없기 때문에 쿠키가 있는 경우, 없는 경우 나눠서 해준다.
    if(req.signedCookies.count) {
        var count = parseInt(req.signedCookies.count);//문자를을 숫자로 바꿔준다.
    } else {
        var count = 0;
    }
    count = count+1;
    res.cookie('count',count,{signed:true});
    res.send('count : '+count);//브라우저가 전송한 쿠키에 대한 정보를 가져온다.
    //=>브라우저는 현재 쿠키값을 기억하고 있다가 서버에 방문할 때 그 쿠키를 준다.
});
app.get('/products',(req,res)=>{
    var output = '';
    for(var name in products) {//각 li항목을 클릭하면 해당 프로퍼티 값으로 가면 좋겠다.
        output += `
            <li>
                <a href="/cart/${name}">${products[name].title}</a>
            </li>`
    }
    res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">Cart</a>`);
});
/*
저장할 cart의 구조
cart = {
    제품1:2,
    제품2:1
}
*/
app.get('/cart/:id',(req,res)=>{
    var id = req.params.id;
    if(req.signedCookies.cart) {//쿠키값이 있다면
        var cart = req.signedCookies.cart;
    } else {//쿠키가 없다면(최초 실행시)
        var cart = {};
    }
    if(!cart[id]){
        cart[id] = 0;//0에서부터 시작한다?
    }
    cart[id] = parseInt(cart[id])+1;//쿠키값은 문자 형태라서 숫자로 바꿔줘야한다!. cart 객체를 id를 인덱스로 갖는 객체로 한다. cart[id]는 어디서 오나?
    res.cookie('cart',cart,{signed:true});//사용자의 쿠키에 cart라는 이름으로 cart 객체를 넘겨준다!쿠키가 cart로 셋팅된다.
    //res.send(cart);
    res.redirect('/cart');
});
app.get('/cart',(req,res)=>{
    //사용자가 전송한 쿠키값 받는다!
    var cart =req.signedCookies.cart;
    if(!cart) {
        res.send('Empty!');
    } else {
        var output = '';
        for(var id in cart) {
            output += `<li>${products[id].title} (${cart[id]})</li>`
        }
    }
    res.send(`
        <h1>Cart</h1>
        <ul>${output}</ul>
        <a href="/products">Products List</a>
    `);
});
app.listen(3000,function(){
    console.log('Connected 3000 port!!!');
});

