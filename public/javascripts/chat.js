$.Chat = function (socket, el) {
  this.socket = socket;
  this.$el = $(el);

  this.bindEvents();
};

$.Chat.prototype.bindEvents = function () {
  this.socket.on('message', function (data) {
    console.log('received message!', data);
    this.addMessage(data.text);
  }.bind(this));
};

$.Chat.prototype.addMessage = function (text) {
  var $li = $('<li>');
  $li.text(text);
  this.$el.prepend($li);
};

$.Chat.prototype.sendMessage = function (text) {
  this.socket.emit('message', { text: text });
};
