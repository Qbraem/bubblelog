import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
const confirmation = document.getElementById('confirmation');
const historySection = document.getElementById('history');
const historyList = document.getElementById('history-list');
const detailView = document.getElementById('detail-view');
const detailContent = document.getElementById('detail-content');
const filterDate = document.getElementById('filter-date');
const aiAdvice = document.getElementById('ai-advice');

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
    console.error('Auth error:', error);
    alert(error.message);
  }
});

googleSignin.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Google sign-in error:', error);
    alert(error.message);
  }
});

logoutButton.addEventListener('click', async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  }
});

onAuthStateChanged(auth, user => {
  if (user) {
    authContainer.classList.add('hidden');
    dashboard.classList.remove('hidden');
    historySection.classList.remove('hidden');
    document.getElementById('filter-container').classList.remove('hidden');
    loadData(user.uid);
  } else {
    authContainer.classList.remove('hidden');
    dashboard.classList.add('hidden');
    historySection.classList.add('hidden');
    document.getElementById('filter-container').classList.add('hidden');
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
    await addDoc(collection(db, `users/${user.uid}/measurements`), {
      timestamp: new Date(),
      ph, gh, kh, chlorine, nitrite, nitrate, co2
    });

    confirmation.classList.remove('hidden');
    resultDiv.textContent = `Saved! Estimated CO₂: ${co2} mg/L`;
    aiAdvice.textContent = generateAdvice(ph, gh, kh, chlorine, nitrite, nitrate, co2);
    loadData(user.uid);
  } catch (err) {
    console.error('Firestore write error:', err);
    alert('Error saving data: ' + err.message);
  }
});

function generateAdvice(ph, gh, kh, chlorine, nitrite, nitrate, co2) {
  if (co2 > 30) return "⚠️ CO₂ is high. Ensure proper aeration.";
  if (co2 < 5) return "🔄 CO₂ is very low. Consider adjusting your setup.";
  if (nitrite > 0.5) return "⚠️ Nitrite levels are elevated. Perform partial water change.";
  if (nitrate > 40) return "⚠️ Nitrate levels high. May cause algae problems.";
  return "✅ Water quality looks good!";
}

async function loadData(uid) {
  historyList.innerHTML = '';
  const q = query(collection(db, `users/${uid}/measurements`), orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);

  const labels = [];
  const phData = [];
  const co2Data = [];
  const filter = filterDate.value;

  querySnapshot.forEach(doc => {
    const d = doc.data();
    const date = d.timestamp.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    if (filter && filter !== dateStr) return;

    labels.push(date.toLocaleDateString());
    phData.push(d.ph);
    co2Data.push(d.co2);

    const li = document.createElement('li');
    li.className = "py-2 cursor-pointer hover:bg-blue-100 rounded px-2";
    li.textContent = date.toLocaleString();
    li.onclick = () => {
      detailContent.innerHTML = `
        <p><strong>pH:</strong> ${d.ph}</p>
        <p><strong>GH:</strong> ${d.gh}</p>
        <p><strong>KH:</strong> ${d.kh}</p>
        <p><strong>CO₂:</strong> ${d.co2} mg/L</p>
        <p><strong>Chlorine:</strong> ${d.chlorine ?? '—'}</p>
        <p><strong>Nitrite:</strong> ${d.nitrite ?? '—'}</p>
        <p><strong>Nitrate:</strong> ${d.nitrate ?? '—'}</p>
        <p><strong>Date:</strong> ${date.toLocaleDateString()}<br/><strong>Time:</strong> ${date.toLocaleTimeString()}</p>
      `;
      detailView.classList.remove('hidden');
    };
    historyList.appendChild(li);
  });

  renderChart('chart', labels, phData, 'pH', 'rgba(59, 130, 246, 1)');
  renderChart('chart-co2', labels, co2Data, 'CO₂ (mg/L)', 'rgba(34, 197, 94, 1)');
}

function renderChart(canvasId, labels, data, label, color) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: color,
        backgroundColor: color + '33',
        tension: 0.4
      }]
    }
  });
}

filterDate.addEventListener('change', () => {
  const user = auth.currentUser;
  if (user) loadData(user.uid);
});
