const socket = io();

const roomId = window.location.pathname.split("/").pop();

console.log("roomId: ", roomId);

let player_name;

const enter_btn = document.querySelector(".enterBtn");

enter_btn.addEventListener("click", () => {
  player_name = document.querySelector(".name").value.trim();
  if (player_name != false) {
    document.querySelector("#playerName").style.display = "none";
    socket.emit("join_room", { player_name: player_name, roomId: roomId });
  }
});

document.querySelectorAll(".btn").forEach((button) => {
  button.addEventListener("click", () => {
    const turn = document.querySelector(".whose_turn").textContent;
    const btn_no = button.value;
    // button.disabled = true;

    // if (turn == "X") {
    //   turn.innerText = "O";
    // } else {
    //   turn.innerText = "X";
    // }

    socket.emit("playing", {
      roomId: roomId,
      btn_no: btn_no,
      player_name: player_name,
    });
  });
});

socket.on("player_joined", (data) => {
  console.log("Player Joined: ", data);
  const players = data.players;
  if (players.includes(player_name)) {
    console.log(`Player ${player_name} joined`);
  }

  socket.on("start_game", (data) => {
    document.querySelector(".whose_turn").innerText = "X";
    console.log("start game: ", data.rooms[roomId].players[0]);
    if (player_name === data.rooms[roomId].players[0]) {
      document.querySelector(".you_are").innerText = "X";
    } else {
      document.querySelector(".you_are").innerText = "O";
    }
  });

  fetch("/players_in_room")
    .then((res) => res.json())
    .then((data) => {
      const players = data.room_data[roomId];
      console.log(players);
      document.querySelector(".waitingArea").style.display = "block";
      document.querySelector("#user_name").innerText = player_name;

      if (players.players.length == 2) {
        document.querySelector("#gameRoom").style.display = "block";
        if (player_name == players.players[0])
          document.querySelector("#opp_name").innerText = players.players[1];
        else {
          document.querySelector("#opp_name").innerText = players.players[0];
        }
        document.querySelector(".waitingMsg").style.display = "none";
        console.log("Time to start the game");
      }
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
});

socket.on("start_game", () => {
  // to do start game
});
