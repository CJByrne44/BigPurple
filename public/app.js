// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signOut, signInWithPopup, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.0.1/firebase-auth.js";
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
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

// TODO: CHANGE TO 73.119.71.88:5000
const socket = io("73.119.71.88:5000")
socket.on("connect", () => {
    console.log(`You connected with id: ${socket.id}`)
})


//Wait for the webpage to load
document.addEventListener("DOMContentLoaded", event => {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const provider = new GoogleAuthProvider();

    const whenSignedIn = document.getElementById('whenSignedIn')
    const whenSignedOut = document.getElementById('whenSignedOut')

    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn')

    const globalCount = document.getElementById('globalCount');
    const userCount = document.getElementById('userCount');

    const userDetails = document.getElementById('userDetails');

    const leaderboard = document.getElementById('leaderboard')

    signInBtn.onclick = () => signInWithPopup(auth, provider)
                            .then((result) => {
                                const credential = GoogleAuthProvider.credentialFromResult(result);
                                const token = credential.accessToken;
                                const user = result.user;
                            }).catch((error) => {
                                const errorCode = error.code;
                                const errorMessage = error.message;
                                const email = error.email;
                                const credential = GoogleAuthProvider.credentialFromError(error);
                            });

    signOutBtn.onclick = () => signOut(auth).then(() => {
                                // Sign-out successful.
                            }).catch((error) => {
                                // An error happened.
                            });

    let unsubscribe;
    

    // On Login:
    onAuthStateChanged(auth, async user => {
        if (user != null) {
            // Signed in

            whenSignedIn.hidden = false;
            whenSignedOut.hidden = true;

            socket.on('rankingUpdate', (ranking) => {
                while (leaderboard.lastElementChild) {
                    leaderboard.removeChild(leaderboard.lastElementChild);
                }
                for (let i = 0; i < ranking.length; i++) {
                    let player = ranking[i];

                    let leaderboardSpot = document.createElement('li')
                    leaderboardSpot.setAttribute("class", "rankingItem")

                    if (i == 0) {leaderboardSpot.setAttribute("id", "ranking0")}
                    if (player.name == user.displayName) {leaderboardSpot.setAttribute("id", "playerRanking")}

                    leaderboardSpot.innerText = `${i + 1}. ${player.name}: ${player.count}`
                    leaderboard.appendChild(leaderboardSpot)
                }
            })

            socket.emit('signedIn', user.uid);
            socket.on('returnCounts', (pCount, gCount, ranking) => {
                userCount.innerHTML = `You: ${pCount}`;
                globalCount.innerHTML = `Global: ${gCount}`;
                while (leaderboard.lastElementChild) {
                    leaderboard.removeChild(leaderboard.lastElementChild);
                }
                for (let i = 0; i < ranking.length; i++) {
                    let player = ranking[i]

                    let leaderboardSpot = document.createElement('li')
                    leaderboardSpot.setAttribute("class", "rankingItem")

                    if (i == 0) {leaderboardSpot.setAttribute("id", "ranking0")}
                    if (player.name == user.displayName) {leaderboardSpot.setAttribute("id", "playerRanking")}
                    leaderboardSpot.innerText = `${i + 1}. ${player.name}: ${player.count}`
                    
                    leaderboard.appendChild(leaderboardSpot)
                }
            })

            socket.emit('verifyUser', user);

            socket.on('globalUpdate', (gCount) => {
                globalCount.innerHTML = `Global: ${gCount}`;
            })
            socket.on('countUpdate', (pCount) => {
                userCount.innerHTML = `You: ${pCount}`;
            })

            theButton.onclick = () => {socket.emit('buttonClick', user.uid);}

        } else {
            // Not signed in
            whenSignedIn.hidden = true;
            whenSignedOut.hidden = false;

            unsubscribe && unsubscribe();
        }
    });

})