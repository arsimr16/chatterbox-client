const defaultParams = {
  limit: 300,
  order: ['-createdAt']
};

class App {
  constructor() {
    this.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
    this.messagesByRoom;
  }

  init() {
    $('#main .username').on('click', this.handleUsernameClick); 
    $('#send').on('submit', this.handleSubmit.bind(this));
    this.updateRoomList();
    $('#switch-room').on('click', () => {
      var roomname = $('#roomSelect > option:selected').val();
      this.clearMessages();
      this.renderRoomMessages(roomname);
    });
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
      url: this.server + 'where=' + JSON.stringify(param),
      type: 'GET',
      datatype: 'json',
      success: function(data) {

        this.messagesByRoom = {};
        for (var message of data.results) {
          var room = message.roomname;
          if (room !== undefined && room !== null) {
            if (!this.messagesByRoom.hasOwnProperty(room)) {
              this.messagesByRoom[room] = []; 
            }
            this.messagesByRoom[room].push(message);
          }
        }
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
    $('#chats').append(message);
  }

  renderRoomMessages(roomname) {
    var whereParam = {
      roomname: roomname
    };

    $.ajax({
      url: this.getURLWithParam({where: whereParam}),
      method: 'GET',
      datatype: 'json',
      success: (data) => {
        for (var message of data.results) {
          this.renderMessage(message);
        }
      }
    });
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

  handleUsernameClick() {
  }

  handleSubmit() {
    console.log('test');
    var text = $('#message').val();
    var message = {
      text: text,
    };
    this.send(message);
  }
} 

var app;

$(document).ready(function() {
  app = new App();
  app.init();
});
