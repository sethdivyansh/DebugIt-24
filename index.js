const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  connectionStateRecovery: {},
});

app.use(express.static(path.join(__dirname, "client")));
const rooms = {};

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
    socket.on("restart_game", () => {
      io.to(data.roomId).emit("restart_game");
    });

    // socket.on("disconnect", () => {
    //   if (rooms[data.roomId]) {
    //     rooms[data.roomId] = rooms[data.roomId].filter(
    //       (user) => user !== data.player_name
    //     );
    //     rooms[data];
    //   }
    // });
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
