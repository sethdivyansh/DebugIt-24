const socket = io();

const roomId = window.location.pathname.split("/").pop();

console.log("roomId: ", roomId);

let name;
let number_of_rounds;
let numClients = 0;

const enterBtn = document.querySelector(".enterBtn");

enterBtn.addEventListener("click", () => {
  name = document.querySelector(".name").value;

  socket.emit("join_room", { name: name, roomId: roomId });
});

socket.on("player_joined", (data) => {
  console.log("Player Joined: ", data);
});
