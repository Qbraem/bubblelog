import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

const authContainer = document.getElementById('auth-container');
const dashboard = document.getElementById('dashboard');
const authForm = document.getElementById('auth-form');
const toggleLink = document.getElementById('toggle-link');
const authSubmit = document.getElementById('auth-submit');
const logoutButton = document.getElementById('logout-button');
const profileSection = document.getElementById('profile-section');
const profileToggle = document.getElementById('profile-toggle');
const profileDropdown = document.getElementById('profile-dropdown');
const profileUsername = document.getElementById('profile-username');
const contactDeveloper = document.getElementById('contact-developer');
const extraRegisterFields = document.getElementById('extra-register-fields');

let isRegister = false;
let currentUserData = null;

toggleLink.addEventListener('click', () => {
  isRegister = !isRegister;
  authSubmit.textContent = isRegister ? 'Register' : 'Login';
  toggleLink.textContent = isRegister ? 'Already have an account? Login' : "Don't have an account? Register";

  if (isRegister) {
    extraRegisterFields.classList.remove('hidden');
    extraRegisterFields.style.opacity = '1';
  } else {
    extraRegisterFields.style.opacity = '0';
    setTimeout(() => {
      extraRegisterFields.classList.add('hidden');
    }, 300);
  }
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = authForm.email.value;
  const password = authForm.password.value;

  if (isRegister) {
    const firstname = document.getElementById('firstname').value.trim();
    const lastname = document.getElementById('lastname').value.trim();
    const username = document.getElementById('username').value.trim();
    const country = document.getElementById('country').value;

    if (!firstname || !lastname || !username || !country) {
      alert("Please fill all registration fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid, "profile", "info"), {
        firstname,
        lastname,
        username,
        country,
        email
      });

    } catch (error) {
      alert(error.message);
    }
  } else {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  }
});

logoutButton.addEventListener('click', async () => {
  await signOut(auth);
});

profileToggle.addEventListener('click', () => {
  profileDropdown.classList.toggle('hidden');
});

contactDeveloper.addEventListener('click', () => {
  window.location.href = "mailto:braem@live.be";
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authContainer.classList.add('hidden');
    dashboard.classList.remove('hidden');
    profileSection.classList.remove('hidden');

    try {
      const profileDoc = await getDocs(query(collection(db, `users/${user.uid}/profile`)));
      if (!profileDoc.empty) {
        const data = profileDoc.docs[0].data();
        currentUserData = data;
        profileUsername.textContent = data.username || user.email;
      } else {
        profileUsername.textContent = user.email;
      }
    } catch {
      profileUsername.textContent = user.email;
    }

    loadData(user.uid);
  } else {
    authContainer.classList.remove('hidden');
    dashboard.classList.add('hidden');
    profileSection.classList.add('hidden');
    currentUserData = null;
  }
});

// Data and other app logic below (same as before)...

const dataForm = document.getElementById('data-form');
const resultDiv = document.getElementById('result');
const aiAdvice = document.getElementById('ai-advice');
const historyList = document.getElementById('history-list');
const detailView = document.getElementById('detail-view');
const detailContent = document.getElementById('detail-content');
const filterDate = document.getElementById('filter-date');

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
    resultDiv.textContent = '';
    aiAdvice.textContent = generateAdvice(ph, gh, kh, chlorine, nitrite, nitrate, co2);
    loadData(user.uid);
  } catch (err) {
    alert('Error saving data: ' + err.message);
  }
});

function generateAdvice(ph, gh, kh, chlorine, nitrite, nitrate, co2) {
  const advice = [];
  if (ph < 6.5) advice.push("pH is a bit low, consider buffering.");
  else if (ph > 7.5) advice.push("pH is high, watch for stress.");

  if (gh < 4) advice.push("GH is low, may affect fish health.");
  if (kh < 3) advice.push("KH is low, water hardness might fluctuate.");

  if (chlorine > 0) advice.push("Chlorine detected! Use dechlorinator.");
  if (nitrite > 0.5) advice.push("Nitrite is elevated! Partial water change recommended.");
  if (nitrate > 40) advice.push("Nitrate is high! Reduce feeding or clean tank.");

  if (co2 > 30) advice.push("CO₂ is high, improve aeration.");
  if (co2 < 5) advice.push("CO₂ is very low, may limit plant growth.");

  return advice.length ? advice.join(" ") : "✅ Water quality looks good!";
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
