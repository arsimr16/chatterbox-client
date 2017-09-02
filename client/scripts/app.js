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
    // this.updateRooms();
    $('#switch-room').on('click', this.handleSwitchRoom.bind(this));
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
      var option = $(`<option value="${_.escape(roomname)}">${_.escape(roomname)}</option>`);
      $('#roomSelect').append(option);
    }
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

  refresh() {
    console.log('refreshing');
    var roomname = this.currentRoom;
    var lastUpdateTime = this.lastUpdateTimeByRoom(roomname);
    var whereParam = this.getWhereParam(roomname, lastUpdateTime);
    this.fetch(whereParam);
  }

  startAutoRefresh() {
    this.autoRefreshInterval = setInterval(this.refresh.bind(this), 3000);
  }

  stopAutoRefresh() {
    clearInterval(this.autoRefreshInterval);
  }
 
  lastUpdateTimeByRoom(roomname) {
    if (this.messagesByRoom[roomname]) {
      return this.messagesByRoom[roomname][0].createdAt;
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
    // var whereParam = {
    //   roomname: this.currentRoom
    // };

    // $.ajax({
    //   url: this.getURLWithParam({where: whereParam}),
    //   method: 'GET',
    //   datatype: 'json',
    //   success: (data) => {
    //     for (var message of data.results) {
    //       this.renderMessage(message);
    //     }
    //   },
    //   complete: () => {
    //     $('#main .username').on('click', this.handleUsernameClick); 
    //   }
    // });
  }
}

// class App {
//   constructor() {
//     this.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
//     this.currentRoom;
//     this.messagesByRoom = {};
//     this.friends = {};
//     // this.autoRefresh;
//     // this.autoRefreshInterval = 3000;
//   }

//   init() {
//     this.updateRoomList();
//     // this.startAutoRefresh();
//     $('#main .username').click(this.handleUsernameClick.bind(this)); 
//     $('#switch-room').on('click', this.handleSwitchRoom.bind(this));
//     $('#send').on('submit', this.handleSubmit.bind(this));
//     $('#new-room').on('submit', this.handleCreateRoom.bind(this));
//   }

//   send(message) {
//     $.ajax({
//       url: this.server,
//       type: 'POST',
//       data: message,
//       success: function(data) {
        
//       }
//     });
//   }

//   fetch(param) {
//     $.ajax({
//       url: this.getURLWithParam(param),
//       type: 'GET',
//       datatype: 'json',
//       success: function(data) {
//         return data;
//       }
//     });
//   }

//   fetchNewRoomMessages(roomname) {
//     var whereParam = {
//       where: {
//         roomname: roomname
//       }
//     };
//     if (this.messagesByRoom.hasOwnProperty(roomname)) {
//       var lastUpdateTime = this.messagesByRoom[roomname][0].createdAt;
//       whereParam['where']['createdAt'] = {
//         '$gt': {
//           '__type': 'Date',
//           'iso': lastUpdateTime
//         }
//       };
//     } else {
//       this.messagesByRoom[roomname] = [];
//     }
//     var newMessages = this.fetch(whereParam).results;
//     this.messagesByRoom[roomname] = newMessages.concat(this.messagesByRoom[roomname]);
//   }

//   clearMessages() {
//     $('#chats').html('');
//   }

//   renderMessage(message) {
//     var formattedTimestamp = moment(message.createdAt).format('YYYY-MM-DD, h:mm:ss a');
//     message = $(
//       `<div class="message">
//         <div class="timestamp">Created At: ${formattedTimestamp}</div>
//         <div class="roomname">Room: ${message.roomname}</div>
//         <div class="username">User: ${_.escape(message.username)}</div>
//         <div class="message-text">Message: ${_.escape(message.text)}</div>
//       </div>`
//     );
//     if (this.friends[message.username]) {
//       message.addClass('friend');
//     }
//     $('#chats').append(message);
//   }

//   renderRoomMessages(roomname) {
//     var messages = this.messagesByRoom[roomname];
//     for (var message of messages) {
//       this.renderMessage(message);
//     }
//     // var whereParam = {
//     //   roomname: this.currentRoom
//     // };

//     // $.ajax({
//     //   url: this.getURLWithParam({where: whereParam}),
//     //   method: 'GET',
//     //   datatype: 'json',
//     //   success: (data) => {
//     //     for (var message of data.results) {
//     //       this.renderMessage(message);
//     //     }
//     //   },
//     //   complete: () => {
//     //     $('#main .username').on('click', this.handleUsernameClick); 
//     //   }
//     // });
//   }

//   // startAutoRefresh() {
//   //   var interval = this.autoRefreshInterval;
//   //   this.autoRefresh = setInterval(() => {
//   //     $('#last-updated').text('last updated: ' + new Date());
//   //     this.clearMessages();
//   //     this.renderRoomMessages(this.currentRoom);
//   //   }, interval);
//   // }

//   renderRoom(roomname) {
//     var option = $(`<option value="${roomname}">${roomname}</option>`);
//     $('#roomSelect').append(option);
//   }

//   updateRoomList() {  
//     $.ajax({
//       url: this.getURLWithParam(),
//       type: 'GET',
//       datatype: 'json',
//       success: function(data) {
//         var renderedRooms = {};
//         for (var message of data.results) {
//           var roomname = message.roomname;
//           if (roomname === undefined || roomname === null) {
//             continue;
//           }
//           if (!renderedRooms[roomname]) {
//             renderedRooms[roomname] = true;
//             app.renderRoom(message.roomname);
//           }
//         }
//       }
//     });
//   }

//   getURLWithParam(param) {
//     param = _.extend(defaultParams, param);
//     var urlEncodedParams = this.encodeParams(param);
//     return this.server + '?' + urlEncodedParams;
//   }

//   encodeParams(param) {
//     var result = [];
//     for (var k in param) {
//       if (Array.isArray(param[k])) {
//         result.push(k + '=' + param[k].join(','));
//       } else {
//         result.push(k + '=' + JSON.stringify(param[k]));
//       }
//     }
//     return result.join('&');
//   }

//   handleCreateRoom(event) {
//     event.preventDefault();
//     var roomname = $('#new-roomname').val();
//     this.renderRoom(roomname);
//     $(`#roomSelect > option[value='${roomname}']`)[0].selected = true;
//   }

//   handleSwitchRoom() {
//     var roomname = $('#roomSelect > option:selected').val();
//     this.currentRoom = roomname;
//     this.fetchNewRoomMessages(roomname);
//     this.clearMessages();
//     this.renderRoomMessages(roomname);
//   }

//   handleUsernameClick(event) {
//     var username = event.target.innerHTML;
//     app.friends[username] = !app.friends[username];
//   }

//   handleSubmit(event) {
//     event.preventDefault();
//     var text = $('#message').val();
//     var message = {
//       username: getUsername(window.location.search),
//       text: text,
//       roomname: this.currentRoom
//     };
//     this.send(message);
//   }
// } 

var app;

$(document).ready(function() {
  app = new App();
  app.init();
});

var getUsername = function(param) {
  return param.substring(param.indexOf('=') + 1);
};
