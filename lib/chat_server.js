const sockerio = require("socket.io");
let io;
let guestNumber = 1;
let nickNames = {};
let namesUsed = [];
let currentRoom = {};

export const listen = function (server) {
  io = sockerio.listen(server);
  io.set("log level", 1);
  io.socket.on("connection", function (scoket) {
    guestNumber = assginGuestName(socket, guestNumber, nickNames, namesUsed);
  });
  joinRoom(socket, "Lobby");
  handleMessageBroadcasting(socket, nickNames);
  handleNameChangeAttempts(socket, nickNames, namesUsed);
  handleRoomJoining(socket);

  socket.on("rooms", function () {
    socket.emit("rooms", io.sockets.manager.rooms);
  });

  handleClientDisconnection(socket, nickNames, namesUsed);
};

// 分配用户昵称
function assginGuestName(socket, guestNumber, nickNames, namesUsed) {
  let name = "Guest" + guestNumber;
  nickNames[socket.id] = name;
  socket.emit("nameResult", {
    success: true,
    name: name,
  });
  namesUsed.push(name);
  return guestNumber + 1;
}

// 房间更换请求
function joinRoom(socket, room) {
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit("joinResult", { room: room });
  socket.broadcast.to(room).emit("message", {
    text: nickNames[socket.id] + " has joined " + room + ".",
  });

  let usersInRoom = io.sockets.clients(room);

  if (usersInRoom.length > 1) {
    let usersInRoomSummary = "Users currently in " + room + ": ";
    for (let index in usersInRoom) {
      let userSocketId = usersInRoom[index].id;
      if (userSocketId != socket.id) {
        if (index > 0) {
          usersInRoomSummary += ", ";
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += ".";
    socket.emit("message", { text: usersInRoomSummary });
  }
}

// 昵称更换请求
function handleNameChangeAttemplts(socket, nickNames, namesUsed) {
  socket.on("nameAttempt", function (name) {
    if (name.indexOf("Guest") == 0) {
      socket.emit("nameResult", {
        success: false,
        message: 'Names cannot begin with "Guest".',
      });
    } else {
      if (namesUsed.indexOf(name) == -1) {
        let previousName = nickNames[socket.id];
        let previousNameIndex = nameUsed.indexOf(previousName);
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previousNameIndex];
        socket.emit("nameResult", {
          success: true,
          name: name,
        });
        socket.broadcast.to(currentRoom[socket.id]).emit("message", {
          text: previousName + " is now known as " + name + ".",
        });
      } else {
        socket.emit("nameResult", {
          success: false,
          message: "That name as already in use",
        });
      }
    }
  });
}

// 发送聊天消息
function handleMessageBroadcasting(socket) {
  socket.on("message", function (message) {
    socket.broadcast.to(message.room).emit("message", {
      text: nickNames[socket.id] + ": " + message.text,
    });
  });
}

// 房间创建
function handleRoomJoining(socket) {
  socket.on("join", function (room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}
// 用户断开链接
function handleClientDisconnection(socket) {
  socket.on("disconnection", function () {
    let nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}
