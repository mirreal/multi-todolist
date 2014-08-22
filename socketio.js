exports.list = function(io, db) {
  io.on('connection', function(socket) {
    socket.on('online', function(data) {
      db.projects.findOne(data, function(err, doc) {
        if (err) return next(err);
        console.log(doc);
        if (doc) {
          var own = {
            author: doc.author,
            project: doc.name
          };
        }
        db.lists.find({own: own}).toArray(function(err, doc) {
          if (err) return next(err);
          socket.emit('online', doc);
        });
      });
    });
    socket.on('addList', function(data) {
      db.projects.findOne(data.own, function(err, doc) {
        if (err) return next(err);
        if (doc) {
          var own = {
            author: doc.author,
            project: doc.name
          };
        }
        var list = data.list;
        list.own = own;
        socket.broadcast.emit('addList', {list: list, project: doc});
        db.lists.insert(list, function(err, doc) {
          if (err) return next(err);
        });
      });
    });
    socket.on('delete', function(data) {
      socket.broadcast.emit('delete', data);
      var date = parseInt(data);
      db.lists.remove({date: date}, function(err, doc) {
        if (err) return next(err);
      });
    });
    socket.on('done', function(data) {
      socket.broadcast.emit('done', data);
      var date = parseInt(data);
      db.lists.update({date: date}, {$set: {done: true}}, function(err, doc) {
        if (err) return next(err);
      });
    });
    socket.on('color', function(data) {
      socket.broadcast.emit('color', data);
      var date = parseInt(data.key);
      db.lists.update({date: date}, {$set: {color: data.color}}, function(err, doc) {
        if (err) return next(err);
      });
    });
    socket.on('addUser', function(data) {
      db.projects.update(data.own, {$push: {owner: data.name}}, function(err, doc) {
        if (err) return next(err);
      });
    });

  });
};
