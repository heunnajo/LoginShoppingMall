var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

app.use(cookieParser('abcdefgggggggg'));//쿠키데이터가 있으면 req/res 객체를 통해 쿠키데이터 알 수 있다.
//일단 여기서 DB대용 데이터.
var products = {
    1000:{title:'Product1'},
    2000:{title:'Product2'}
};
app.get('/products',(req,res)=>{
    var output = '';
    for(var name in products) {//객체의 프로퍼티 이름이 name에 담긴다! 1->2->..
        output += `
            <li>
                <a href="/cart/${name}">${products[name].title}</a>
            </li>`
    }
    res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">My Cart</a>`);
});
/**
 * Cart = {1000:3, 2000:1}
 * 프로퍼티 명은 id값이다. id값은 products 배열 객체에서 온다.
 */
app.get('/cart/:id',(req,res)=>{
    //cart라는 객체를 만들어서 쿠키에 'cart'라는 객체 데이터를 심을 것이다.
    var id = req.params.id;
    if(req.signedCookies.cart) {//cart라는 값이 있으면 이 값을 그대로 사용한다.
        var cart = req.signedCookies.cart;
    } else {
        var cart = {};//최초 방문시 빈 객체를 할당.
    }
    if(!cart[id]){//최초 방문시 cart[id]를 0으로 셋팅.
        cart[id] = 0;
    }
    cart[id] = parseInt(cart[id])+1;//url에서 끝의 'id'와 쿠키값을 문자->숫자로 가져온다.
    res.cookie('cart',cart, {signed:true});//이 cart에는 제품번호와 수량이 담겨있다! 수량=쿠키
    res.redirect('/cart');
    //res.send(cart);
});
app.get('/cart',(req,res)=>{
    //products페이지에서 id를 통해 title을 가져올 수 있었다.
    var cart = req.signedCookies.cart;
    if(!cart) {
        res.send('Your cart is empty!')
    } else {
        var output = '';
        for(var id in cart) {
            //제품번호와 수량을 셋팅한다!
            output += `<li>${products[id].title} (${cart[id]})</li>`;
        }
    }
    res.send(`
        <h1>Cart</h1>
        <ul>${output}</ul>
        <a href="/products">Products</a>`);
});
app.get('/count', (req,res)=>{
    //웹브라우저에 응답할 때 보내는 것. 
    
    if(req.signedCookies.count) {//암호화된 쿠키가 전달될 때 signedCookies를 통해 key값으로 해독된 쿠키값을 가져올 수 있다?
        var count = parseInt(req.signedCookies.count);
    } else {
        var count = 0;//쿠키값 0으로 초기화 셋팅.
    }
    count = count +1;
    res.cookie('count',count, {signed:true});//기존의 count값에 1 더한 값을 쿠키(=다음 쿠키)로 셋팅한다.
    res.send('count:'+count);
});

app.listen(3000, function(){
    console.log('Connected 3000 port, Start counting cookie data!');
});