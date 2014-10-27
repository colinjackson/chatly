var NicknameManager = function (io, defaultRoom) {
  this.io = io;
  this.defaultRoom = defaultRoom;
  this.nicknames = {};
  this.guestNumber = 1;
};

NicknameManager.prototype.setInitialNickname = function (socket) {
  var defaultNick = "guest" + this.guestNumber;
  this.handleNicknameChangeRequest({
    proposedNick: defaultNick,
    room: this.defaultRoom
  }, socket, true);
  this.guestNumber += 1;
};

NicknameManager.prototype.handleNicknameChangeRequest =
    function (data, socket, isDefault) {

  var nick = data.proposedNick;
  if (nick === this.nicknames[socket.id]) {
    this.handleNicknameChangeRequestFailure(socket, 'You already have that nickname!');
  } else if (this.isNicknameTaken(nick)) {
    this.handleNicknameChangeRequestFailure(socket, 'That nickname is taken.');
  } else if (this.isNicknameReserved(nick) && !isDefault) {
    this.handleNicknameChangeRequestFailure(socket, 'Your nickname can\'t start with "guest".');
  } else {
    this.handleNicknameChangeRequestSuccess(nick, socket, data.room, isDefault);
  }
};

NicknameManager.prototype.isNicknameTaken = function (nick) {
  for (var socketId in this.nicknames) {
    if (nick === this.nicknames[socketId]) {
      return true;
    }
  }

  return false;
};

NicknameManager.prototype.isNicknameReserved = function (nick) {
  return nick.substring(0, 5) === 'guest';
};

NicknameManager.prototype.handleNicknameChangeRequestFailure =
    function (socket, message) {

  socket.emit('nicknameChangeResult', {
    success: false,
    message: message
  });
};

NicknameManager.prototype.handleNicknameChangeRequestSuccess =
    function (nick, socket, room, isDefault) {

  var oldNick = this.nicknames[socket.id];
  this.nicknames[socket.id] = nick;

  var message;
  if (!isDefault) {
    message = "['" + oldNick + " is now known as '" + nick + "'!]";
  } else {
    message = "['" + nick + "' has joined the chatroom!]";
  }
  this.io.in(room).emit('message', {text: message});
}

exports.NicknameManager = NicknameManager;
