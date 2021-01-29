function _sum(a,b) {
    return a+b;
}
module.exports = function sum(a,b){
    return _sum(a,b);//sum.js를 호출하는 쪽은 sum 함수만 알고 _sum은 알지 못한다. (인터페이스!)
}