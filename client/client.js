const socket = io();

const roomId = window.location.pathname.split("/").pop();

let player_name;
const you_are = document.querySelector(".you_are");
const enter_btn = document.querySelector(".enterBtn");

let tic_tac_btns = document.querySelectorAll(".btn");

enter_btn.addEventListener("click", () => {
  player_name = document.querySelector(".name").value.trim();
  if (player_name != false) {
    document.querySelector("#playerName").style.display = "none";
    socket.emit("join_room", { player_name: player_name, roomId: roomId });
  }
});

tic_tac_btns.forEach((button) => {
  button.addEventListener("click", () => {
    const turn = document.querySelector(".whose_turn").textContent;
    if (turn != you_are.innerText) {
      console.log("Its not your turn");
      return;
    }
    const btn_no = button.value;
    // button.disabled = true;
    button.innerText = turn;
    button.disabled = true;
    socket.emit("playing", {
      disabled_btn: button.id,
      turn: turn,
      roomId: roomId,
      btn_no: btn_no,
      player_name: player_name,
    });
  });
});

socket.on("playing", (data) => {
  document.querySelector(`#${data.disabled_btn}`).disabled = true;
  document.querySelector(`#${data.disabled_btn}`).innerText = data.turn;
  document.querySelector(".whose_turn").innerText = data.next_turn;
});

socket.on("player_joined", (data) => {
  console.log("Player Joined: ", data);
  const players = data.players;
  if (players.includes(player_name)) {
    console.log(`Player ${player_name} joined`);
  }

  socket.on("start_game", (data) => {
    document.querySelector(".whose_turn").innerText = "X";
    if (player_name === data.rooms[roomId].players[0]) {
      you_are.innerText = "X";
    } else {
      you_are.innerText = "O";
    }
  });

  fetch("/players_in_room")
    .then((res) => res.json())
    .then((data) => {
      const players = data.room_data[roomId];
      document.querySelector(".waitingArea").style.display = "block";
      document.querySelector("#user_name").innerText = player_name;

      if (players.players.length == 2) {
        document.querySelector("#gameRoom").style.display = "block";
        if (player_name == players.players[0])
          document.querySelector("#opp_name").innerText = players.players[1];
        else {
          document.querySelector("#opp_name").innerText = players.players[0];

          // tic_tac_btns.forEach((b) => {
          //   b.disabled = true;
          // });
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
