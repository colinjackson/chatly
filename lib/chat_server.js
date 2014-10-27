var NicknameManager = require('./nickname_manager').NicknameManager;

var propagateMessage = function (data, nicknames, socket, io) {
  console.log("propagating data!", data);

  var nick = nicknames[socket.id];
  data.text = nick + ": " + data.text;
  io.in(data.room).emit('message', data);
};

var generateRoomOccupantsHash = function (currentRooms, nicknames) {
  var rooms = [];
  for (var socketId in currentRooms) {
    if (rooms.indexOf(currentRooms[socketId]) === -1) {
      rooms.push(currentRooms[socketId]);
    }
  }

  var roomOccupants = {};
  for (var i = 0; i < rooms.length; i++) {
    roomOccupants[rooms[i]] = [];
  }

  for (var socketId in currentRooms) {
    if (nicknames[socketId]) {
      roomOccupants[currentRooms[socketId]].push(nicknames[socketId]);
    }
  }

  return roomOccupants;
};

var joinRoom = function (room, currentRooms, nicknames, socket, io) {
  socket.join(room);
  currentRooms[socket.id] = room;

  var roomOccupants = generateRoomOccupantsHash(currentRooms, nicknames);
  io.emit('roomListUpdate', { roomOccupants: roomOccupants });
};

var handleRoomChangeRequest = function (data, currentRooms, nicknames, socket, io) {
  socket.leave(currentRooms[socket.id]);
  joinRoom(data.newRoom, currentRooms, nicknames, socket, io);
  socket.emit('roomChangeResult', {
    success: true,
    newRoom: data.newRoom
  });
};


var createChat = function (server) {
  var io = require('socket.io')(server);
  var nicknameManager = new NicknameManager(io, 'lobby');
  var currentRooms = {};

  io.on('connection', function (socket) {
    nicknameManager.setInitialNickname(socket);
    joinRoom('lobby', currentRooms, nicknameManager.nicknames, socket, io);

    socket.on('message', function (data) {
      propagateMessage(data, nicknameManager.nicknames, socket, io);
    });

    socket.on('nicknameChangeRequest', function (data) {
      nicknameManager.handleNicknameChangeRequest(data, socket);
    });

    socket.on('roomChangeRequest', function (data) {
      handleRoomChangeRequest(data, currentRooms, nicknameManager.nicknames, socket, io);
    });

    socket.on('disconnect', function () {
      var room = currentRooms[socket.id];
      io.in(room).emit('message', { text:
          '[user "' + nicknameManager.nicknames[socket.id] + '" disconnected!]' });
      delete nicknameManager.nicknames[socket.id];
    });
  });
};

exports.createChat = createChat;
