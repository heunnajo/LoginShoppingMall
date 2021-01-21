//웹어플리케이션에 들어가는 데이터를 JavaScript와 OrientDB를 사용하여 저장한다.
//OrientDB 서버에 데이터가 있다. 클라이언트는 DB 서버에 데이터를  요청하는 관계이다.
//Nodejs로 만드는 웹어플리케이션은 웹브라우저에 대해서는 서버이고, DB서버에 데이터를 요청하는 클라이언트이다.

const OrientDBClient = require("orientjs").OrientDBClient;

OrientDBClient.connect({
  host: "localhost",
  port: 2424
}).then(client => {
  return client.close();
}).then(()=> {
   console.log("Client closed");
});

//check existence of a database
OrientDBClient.existsDatabase({
    name: "HNworld",
    username: "root",
    password: "forever0$"
}).then(result => {
    console.log(result);
}).catch(err => {
    console.log("Error checking for database");
});
//List Databases
OrientDBClient.listDatabases({
    username: "root",
    password: "forever0$"
})
.then(results => {
    console.log(results);
})
.catch(err => {
    console.log("Error listing databases");
});

//INSERT directly
client.createDatabase({
    name: "test",
    username: "root",
    password: "root"
})
.then(() => {
    console.log("Database created");
})
.catch(err => {
    console.log("Error creating database");
});

//INSERT by using sql
var sql = "INSERT INTO topic (title,description) VALUES(:title,:desc)";
var param = {
    params:{
        title:'Express',
        desc:'Express is framework for web'

    }
}
OrientDBClient.query(sql,param).then(function(results){
    console.log(results);
});
