const socket = io();

const roomId = window.location.pathname.split("/").pop();

console.log("roomId: ", roomId);

let player_name;

const enter_btn = document.querySelector(".enterBtn");

enter_btn.addEventListener("click", () => {
  player_name = document.querySelector(".name").value;

  document.querySelector("#playerName").style.display = "none";
  socket.emit("join_room", { player_name: player_name, roomId: roomId });
});

socket.on("player_joined", (data) => {
  console.log("Player Joined: ", data);
  const players = data.players;
  if (players.includes(player_name)) {
    console.log(`Player ${player_name} joined`);
  }
  document.querySelector(".waitingArea").style.display = "block";
  document.querySelector("#player1").innerText = players[0];
});

socket.on("start_game", () => {
  // to do start game
});
