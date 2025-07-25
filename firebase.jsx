// firebase.js
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  update,
  remove,
  onValue,
  child,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBbF_9TnUNCNzUgI7A8DZ7FroQqSvKAsCY",
  authDomain: "myquizfff.firebaseapp.com",
  databaseURL:
    "https://myquizfff-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "myquizfff",
  storageBucket: "myquizfff.appspot.com",
  messagingSenderId: "5269377915",
  appId: "1:5269377915:web:e78a6377a761ead07163de",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export {
  database,
  ref,
  push,
  set,
  get,
  update,
  remove,
  onValue,
  child,
};
