$.Chat = function (socket, messagesList, usersList) {
  this.socket = socket;
  this.room = 'lobby';
  this.$messagesList = $(messagesList);
  this.$usersList = $(usersList);

  this.bindEvents();
};

$.Chat.prototype.bindEvents = function () {
  this.socket.on('message', function (data) {
    console.log('received message!', data);
    this.addMessage(data.text);
  }.bind(this));

  this.socket.on('nicknameChangeResult', function (data) {
    this.$usersList.empty();

    for (var i = 0; i < data.nicksArray.length; i++) {
      var $li = $('<li>');
      $li.text(data.nicksArray[i]);
      this.$usersList.append($li);
    }
  }.bind(this));

  this.socket.on('roomChangeResult', function (data) {
    console.log(data);
    this.room = data.newRoom;
  }.bind(this));
};

$.Chat.prototype.addMessage = function (text) {
  var $li = $('<li>');
  $li.text(text);
  this.$messagesList.prepend($li);
};

$.Chat.prototype.sendMessage = function (text) {
  this.socket.emit('message', { text: text, room: this.room });
};

$.Chat.prototype.processCommand = function (text) {
  var args = text.substring(1).split(/\s+/);
  if (args[0] === 'nick') {
    this.sendNicknameChangeRequest(args[1]);
  } else if (args[0] === 'join') {
    this.sendRoomChangeRequest(args[1]);
  } else {
    var $li = $('<li>');
    $li.text('[Invalid command!]');
    this.$messagesList.prepend($li);
  }
};

$.Chat.prototype.sendNicknameChangeRequest = function (proposedNick) {
  this.socket.emit('nicknameChangeRequest', { proposedNick: proposedNick });
};

$.Chat.prototype.sendRoomChangeRequest = function (newRoom) {
  this.socket.emit('roomChangeRequest', { newRoom: newRoom });
};
