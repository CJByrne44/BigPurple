import express from 'express'
import { createServer} from 'http';
import { Server } from 'socket.io';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, query, orderByChild, orderByValue, limitToFirst, limitToLast, onChildChanged} from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCO8uwG1Foy3F8Wgbkp1bKK1y_XopS7IUU",
    authDomain: "button-c9fe1.firebaseapp.com",
    databaseURL: "https://button-c9fe1-default-rtdb.firebaseio.com",
    projectId: "button-c9fe1",
    storageBucket: "button-c9fe1.appspot.com",
    messagingSenderId: "1066996962300",
    appId: "1:1066996962300:web:fa6f056598a2fd5c8f5879",
    measurementId: "G-323PNTC426"
  };

  class Ranking {
    constructor(name, count) {
        this.name = name;
        this.count = count;
    }
}

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const globalCountRef = ref(db, 'globals/totalCount');
const dbRef = ref(getDatabase())

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: { origin: '*'}
})

const app = express()
app.listen(4000, () => console.log('listening at 4000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb'}));

io.on('connection', async (socket) => {
    console.log(socket.id)
    socket.on('buttonClick', async (uid) => {
        let count = await incrementCount(uid);
        let globalCount = await incrementGlobalCount(uid);
        io.emit('globalUpdate', globalCount);
        socket.emit('countUpdate', count);
    })
    socket.on('signedIn', async (uid) => {
        let personalCount = await returnCount(uid);
        let globalCount = await returnGlobalCount();
        let ranking = await returnTop(db, 10)
        socket.emit('returnCounts', personalCount, globalCount, ranking);
    })
    socket.on('verifyUser', async (user) => {
        await verifyUser(user);
    })
})
onChildChanged(ref(db, 'users/'), async () => {
    let ranking = await returnTop(db, 10)
    io.emit('rankingUpdate', ranking);
})

httpServer.listen(5000)

async function returnCount(uid) {
    const userPath = 'users/' + uid;
    const countRef = ref(db, userPath + '/count');

    let snapshot = await get(countRef)
    if (snapshot.exists()) {
        let count = snapshot.val();
        if (count == null) {count = 0}
        return count
        }
}

async function returnGlobalCount() {
    const globalCountRef = ref(db, 'globals/totalCount');

    let snapshot = await get(globalCountRef)
    if (snapshot.exists()) {
        let count = snapshot.val();
        if (count == null) {count = 0}
        return count
        }
}

async function verifyUser(user) {
    const userPath = 'users/' + user.uid;
    let snapshot = await get(child(dbRef, userPath))
        if (!snapshot.exists()) {
            set(ref(db, userPath), {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                count: 0
            })
            return true;
        }
        return true;
}

async function incrementCount(uid) {
    const userPath = 'users/' + uid;
    const countRef = ref(db, userPath + '/count');
    let snapshot = await get(countRef)
    if (snapshot.exists()) {
        let count = snapshot.val();
        count--
        set(countRef, count)
        return count
    }
}

async function incrementGlobalCount(uid) {
    const globalCountRef = ref(db, 'globals/totalCount');
    let snapshot = await get(globalCountRef)
    if (snapshot.exists()) {
        let count = snapshot.val();
        count--
        set(globalCountRef, count)
        return count;
    }
}

async function returnTop(db, rankingLength) {
    const highestClickers = query(ref(db, 'users'), orderByChild('count'), limitToLast(rankingLength));
    let test = new Array()
    let rankingList = new Array();
    let snapshot = await get(highestClickers)
    for (let key in snapshot.val()) {
        let name = snapshot.val()[key].name.toString()
        let count = snapshot.val()[key].count
        let player = new Ranking(name, count);
        rankingList.push(player);
    }
    rankingList.sort(function (a,b) {return a.count - b.count})
    rankingList.reverse()
    return rankingList
}