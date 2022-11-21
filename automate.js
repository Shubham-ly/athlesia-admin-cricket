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

const cricketSchedules = [
  {
    id: "THU, 1ST DEC Red vs Green",
    team_a: "red",
    team_b: "green",
  },
  {
    id: "THU, 15TH DEC Green vs Blue",
    team_a: "green",
    team_b: "blue",
  },
  {
    id: "THU, 29TH DEC Blue vs Red",
    team_a: "blue",
    team_b: "red",
  },
];

cricketSchedules.forEach((match) => {
  update(ref(db, `cricket/${match.id}`), {
    team_a: match.team_a,
    team_b: match.team_b,
    overs: {
      0: [],
    },
    team_a_runs: 0,
    team_b_runs: 0,
    team_a_wickets: 0,
    team_b_wickets: 0,
  });
});

// function createCricketEvent() {}
