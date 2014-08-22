var mongodb = require('mongodb');
var config = require('./config.json');
var post = config.post || 27017;
var dbServer = new mongodb.Server(config.host, post);
var db = new mongodb.Db(config.database, dbServer);

db.open(function(err, client) {
  if (err) throw err;
  console.log('connet to mongodb.');
  db.users = new mongodb.Collection(client, 'users');
  db.lists = new mongodb.Collection(client, 'lists');
  db.projects = new mongodb.Collection(client, 'projects');
});

module.exports = db;
