import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCX7hc6IofjuJWUT2M11GkYRnD-XRfwmjA",
  authDomain: "bubblelog-2933c.firebaseapp.com",
  projectId: "bubblelog-2933c",
  storageBucket: "bubblelog-2933c.appspot.com",
  messagingSenderId: "81946623882",
  appId: "1:81946623882:web:4951374508e62697771273"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const statusDiv = document.getElementById('status');
const googleSigninBtn = document.getElementById('google-signin');

googleSigninBtn.addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .catch(error => {
      statusDiv.textContent = 'Sign-in error: ' + error.message;
    });
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    statusDiv.textContent = 'Signed in as: ' + user.email;

    try {
      await addDoc(collection(db, `users/${user.uid}/testCollection`), {
        test: 'write test',
        timestamp: new Date()
      });
      statusDiv.textContent += '\\nTest document successfully written!';
    } catch (e) {
      statusDiv.textContent += '\\nWrite error: ' + e.message;
    }
  } else {
    statusDiv.textContent = 'Not signed in';
  }
});
