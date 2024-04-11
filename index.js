const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

const mongoose = require("mongoose");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(
    "mongodb+srv://divyanshseth08:7f4fvYahGyb0MegW@cluster0.vepo2dn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  );

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const gameSchema = new mongoose.Schema({
  roomId: String,
  player1Name: String,
  player2Name: String,
});

const Game = mongoose.model("Game", gameSchema);

const io = new Server(server, {
  connectionStateRecovery: {},
});

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

  socket.on("createRoom", (data) => {
    const roomId = GenerateCode(6);
    rooms[roomId] = {};
    // socket.join(roomId);
    socket.emit("roomId", { roomId: roomId });
    console.log(roomId);
    redirectToGameRoom(roomId);

    // const silence = new Kitten({ name: "Silence" });
    // console.log(silence.name); // 'Silence'
  });

  socket.on("i am reconnected", (data) => {
    console.log("user reconnected");
    socket.join(data.roomId);
    console.log("user joined the room");
    const clients = io.sockets.adapter.rooms.get(`${data.roomId}`);

    //to get the number of clients in this room
    const numClients = clients ? clients.size : 0;

    console.log(`Number of clients in ${data.roomId}: ${numClients}`);
    socket
      .to(data.roomId)
      .emit("number of players", { numClients: numClients });
  });

  socket.on("joinRoom", (data) => {
    if (rooms[data.roomUniqueId] != null) {
      socket.emit("roomId", { roomId: data.roomUniqueId });
      redirectToGameRoom(data.roomUniqueId);
    } else {
      console.log("Wrong code");
    }
  });

  socket.on("playerName", (data) => {
    if (data.name != false) {
      if (rooms[data.roomId].players) {
        rooms[data.roomId].players.push(data.name);
      } else {
        rooms[data.roomId].players = [data.name];
      }
    }
    socket.to(data.roomId).emit("player join", { player: rooms[data.roomId] });
  });
});

redirectToGameRoom = (id) => {
  app.get(`/game/${id}`, (req, res) => {
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
