import "./style.css";

import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAgk53Y3_zhKH0UWZdC7Kan9mMHgvviXhw",
  authDomain: "realtime-e7330.firebaseapp.com",
  databaseURL: "https://realtime-e7330-default-rtdb.firebaseio.com",
  projectId: "realtime-e7330",
  storageBucket: "realtime-e7330.appspot.com",
  messagingSenderId: "932852023522",
  appId: "1:932852023522:web:6c2d22cfdf27849aa59ebb",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db);

const currentTeamSelector = document.querySelector("#currentTeamSelector");
const ballerSeletor = document.querySelector("#ballerSelect");
const swapTeam = document.querySelector("#swapTeam");
const strikerSelector = document.querySelector("#striker");
const nonStrikerSelector = document.querySelector("#nonStriker");
const battingTeam = document.querySelector("#battingTeam");
const ballingTeam = document.querySelector("#ballingTeam");
const swapStriker = document.querySelector("#swapStriker");
const runButtons = document.querySelectorAll(".run-button");
const runInput = document.querySelector("#runInput");
const outButtons = document.querySelectorAll(".out-button");
const runs = document.querySelector("#runs");
const wideButton = document.querySelector("#wideButton");
const overs = document.querySelector("#overs");
const ball = document.querySelector("#ball");
const wickets = document.querySelector("#wickets");
const reset = document.querySelector("#reset");
let currentBallIndex = 0;

const gameData = [];
const teams = {
  green: [],
  red: [],
  blue: [],
};

get(child(dbRef, "players")).then((data) => {
  Object.entries(data.val()).forEach(([key, value]) => {
    const player = {};
    player[key] = value;
    teams[value.team].push({ ...value, id: key });
  });
});

get(child(dbRef, "cricket")).then((data) => {
  Object.entries(data.val()).forEach(([key, value]) => {
    const option = document.createElement("option");
    option.value = key;
    let game = key.replaceAll("_", " ").split(" ");
    game = game.reduce(
      (a, c, index) =>
        index === 0 ? a : `${a} ${c[0].toUpperCase() + c.slice(1, c.length)}`,
      game[0][0].toUpperCase() + game[0].slice(1, game[0].length)
    );
    option.innerHTML = game;
    gameData[key] = value;
    currentTeamSelector.appendChild(option);
  });

  updateCurrentBatters();
  updateOvers();
  updateWickets();
  onCurrentTeamChange();
  updateBallers(gameData[currentTeamSelector.value].balling_team);
});

currentTeamSelector.addEventListener("change", onCurrentTeamChange);
swapTeam.addEventListener("click", onSwapTeam);
swapStriker.addEventListener("click", onSwapStriker);
ball.addEventListener("click", onBallClicked);
runButtons.forEach((button) =>
  button.addEventListener("click", onRunButtonClicked)
);
outButtons.forEach((button) =>
  button.addEventListener("click", onOutButtonClicked)
);
wideButton.addEventListener("click", () => {
  get(child(dbRef, `cricket/${currentTeamSelector.value}`)).then((data) => {
    const d = data.val();
    const battingTeam = d.batting_team;
    const key = `${battingTeam}_runs`;
    const run = d[key] + 1;
    const updatedRun = {};
    updatedRun[key] = run;
    update(ref(db, `cricket/${currentTeamSelector.value}`), updatedRun);
    updateRuns(run);
  });
  showFlashMessage("Wide ball");
});
strikerSelector.addEventListener("change", (e) => {
  update(ref(db, `cricket/${currentTeamSelector.value}`), {
    striker: e.currentTarget.value,
  });
});
nonStrikerSelector.addEventListener("change", (e) => {
  update(ref(db, `cricket/${currentTeamSelector.value}`), {
    "non-striker": e.currentTarget.value,
  });
});
ballerSeletor.addEventListener("change", (e) => {
  update(ref(db, `cricket/${currentTeamSelector.value}`), {
    baller: e.currentTarget.value,
  });
});

const operators = ["+", "-"];
runInput.addEventListener("change", (e) => {
  const value = e.currentTarget.value;
  const toInc = value.split("");

  get(child(dbRef, `cricket/${currentTeamSelector.value}`)).then((data) => {
    const d = data.val();
    const battingTeam = d.batting_team;
    const key = `${battingTeam}_runs`;
    const updatedRun = {};
    let run = value.replace("+", "").replace("-", "");
    if (operators.includes(toInc[0])) {
      run = eval(`${d[key]}${value}`);
    }
    updatedRun[key] = run;
    update(ref(db, `cricket/${currentTeamSelector.value}`), updatedRun);
    updateRuns(run);
  });
  e.currentTarget.value = 0;
});

function updateCurrentBatters(s, ns) {
  const currentGame = gameData[currentTeamSelector.value];
  strikerSelector.value = s || currentGame.striker;
  nonStrikerSelector.value = ns || currentGame["non-striker"];
}

function updateOvers() {
  overs.innerHTML = gameData[currentTeamSelector.value].overs;
}

function changeStrikerRun(run) {
  const striker = strikerSelector.value;
  get(child(dbRef, `players/${striker}`)).then((data) => {
    const d = data.val();
    const runs = parseInt(d.runs ?? 0) + parseInt(run);
    update(child(dbRef, `players/${striker}`), {
      runs,
    });
  });
}

function updateWickets() {
  const data = gameData[currentTeamSelector.value];
  const currentWicket = data[`${data.batting_team}_wickets`];
  wickets.innerHTML = currentWicket;
}
function onSwapStriker() {
  get(child(dbRef, `cricket/${currentTeamSelector.value}`)).then((data) => {
    const d = data.val();
    update(ref(db, `cricket/${currentTeamSelector.value}`), {
      striker: d["non-striker"],
      "non-striker": d.striker,
    });
    updateCurrentBatters(d["non-striker"], d.striker);
  });
}

