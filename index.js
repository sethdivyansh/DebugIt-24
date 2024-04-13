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

const winPatterns = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8],
];

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

    if (rooms[data.roomId].players) {
      // other player join the room
      if (rooms[data.roomId].players.length == 2) {
        // third player join
        socket.emit("room_full");
        return;
      }
      rooms[data.roomId].players.push(data.player_name);
    } else {
      rooms[data.roomId].players = [data.player_name]; //host join the room
    }
    if (!rooms[data.roomId].moves) {
      rooms[data.roomId].moves = {};
    }
    rooms[data.roomId].moves[data.player_name] = []; // create moves array for the joined player

    socket.join(data.roomId);
    if (rooms[data.roomId].players.length <= 2) {
      io.to(data.roomId).emit("player_joined", {
        players: rooms[data.roomId].players,
      });
    }
    if (rooms[data.roomId].players.length == 2) {
      rooms[data.roomId].playerMoveValue = {
        X: rooms[data.roomId].players[0],
        Y: rooms[data.roomId].players[1],
      };
      io.to(data.roomId).emit("start_game", { rooms: rooms });
    }
    socket.on("playing", (data) => {
      rooms[data.roomId].moves[data.player_name].push(data.btn_no);
      let next_turn = "";
      if (data.turn == "X") {
        next_turn = "O";
      } else {
        next_turn = "X";
      }
      io.to(data.roomId).emit("playing", {
        player_name: data.player_name,
        turn: data.turn,
        rooms,
        next_turn,
        disabled_btn: data.disabled_btn,
      });
    });
  });
});

// APIs

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/home.html");
});

app.get(`/game/:id`, (req, res) => {
  res.sendFile(__dirname + "/client/game.html");
});

app.get("/room_exists", (req, res) => {
  res.json({ rooms: rooms });
});

app.get("/players_in_room", (req, res) => {
  res.json({ room_data: rooms });
  console.log("Server: Player join ");
});

server.listen(3000, () => {
  console.log("Running on port: 3000");
});
