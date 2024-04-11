const socket = io();

const roomId = window.location.pathname.split("/").pop();
const urlParams = new URLSearchParams(window.location.search);
const create = urlParams.get("gameHost") === "true" ? true : false;
// console.log(roomId);
let name;
let number_of_rounds;
let numClients = 0;

console.log(create);

socket.emit("i am reconnected", { roomId: roomId });

socket.on("number of players", (data) => {
  numClients = data.numClients;
  console.log(numClients);
});

// function hostPage() {
//   if (create) {
//     document.querySelector(".noOfRounds").style.display = "block";
//   } else {
//     document.querySelector(".noOfRounds").style.display = "none";
//   }
// }

// hostPage();

const enterBtn = document.querySelector(".enterBtn");

enterBtn.addEventListener("click", () => {
  name = document.querySelector(".name").value;
  number_of_rounds = document.querySelector(".number_of_rounds").value;

  socket.emit("playerName", { name: name, roomId: roomId });

  if (name && number_of_rounds) {
    if (Number(number_of_rounds) <= 0 || Number(number_of_rounds) > 5) {
      console.log("number of rounds not as expected");
      alert("Number of rounds should be in the range 1-5");
    } else {
      waitingArea();
    }
  }
});

socket.on("player join", (data) => {
  console.log("Player Joined: ", data);
});

const waitingArea = () => {
  document.querySelector(".playerName").style.display = "none";
  document.querySelector(".number_of_rounds").style.display = "none";

  // document.querySelector(`#player${numClients}`).innerText = `${name}`;

  // const waitingMsg = document.createElement("p");
  // waitingMsg.classList.add("waitingMsg");
  // waitingMsg.innerText = `Waiting for opponent, please share ${currentURL} to join`;
  // document.querySelector(".waitingArea").appendChild(waitingMsg);
  // document.querySelector(".waitingArea").style.display = "block";
};
