var createChat = function (server) {
  var io = require('socket.io')(server);

  io.on('connection', function (socket) {
    console.log("binding socket");
    socket.on('message', function (data) {
      console.log("propagating data!", data);
      io.emit('message', data);
    });
  });
};

exports.createChat = createChat;
