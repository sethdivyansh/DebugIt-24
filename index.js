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

  socket.on("join_room", (data) => {
    if (!rooms[data.roomId]) {
      rooms[data.roomId] = {};
    }
    console.log("Join room ", data.roomId);

    if (data.player_name != false) {
      if (rooms[data.roomId].players) {
        if (rooms[data.roomId].players.length == 2) {
          console.log("Max limit reached");
          return;
        }
        rooms[data.roomId].players.push(data.player_name);
      } else {
        rooms[data.roomId].players = [data.player_name];
      }
      if (!rooms[data.roomId].moves) {
        rooms[data.roomId].moves = {};
      }
      rooms[data.roomId].moves[data.player_name] = [];
    }
    socket.join(data.roomId);
    if (rooms[data.roomId].players.length < 2) {
      io.to(data.roomId).emit("player_joined", {
        players: rooms[data.roomId].players,
      });
    } else {
      io.to(data.roomId).emit("start_game");
    }
  });
});

app.get(`/game/:id`, (req, res) => {
  res.sendFile(__dirname + "/client/game.html");
});

server.listen(3000, () => {
  console.log("Running on port: 3000");
});
