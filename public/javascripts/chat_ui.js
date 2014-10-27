$.ChatUI = function (el, socket) {
  this.$el = $(el);
  this.$messageForm = this.$el.find('#new-message > form');
  this.$messagesList = this.$el.find('#messages > ul');
  this.$usersList = this.$el.find('#users > ul');
  this.chat = new $.Chat(socket, this.$messagesList, this.$usersList);

  this.bindEvents();
};

$.ChatUI.prototype.bindEvents = function () {
  this.$messageForm.on('submit', this.handleSubmit.bind(this));
  this.$messageForm.on('keypress', this.handleKeypress.bind(this));
};

$.ChatUI.prototype.handleSubmit = function (event) {
  event.preventDefault();

  var $form = $(event.currentTarget);
  var text = this.getMessage($form);

  if (text[0] === '/') {
    this.chat.processCommand(text);
  } else {
    this.chat.sendMessage(text);
  }
};

$.ChatUI.prototype.handleKeypress = function (event) {
  if (event.which === 13) {
    this.handleSubmit(event)
  }
};

$.ChatUI.prototype.getMessage = function ($form) {
  var $textarea = $form.find('textarea');
  var text = $textarea.val();
  $textarea.val('');
  return text;
};

$(function () {
  var el = document.getElementById('chat-ui');
  var socket = io();

  var chatUI = new $.ChatUI(el, socket);
});
