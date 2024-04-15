const socket = io();

const roomId = window.location.pathname.split("/").pop();
const you_are = document.querySelector(".you_are");
const enter_btn = document.querySelector(".enterBtn");
const tic_tac_btns = document.querySelectorAll(".btn");
const gameover_pop = document.querySelector(".game_over");
const gameover_msg = document.querySelector(".winner");
const back_to_home = document.querySelectorAll(".back_to_home");
const squares = document.querySelector(".squares");
const copy_code_btn = document.querySelector(".room_code");
const copy_link_btn = document.querySelector(".copy_link_btn");
const restart_btn = document.querySelector(".restart_button");
let player_name;
let move_counter = 0;

const currentUrl = window.location.href;

// Create a URL object
const url = new URL(currentUrl);

// Extract the base URL
const baseUrl = `${url.protocol}//${url.host}/`;

console.log(baseUrl); // Output: http://localhost/

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

back_to_home.forEach((btn) =>
  btn.addEventListener("click", () => {
    window.location.href = baseUrl;
  })
);

enter_btn.addEventListener("click", () => {
  player_name = document.querySelector(".name").value.trim();
  if (player_name != false) {
    document.querySelector("#playerName").style.display = "none";
    socket.emit("join_room", { player_name: player_name, roomId: roomId });
    copy_code_btn.innerText = roomId;
    document.querySelector(".room_link").placeholder = window.location.href;
  }
});

copy_code_btn.addEventListener("click", () => {
  navigator.clipboard.writeText(roomId);
});
copy_link_btn.addEventListener("click", () => {
  navigator.clipboard.writeText(window.location.href);
});

tic_tac_btns.forEach((button) => {
  button.addEventListener("click", () => {
    const turn = document.querySelector(".whose_turn").textContent;
    if (turn != you_are.innerText) {
      console.log("Its not your turn");
      return;
    }
    const btn_no = button.value;
    socket.emit("playing", {
      disabled_btn: button.id,
      turn: turn,
      roomId: roomId,
      btn_no: btn_no,
      player_name: player_name,
    });
  });
});

restart_btn.addEventListener("click", () => {
  socket.emit("restart_game");
});

// Sockets

socket.on("player_joined", (data) => {
  fetch("/players_in_room")
    .then((res) => res.json())
    .then((data) => {
      const players = data.room_data[roomId];
      document.querySelector(".waitingArea").style.display = "block";
      document.querySelector("#user_name").innerText = player_name;

      if (players.players.length == 2) {
        // document.querySelector(".player_name").style.color = "gold";
        document.querySelector("#gameRoom").style.display = "block";
        document.querySelector(".waitingArea").style.display = "none";

        if (player_name == players.players[0]) {
          document.querySelector("#opp_name").innerText = players.players[1];
        } else {
          document.querySelector("#opp_name").innerText = players.players[0];
        }
        // document.querySelector(".waitingMsg").style.display = "none";
      }
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
});

socket.on("start_game", (data) => {
  document.querySelector(".whose_turn").innerText = "X";
  if (player_name === data.rooms[roomId].players[0]) {
    you_are.innerText = "X";
  } else {
    you_are.innerText = "O";
  }
});

socket.on("playing", (data) => {
  document.querySelector(`#${data.disabled_btn}`).disabled = true;
  document.querySelector(`#${data.disabled_btn}`).innerText = data.turn;
  let check = check_win_loose();
  if (check) {
    game_over(data.player_name);
  } else {
    is_game_draw();
  }
  document.querySelector(".whose_turn").innerText = data.next_turn;
});

socket.on("restart_game", () => {
  gameover_pop.style.display = "none";
  tic_tac_btns.forEach((btn) => {
    btn.disabled = false;
    btn.innerText = "";
  });
});

const check_win_loose = () => {
  for (let pattern of winPatterns) {
    const pos1val = tic_tac_btns[pattern[0]].innerText;
    const pos2val = tic_tac_btns[pattern[1]].innerText;
    const pos3val = tic_tac_btns[pattern[2]].innerText;

    if (pos1val != "" && pos2val != "" && pos3val != "") {
      if (pos1val == pos2val && pos2val == pos3val) {
        tic_tac_btns.forEach((btn) => {
          btn.disabled = true;
        });
        return true;
      }
    }
  }
  return false;
};

const is_game_draw = () => {
  let allButtonsDisabled = true;
  tic_tac_btns.forEach((button) => {
    if (!button.disabled) {
      allButtonsDisabled = false;
    }
  });
  if (allButtonsDisabled) {
    console.log("Game draw");
    gameover_pop.style.display = "flex";
    gameover_msg.innerText = "Draw";
    return true;
  } else {
    console.log("Not Draw");
    return false;
  }
};

const game_over = (pos1val) => {
  gameover_pop.style.display = "flex";
  gameover_msg.innerText = pos1val + " wins";
};

socket.on("room_full", () => {
  const room_full = document.querySelector("#room_full");
  room_full.style.display = "flex";
  setTimeout(function redirect_to_home_page() {
    window.location.href = baseUrl;
  }, 10000);
});
