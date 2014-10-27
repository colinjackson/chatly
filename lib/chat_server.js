var propagateMessage = function (data, nicknames, socket, io) {
  console.log("propagating data!", data);

  var nick = nicknames[socket.id];
  data.text = nick + ": " + data.text;
  io.emit('message', data);
};

var isNicknameTaken = function (nick, nicknames) {
  for (var socketId in nicknames) {
    if (nick === nicknames[socketId]) {
      return true;
    }
  }

  return false;
};

var isNicknameReserved = function (nick) {
  return nick.substring(0, 5) === 'guest';
};

var emitNicknameChangeRequestFailure = function (socket, message) {
  socket.emit('nicknameChangeResult', {
    success: false,
    message: message
  });
};

var handleNicknameChangeRequestSuccess = function (nick, nicknames, socket, io, isDefault) {
  var oldNick = nicknames[socket.id];
  nicknames[socket.id] = nick;

  var nicksArray = [];
  for (var socketId in nicknames) {
    nicksArray.push(nicknames[socketId]);
  }

  io.emit('nicknameChangeResult', {
    success: true,
    nicksArray: nicksArray
  });

  var message;
  if (!isDefault) {
    message = "['" + oldNick + " is now known as '" + nick + "'!]";
  } else {
    message = "['" + nick + "' has joined the chatroom!]";
  }
  io.emit('message', {text: message});
}

var handleChangeRequest = function (data, nicknames, socket, io, isDefault) {
  var nick = data.proposedNick;
  if (nick === nicknames[socket.id]) {
    console.log('nickname already assigned');
    emitNicknameChangeRequestFailure(socket, 'You already have that nickname!');
  } else if (isNicknameTaken(nick, nicknames)) {
    console.log('nickname taken');
    emitNicknameChangeRequestFailure(socket, 'That nickname is taken.');
  } else if (isNicknameReserved(nick) && !isDefault) {
    console.log('nickname can\'t start with guest');
    emitNicknameChangeRequestFailure(socket, 'Your nickname can\'t start with "guest".');
  } else {
    handleNicknameChangeRequestSuccess(nick, nicknames, socket, io, isDefault);
  }
};


var createChat = function (server) {
  var io = require('socket.io')(server);
  var guestNumber = 1;
  var nicknames = {};

  io.on('connection', function (socket) {
    var defaultNick = "guest" + guestNumber;
    handleChangeRequest({ proposedNick: defaultNick }, nicknames, socket, io, true);
    guestNumber += 1;

    console.log("binding socket for user " + nicknames[socket.id] );
    socket.on('message', function (data) {
      propagateMessage(data, nicknames, socket, io);
    });

    socket.on('nicknameChangeRequest', function (data) {
      handleChangeRequest(data, nicknames, socket, io);
    });

    socket.on('disconnect', function () {
      io.emit('message', { text:
          '[user "' + nicknames[socket.id] + '" disconnected!]' });
      delete nicknames[socket.id];
    });
  });
};

exports.createChat = createChat;
