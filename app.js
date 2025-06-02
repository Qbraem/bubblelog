
// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCX7hc6IofjuJWUT2M11GkYRnD-XRfwmjA",
  authDomain: "bubblelog-2933c.firebaseapp.com",
  projectId: "bubblelog-2933c",
  storageBucket: "bubblelog-2933c.appspot.com",
  messagingSenderId: "81946623882",
  appId: "1:81946623882:web:4951374508e62697771273",
  measurementId: "G-2ZKKPC8T6M"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
const authContainer = document.getElementById("auth-container");
const dashboard = document.getElementById("dashboard");
const authForm = document.getElementById("auth-form");
const toggleLink = document.getElementById("toggle-link");
const logoutButton = document.getElementById("logout-button");
const googleButton = document.getElementById("google-signin");

let isRegister = false;

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = authForm.email.value;
  const password = authForm.password.value;
  if (isRegister) {
    await createUserWithEmailAndPassword(auth, email, password);
  } else {
    await signInWithEmailAndPassword(auth, email, password);
  }
});

toggleLink.addEventListener("click", () => {
  isRegister = !isRegister;
  toggleLink.innerText = isRegister ? "Already have an account? Login" : "Don't have an account? Register";
});

googleButton.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
});

logoutButton.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, user => {
  if (user) {
    authContainer.style.display = "none";
    dashboard.classList.remove("hidden");
    loadChart(user.uid);
  } else {
    authContainer.style.display = "block";
    dashboard.classList.add("hidden");
  }
});

// Form handling
const dataForm = document.getElementById("data-form");
dataForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const uid = auth.currentUser.uid;
  const ph = parseFloat(document.getElementById("ph").value);
  const gh = parseFloat(document.getElementById("gh").value);
  const kh = parseFloat(document.getElementById("kh").value);
  const chlorine = parseFloat(document.getElementById("chlorine").value);
  const nitrite = parseFloat(document.getElementById("nitrite").value);
  const nitrate = parseFloat(document.getElementById("nitrate").value);
  const co2 = 3 * kh * Math.pow(10, (7 - ph));

  await addDoc(collection(db, "users", uid, "logs"), {
    ph, gh, kh, chlorine, nitrite, nitrate, co2, date: new Date()
  });

  document.getElementById("result").innerText = `CO₂ level: ${co2.toFixed(1)} mg/L`;
  loadChart(uid);
});

async function loadChart(uid) {
  const q = query(collection(db, "users", uid, "logs"), orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  const labels = [];
  const values = [];
  querySnapshot.forEach(doc => {
    const data = doc.data();
    const d = new Date(data.date.seconds * 1000);
    labels.unshift(d.toLocaleDateString());
    values.unshift(data.co2.toFixed(1));
  });

  const ctx = document.getElementById("chart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "CO₂ (mg/L)",
        data: values,
        borderColor: "rgba(59,130,246,1)",
        backgroundColor: "rgba(59,130,246,0.1)",
        fill: true,
        tension: 0.3
      }]
    }
  });
}
