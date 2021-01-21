var fs = require('fs');

//Sync
console.log('Sync');
var data = fs.readFileSync('data.txt',{encoding:'utf8'});
console.log(data);

//Async
console.log('Async');
fs.readFile('data.txt',{encoding:'utf8'},function(err,data){
    console.log(1);
    console.log(data);
});
console.log(2);