// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signOut, signInWithPopup, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.0.1/firebase-auth.js";
import { getDatabase, ref, set, get, child, query, orderByChild, orderByValue, limitToFirst, limitToLast, onChildChanged} from "https://www.gstatic.com/firebasejs/9.0.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

//Wait for the webpage to load
document.addEventListener("DOMContentLoaded", event => {

    const whenSignedIn = document.getElementById('whenSignedIn')
    const whenSignedOut = document.getElementById('whenSignedOut')

    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn')

    const globalCount = document.getElementById('globalCount');
    const userCount = document.getElementById('userCount');

    const userDetails = document.getElementById('userDetails');

    signInBtn.onclick = () => {
        const data = { todo: 'signInWithPopup'}
        const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        };
        fetch('/api', options);
    }

    signOutBtn.onclick = () => {
        const data = { todo: 'signOut'}
        const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        };
        fetch('/api', options);
    }

    const createThing = document.getElementById('createThing');
    const thingsList = document.getElementById('thingsList');

    let thingsRef;
    let unsubscribe;
    let ranking;

    ranking = returnTop(db, 10)
    setTimeout(() => {
        for (let i = 0; i < ranking.length; i++) {
            let listItem = document.getElementById(`ranking${i}`);
            let player = ranking[i]
            listItem.innerHTML = `${i + 1}. ${player.name}: ${player.count}`
        }
    }, 1000)
    const globalCountRef = ref(db, 'globals/totalCount');
    onChildChanged(ref(db, 'users/'), () => {
        ranking = returnTop(db, 10)
        setTimeout(() => {
            for (let i = 0; i < ranking.length; i++) {
                let listItem = document.getElementById(`ranking${i}`);
                let player = ranking[i]
                listItem.innerHTML = `${i + 1}. ${player.name}: ${player.count}`
            }
        }, 10)
        get(globalCountRef).then((snapshot) => {
                if (snapshot.exists()) {
                    let count = snapshot.val();
                    globalCount.innerHTML = `Global: ${count}`;
                  }
            })

    })
    // On Login:
    onAuthStateChanged(auth, async user => {
        if (user != null) {
            // Signed in

            whenSignedIn.hidden = false;
            whenSignedOut.hidden = true;

            const userPath = 'users/' + user.uid;
            const usersRef = ref(db, userPath);
            const countRef = ref(db, userPath + '/count');
            const globalCountRef = ref(db, 'globals/totalCount');

            // Update User and Global Counts: 
            get(countRef).then((snapshot) => {
                if (snapshot.exists()) {
                    let count = snapshot.val();
                    userCount.innerHTML = `You: ${count}`;
                  }
            })
            get(globalCountRef).then((snapshot) => {
                if (snapshot.exists()) {
                    let count = snapshot.val();
                    globalCount.innerHTML = `Global: ${count}`;
                  }
            })

            get(child(dbRef, userPath)).then((snapshot) => {
                if (!snapshot.exists()) {
                    set(ref(db, userPath), {
                        uid: user.uid,
                        name: user.displayName,
                        email: user.email,
                        count: 0
                    })
                }
            })

        

            theButton.onclick = () => {
                get(countRef).then((snapshot) => {
                    if (snapshot.exists()) {
                        let count = snapshot.val();
                        count++
                        set(countRef, count)
                        userCount.innerHTML = `You: ${count}`;
                      }
                })
                get(globalCountRef).then((snapshot) => {
                    if (snapshot.exists()) {
                        let count = snapshot.val();
                        count++
                        set(globalCountRef, count)
                        globalCount.innerHTML = `Global: ${count}`;
                      }
                })
            }

            // unsubscribe = usersRef
            //     .where('uid', '==', user.uid)
            //     .onSnapshot(querySnapshot => {
            //         const items = querySnapshot.docs.map(doc => {

            //             return `<li>${doc.data().name}</li>`
            //         })

            //         thingsList.innerHTML = items.join('');
            //     })
        } else {
            // Not signed in
            whenSignedIn.hidden = true;
            whenSignedOut.hidden = false;

            unsubscribe && unsubscribe();
        }
    });

})

function returnTop(db, rankingLength) {
    const highestClickers = query(ref(db, 'users'), orderByChild('count'), limitToLast(rankingLength));
    let test = new Array()
    let rankingList = new Array();
    get(highestClickers).then((snapshot) => {
        for (let key in snapshot.val()) {
            let name = snapshot.val()[key].name.toString()
            let count = snapshot.val()[key].count
            let player = new Ranking(name, count);
            rankingList.push(player);
        }
        rankingList.sort(function (a,b) {return a.count - b.count})
        rankingList.reverse()
    });
    return rankingList
}

const data = {num1: 5, num2 : 10};
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
};
fetch('/api', options).then((response) => {
  let par = document.createElement('p')
  par.innerHTML = `urine luck`;
  document.body.appendChild(par); 
})