function onSwapTeam() {
  get(child(dbRef, `cricket/${currentTeamSelector.value}`)).then((data) => {
    const d = data.val();
    update(ref(db, `cricket/${currentTeamSelector.value}`), {
      balling_team: d.batting_team,
      batting_team: d.balling_team,
      striker: teams[d.balling_team][0].id,
      "non-striker": teams[d.balling_team][1].id,
      baller: teams[d.batting_team][0].id,
    });
    updateBallers(d.batting_team);
    updateBallingTeam(d.batting_team);
    updateBattingTeam(d.balling_team);
    updateStrikers(d.balling_team);
    updateRuns(d[`${d.balling_team}_runs`]);
    updateOvers();
    updateWickets();
  });
}

function onBallClicked() {
  const value = parseFloat(parseFloat(overs.innerHTML) + 0.1).toFixed(1);
  update(ref(db, `cricket/${currentTeamSelector.value}`), {
    overs: value,
  });
  overs.innerHTML = value;
  currentBallIndex++;
}

const updateBallingTeam = (team) =>
  (ballingTeam.innerHTML = `Balling: ${team}`);
const updateBattingTeam = (team) =>
  (battingTeam.innerHTML = `Batting: ${team}`);
const updateRuns = (run) => (runs.innerHTML = `Runs: ${run}`);

function onCurrentTeamChange(e) {
  const data = gameData[currentTeamSelector.value];
  const currentlyBatting = data.batting_team;
  updateBallingTeam(data.balling_team);
  updateBattingTeam(currentlyBatting);
  updateBallers(data.balling_team);
  updateStrikers(data.batting_team);
  updateRuns(data[`${currentlyBatting}_runs`]);
  currentBallIndex = parseInt((data.overs % 1).toString().split("")[2]) || 0;
  console.log(currentBallIndex);
  update(ref(db, `cricket_update`), {
    current_game: currentTeamSelector.value,
  });
}

function updateBallers(balling_team) {
  ballerSeletor.innerHTML = "";
  teams[balling_team].forEach((player) => {
    const option = document.createElement("option");
    option.value = player.id;
    option.innerHTML = player.name;
    ballerSeletor.appendChild(option);
  });
  get(child(dbRef, `cricket/${currentTeamSelector.value}/baller`)).then(
    (data) => {
      ballerSeletor.value = data.val();
    }
  );
}

function updateStrikers(batting_team) {
  strikerSelector.innerHTML = "";
  nonStrikerSelector.innerHTML = "";
  teams[batting_team].forEach((player) => {
    const option = document.createElement("option");
    option.value = player.id;
    option.innerHTML = player.name;
    strikerSelector.appendChild(option.cloneNode(true));
    nonStrikerSelector.appendChild(option);
  });
  get(child(dbRef, `cricket/${currentTeamSelector.value}`)).then((data) => {
    const d = data.val();
    strikerSelector.value = d.striker;
    nonStrikerSelector.value = d["non-striker"];
  });
}

function onRunButtonClicked(e) {
  const toInc = e.currentTarget.getAttribute("data-value");
  get(child(dbRef, `cricket/${currentTeamSelector.value}`)).then((data) => {
    const d = data.val();
    const battingTeam = d.batting_team;
    const key = `${battingTeam}_runs`;
    const run = d[key] + parseInt(toInc);
    const updatedRun = {};
    updatedRun[key] = run;
    update(ref(db, `cricket/${currentTeamSelector.value}`), updatedRun);
    updateRuns(run);
    changeStrikerRun(toInc);
    onBallClicked();
    const ball = {};
    ball[currentBallIndex] = parseInt(toInc);
    update(ref(db, `cricket/${currentTeamSelector.value}/balls/`), ball);
    if (currentBallIndex > 5) {
      currentBallIndex = 0;
      update(ref(db, `cricket/${currentTeamSelector.value}/balls`), {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      });
      currentBallIndex++;
    } else currentBallIndex += 1;
  });
  if (toInc == 4 || toInc == 6) showFlashMessage(toInc);
}

function onOutButtonClicked(e) {
  get(child(dbRef, `cricket/${currentTeamSelector.value}`)).then((data) => {
    const d = data.val();
    const battingTeam = d.batting_team;
    const key = `${battingTeam}_wickets`;
    const wicket = d[key] + 1;
    const updatedWicket = {};
    updatedWicket[key] = wicket;
    update(ref(db, `cricket/${currentTeamSelector.value}`), updatedWicket);
    wickets.innerHTML = wicket;
  });
  showFlashMessage("Out!");
}

function showFlashMessage(message) {
  update(ref(db, "cricket_update"), {
    update: message,
  });
}

reset.addEventListener("dblclick", () => {
  get(child(dbRef, `cricket/${currentTeamSelector.value}`)).then((data) => {
    const d = data.val();
    const battingTeam = d.batting_team;
    const ballingTeam = d.balling_team;
    const resetData = {
      overs: 0,
      balls: Array.from(Array(6)).map(() => 0),
    };
    resetData[`${battingTeam}_runs`] = 0;
    resetData[`${battingTeam}_wickets`] = 0;
    resetData[`${ballingTeam}_runs`] = 0;
    resetData[`${ballingTeam}_wickets`] = 0;
    update(ref(db, `cricket/${currentTeamSelector.value}`), resetData);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  });
});
