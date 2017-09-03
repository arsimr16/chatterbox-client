const defaultParams = {
  limit: 300,
  order: '-createdAt'
};

class App {
  constructor() {
    this.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
    this.currentRoom;
    this.messagesByRoom = {};
    this.autoRefreshInterval;
  }

  init() {
    this.fetch();
    this.startAutoRefresh();
    $('#switch-room').on('click', this.handleSwitchRoom.bind(this));
    $('#send').on('submit', this.handleSubmit.bind(this));
    $('#new-room').on('submit', this.handleCreateRoom.bind(this));
  }

  fetch(param) {
    var data = {};
    Object.assign(data, defaultParams);
    if (param) {
      _.extend(data, param);
    }
    var server = this.server;
    var messagesByRoom = this.messagesByRoom;
    var updateRooms = this.updateRooms.bind(this);
    var renderRoomMessages = this.renderRoomMessages.bind(this);
    var roomname = this.currentRoom;
    var updateMessagesByRoom = this.updateMessagesByRoom.bind(this);
    $.ajax({
      url: server,
      type: 'GET',
      data: data,
      contentType: 'application/json',
      success: updateMessagesByRoom,
      complete: [updateRooms, renderRoomMessages],
      error: function(data) {
        console.error('chatterbox: Failed to send message', data);
      }
    });
  }

  updateMessagesByRoom(data) {
    var roomname = this.currentRoom;
    if (this.messagesByRoom[roomname]) {
      this.messagesByRoom[roomname] = data.results.concat(this.messagesByRoom[roomname]);
    } else {
      for (var message of data.results) {
        if (message.roomname !== null && message.roomname !== undefined) {
          var roomname = message.roomname;
          if (!this.messagesByRoom.hasOwnProperty(roomname)) {
            this.messagesByRoom[roomname] = [];
          }
          this.messagesByRoom[roomname].push(message);
        }
      }
    }
  }
  
  updateRooms() {
    $('#roomSelect').html('');
    for (var roomname in this.messagesByRoom) {
      this.renderRoom(roomname);
    }
    this.selectCurrentRoom();
  }

  selectCurrentRoom() {
    if (this.currentRoom) {
      $(`#roomSelect > option[value=${JSON.stringify(this.currentRoom)}]`)[0].selected = true;                                                                                               
    }
  }

  handleSwitchRoom() {
    var roomname = $('#roomSelect > option:selected').val();
    this.currentRoom = roomname;
    var lastUpdateTime = this.lastUpdateTimeByRoom(roomname);
    var whereParam = this.getWhereParam(roomname, lastUpdateTime);
    this.fetch(whereParam);
  }

  handleSubmit(event) {
    event.preventDefault();
    var usernameParam = window.location.search;
    var username = usernameParam.substring(usernameParam.indexOf('=') + 1);
    var text = $('#message').val();
    var roomname = this.currentRoom;
    var message = {
      username: username,
      text: text,
      roomname: roomname
    };
    this.send(message);
  }

  send(message) {
    $.ajax({ 
      url: this.server,
      type: 'POST',
      contentType: 'appication/json',
      data: JSON.stringify(message),
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  }

  refresh() {
    console.log('refreshing');
    var roomname = this.currentRoom;
    var lastUpdateTime = this.lastUpdateTimeByRoom(roomname);
    var whereParam = this.getWhereParam(roomname, lastUpdateTime);
    this.fetch(whereParam);
  }

  startAutoRefresh() {
    this.autoRefreshInterval = setInterval(this.refresh.bind(this), 5000);
  }

  stopAutoRefresh() {
    clearInterval(this.autoRefreshInterval);
  }
 
  lastUpdateTimeByRoom(roomname) {
    if (this.messagesByRoom[roomname]) {
      if (this.messagesByRoom[roomname].length > 0) {
        return this.messagesByRoom[roomname][0].createdAt;
      }
    }
  }
  
  getWhereParam(roomname, lastUpdateTime = '1900-00-00T00:00:00.000Z') {
    var filters = {
      roomname: roomname,
      createdAt: {                  
        $gt: {
          __type: 'Date',
          iso: lastUpdateTime
        }
      }                                          
    };

    return {
      where: JSON.stringify(filters)
    };
  }

  renderMessage(message) {
    var formattedTimestamp = moment(message.createdAt).format('YYYY-MM-DD, h:mm:ss a');
    message = $(
      `<div class="message">
        <div class="timestamp">Created At: ${formattedTimestamp}</div>
        <div class="roomname">Room: ${_.escape(message.roomname)}</div>
        <div class="username">User: ${_.escape(message.username)}</div>
        <div class="message-text">Message: ${_.escape(message.text)}</div>
      </div>`
    );
    
    $('#chats').append(message);
  }

  clearMessages() {
    $('#chats').html('');
  }

  renderRoomMessages() {
    this.clearMessages();
    if (this.currentRoom) {
      var messages = this.messagesByRoom[this.currentRoom];
      for (var i = 0; i < messages.length; i++) {
        var message = messages[i];
        this.renderMessage(message);
      }
    } 
  }

  handleCreateRoom(event) {
    event.preventDefault();
    var roomname = $('#new-roomname').val();
    this.currentRoom = roomname;
    this.messagesByRoom[roomname] = [];
    this.renderRoom(roomname);
    this.selectCurrentRoom();
  }

  renderRoom(roomname) {
    var option = $(`<option value="${_.escape(roomname)}">${_.escape(roomname)}</option>`);
    $('#roomSelect').append(option);
  }
}

var app;

$(document).ready(function() {
  app = new App();
  app.init();
});

var getUsername = function(param) {
  return param.substring(param.indexOf('=') + 1);
};
