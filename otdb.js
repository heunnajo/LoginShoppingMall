// var config = require('../test/test-server.json'),
//   OrientDB = require('../lib'),
//   client = new OrientDB.OrientDBClient(config);


// client.connect().then(function () {
//   return client.open({name: "demodb", username: "admin", password: "admin"});
// }).then(function (db) {
//   db.class.list()
//     .then(function (results) {
//       return db.class.create('TestClass');
//     })
//     .then(function (results) {
//       console.log('Created Class:', results.name);
//       return db.class.drop('TestClass');
//     })
//     .then(function (results) {
//       console.log('Deleted Class');
//       process.exit();
//     })
//     .done();
// });
const OrientDBClient = require("orientjs").OrientDBClient;

OrientDBClient.connect({
  host: "localhost",
  port: 2424
}).then(client => {
  return client.close();
}).then(()=> {
   console.log("Client closed");
});

OrientDBClient.session({ name: "HNworld", username: "root", password: "forever0$" })
.then(session => {
	// use the session
	
	// close the session
	return session.close();
});

session.query("select from topic")
.on("data", data => {
	console.log(data);
})
.on('error',(err)=> {
  console.log(err);
})
.on("end", () => {
	console.log("End of the stream");
});