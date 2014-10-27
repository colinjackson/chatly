$.ChatUI = function (el, socket) {
  this.$el = $(el);
  this.$messageForm = this.$el.find('#new-message > form');
  this.$messagesList = this.$el.find('#messages > ul');
  this.chat = new $.Chat(socket, this.$messagesList);

  this.bindEvents();
};

$.ChatUI.prototype.bindEvents = function () {
  this.$messageForm.on('submit', this.handleSubmit.bind(this));
};

$.ChatUI.prototype.handleSubmit = function (event) {
  event.preventDefault();

  var $form = $(event.currentTarget);
  var text = this.getMessage($form);
  this.chat.sendMessage(text);
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
