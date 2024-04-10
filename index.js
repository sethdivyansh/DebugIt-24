const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.join(__dirname, "client")));

const rooms = {};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/home.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("a user disconnected");
  });

  socket.on("createRoom", () => {
    const roomId = GenerateCode(6);
    rooms[roomId] = {};
    socket.join(roomId);
    socket.emit("roomId", { roomId: roomId });
    console.log(roomId);
    redirectToGameRoom(roomId);
  });

  socket.on("joinRoom", (data) => {
    if (rooms[data.roomUniqueId != null]) {
      console.log("Joined room");
      socket.join(data.roomUniqueId);
    }
  });
});

redirectToGameRoom = (id) => {
  app.get(`/${id}`, (req, res) => {
    res.sendFile(__dirname + "/client/game.html");
  });
};

server.listen(3000, () => {
  console.log("Running on port: 3000");
});

function GenerateCode(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
