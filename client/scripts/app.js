const defaultParams = {
  limit: 300,
  order: ['-createdAt']
};

class App {
  constructor() {
    this.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
    this.currentRoom;
    this.friends = {};
    this.autoRefresh;
    this.autoRefreshInterval = 3000;
  }

  init() {
    this.updateRoomList();
    this.startAutoRefresh();
    $('#main .username').click(this.handleUsernameClick.bind(this)); 
    $('#switch-room').on('click', this.handleSwitchRoom.bind(this));
    $('#send').on('submit', this.handleSubmit.bind(this));
    $('#new-room').on('submit', this.handleCreateRoom.bind(this));
  }

  send(message) {
    $.ajax({
      url: this.server,
      type: 'POST',
      data: message,
      success: function(data) {
        
      }
    });
  }

  fetch(param) {
    $.ajax({
      url: this.getURLWithParam(param),
      type: 'GET',
      datatype: 'json',
      success: function(data) {
        return data;
      }
    });
  }

  clearMessages() {
    $('#chats').html('');
  }

  renderMessage(message) {
    message = $(
      `<div class="message">
        <div class="timestamp">${message.createdAt}</div>
        <div class="username">${_.escape(message.username)}</div>
        <div class="message-text">${_.escape(message.text)}</div>
      </div>`
    );
    if (this.friends[message.username]) {
      message.addClass('friend');
    }
    $('#chats').append(message);
  }

  renderRoomMessages() {
    var whereParam = {
      roomname: this.currentRoom
    };

    $.ajax({
      url: this.getURLWithParam({where: whereParam}),
      method: 'GET',
      datatype: 'json',
      success: (data) => {
        for (var message of data.results) {
          this.renderMessage(message);
        }
      },
      complete: () => {
        $('#main .username').on('click', this.handleUsernameClick); 
      }
    });
  }

  startAutoRefresh() {
    this.autoRefresh = setInterval(() => {
      console.log('last updated: ' + new Date())
      this.clearMessages();
      this.renderRoomMessages();
    }, this.autoRefreshInterval);
  }

  renderRoom(roomname) {
    var option = $(`<option value="${roomname}">${roomname}</option>`);
    $('#roomSelect').append(option);
  }

  updateRoomList() {  
    $.ajax({
      url: this.getURLWithParam(),
      type: 'GET',
      datatype: 'json',
      success: function(data) {
        var renderedRooms = {};
        for (var message of data.results) {
          var roomname = message.roomname;
          if (roomname === undefined || roomname === null) {
            continue;
          }
          if (!renderedRooms[roomname]) {
            renderedRooms[roomname] = true;
            app.renderRoom(message.roomname);
          }
        }
      }
    });
  }

  getURLWithParam(param) {
    param = _.extend(defaultParams, param);
    var urlEncodedParams = this.encodeParams(param);
    return this.server + '?' + urlEncodedParams;
  }

  encodeParams(param) {
    var result = [];
    for (var k in param) {
      if (Array.isArray(param[k])) {
        result.push(k + '=' + param[k].join(','));
      } else {
        result.push(k + '=' + JSON.stringify(param[k]));
      }
    }
    return result.join('&');
  }

  handleCreateRoom(event) {
    event.preventDefault();
    var roomname = $('#new-roomname').val();
    this.renderRoom(roomname);
    $(`#roomSelect > option[value='${roomname}']`)[0].selected = true;
  }

  handleSwitchRoom() {
    var roomname = $('#roomSelect > option:selected').val();
    this.currentRoom = roomname;
    this.clearMessages();
    this.renderRoomMessages();
  }

  handleUsernameClick(event) {
    var username = event.target.innerHTML;
    app.friends[username] = !app.friends[username];
  }

  handleSubmit(event) {
    event.preventDefault();
    var text = $('#message').val();
    var message = {
      username: getUsername(window.location.search),
      text: text,
      roomname: this.currentRoom
    };
    this.send(message);
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
