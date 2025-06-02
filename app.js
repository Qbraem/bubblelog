import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

const authContainer = document.getElementById('auth-container');
const dashboard = document.getElementById('dashboard');
const authForm = document.getElementById('auth-form');
const toggleLink = document.getElementById('toggle-link');
const authSubmit = document.getElementById('auth-submit');
const logoutButton = document.getElementById('logout-button');
const googleSignin = document.getElementById('google-signin');

let isRegister = false;

toggleLink.addEventListener('click', () => {
  isRegister = !isRegister;
  authSubmit.textContent = isRegister ? 'Register' : 'Login';
  toggleLink.textContent = isRegister ? 'Already have an account? Login' : "Don't have an account? Register";
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = authForm.email.value;
  const password = authForm.password.value;

  try {
    if (isRegister) {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    alert(error.message);
  }
});

googleSignin.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    alert(error.message);
  }
});

logoutButton.addEventListener('click', async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, user => {
  if (user) {
    authContainer.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadData(user.uid);
  } else {
    authContainer.classList.remove('hidden');
    dashboard.classList.add('hidden');
  }
});

const dataForm = document.getElementById('data-form');
const resultDiv = document.getElementById('result');

dataForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const ph = parseFloat(document.getElementById('ph').value);
  const gh = parseFloat(document.getElementById('gh').value);
  const kh = parseFloat(document.getElementById('kh').value);
  const chlorine = parseFloat(document.getElementById('chlorine').value);
  const nitrite = parseFloat(document.getElementById('nitrite').value);
  const nitrate = parseFloat(document.getElementById('nitrate').value);

  const co2 = Math.round(3 * kh * Math.pow(10, (7 - ph)));

  try {
    await addDoc(collection(db, 'measurements'), {
      userId: user.uid,
      timestamp: new Date(),
      ph, gh, kh, chlorine, nitrite, nitrate, co2
    });
    resultDiv.textContent = `Saved! Estimated CO₂: ${co2} mg/L`;
    resultDiv.classList.remove('text-red-500');
    resultDiv.classList.add('text-green-600');
  } catch (err) {
    resultDiv.textContent = 'Error saving data.';
    resultDiv.classList.remove('text-green-600');
    resultDiv.classList.add('text-red-500');
  }
});

async function loadData(uid) {
  const q = query(collection(db, 'measurements'), where('userId', '==', uid));
  const querySnapshot = await getDocs(q);
  const labels = [];
  const phData = [];

  querySnapshot.forEach(doc => {
    const d = doc.data();
    const date = new Date(d.timestamp.seconds * 1000);
    labels.push(date.toLocaleDateString());
    phData.push(d.ph);
  });

  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'pH',
        data: phData,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4
      }]
    }
  });
}