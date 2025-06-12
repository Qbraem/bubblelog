import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  doc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
const profileContainer = document.getElementById('profile-container');
const profileToggle = document.getElementById('profile-name-dropdown');
const profileDropdown = document.getElementById('profile-dropdown');
const profileUsername = document.getElementById('profile-username');
const contactDeveloper = document.getElementById('contact-developer');
const extraRegisterFields = document.getElementById('extra-register-fields');
const aquariumSelect = document.getElementById('aquarium-select');
const addAquariumBtn = document.getElementById('add-aquarium');
const deleteAquariumBtn = document.getElementById('delete-aquarium');
const aquariumMenu = document.getElementById('aquarium-menu');

let isRegister = false;
let currentUserData = null;
let lastMeasurement = null;
let currentAquariumId = null;


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
  const isShown = profileDropdown.classList.toggle('show');
  document.getElementById('profile-arrow').style.transform = isShown ? 'rotate(180deg)' : 'rotate(0deg)';
  profileToggle.setAttribute('aria-expanded', isShown);
});

document.addEventListener('click', (event) => {
  if (!profileContainer.contains(event.target)) {
    if (profileDropdown.classList.contains('show')) {
      profileDropdown.classList.remove('show');
      document.getElementById('profile-arrow').style.transform = 'rotate(0deg)';
      profileToggle.setAttribute('aria-expanded', false);
    }
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authContainer.classList.add('hidden');
    dashboard.classList.remove('hidden');
    profileContainer.style.display = 'flex';

    try {
      const profileDoc = await getDocs(query(collection(db, `users/${user.uid}/profile`)));
      if (!profileDoc.empty) {
        const data = profileDoc.docs[0].data();
        currentUserData = data;
        if (profileUsername) profileUsername.textContent = data.username || user.email;
      } else {
        if (profileUsername) profileUsername.textContent = user.email;
      }
    } catch {
      if (profileUsername) profileUsername.textContent = user.email;
    }

    loadAquariums(user.uid);
  } else {
    authContainer.classList.remove('hidden');
    dashboard.classList.add('hidden');
    profileContainer.style.display = 'none';
    if (profileUsername) profileUsername.textContent = '';
    currentUserData = null;
    lastMeasurement = null;
    currentAquariumId = null;
  }
});

const dataForm = document.getElementById('data-form');
const resultDiv = document.getElementById('result');
const historyList = document.getElementById('history-list');
const detailView = document.getElementById('detail-view');
const detailContent = document.getElementById('detail-content');
const filterDate = document.getElementById('filter-date');
const aiAdviceBox = document.getElementById('ai-advice-box');
const aiAdviceText = document.getElementById('ai-advice-text');
const aiStatusArrow = document.getElementById('ai-status-arrow');
const aiStatusIcon = document.getElementById('ai-status-icon');
const aiStatusMeter = document.getElementById('ai-status-meter');
const reminderList = document.getElementById('reminder-list');

const testFrequencies = {
  ph: 7,
  gh: 30,
  kh: 14,
  chlorine: 7,
  nitrite: 7,
  nitrate: 7,
  fe2: 7
};

const testLabels = {
  ph: 'pH',
  gh: 'GH',
  kh: 'KH',
  chlorine: 'Chlorine',
  nitrite: 'Nitrite',
  nitrate: 'Nitrate',
  fe2: 'Fe2'
};

let chartMain = null;

async function loadAquariums(uid, selectId = null) {
  const snapshot = await getDocs(collection(db, `users/${uid}/aquariums`));
  aquariumSelect.innerHTML = '';
  let firstId = null;
  const list = [];
  snapshot.forEach((docSnap) => {
    const name = docSnap.data().name || 'Unnamed';
    const opt = document.createElement('option');
    opt.value = docSnap.id;
    opt.textContent = name;
    aquariumSelect.appendChild(opt);
    if (!firstId) firstId = docSnap.id;
    list.push({ id: docSnap.id, name });
  });

  if (!firstId) {
    const docRef = await addDoc(collection(db, `users/${uid}/aquariums`), { name: 'My Aquarium' });
    await setDoc(doc(db, `users/${uid}/aquariums/${docRef.id}/measurements`, 'init'), { init: true, timestamp: new Date() });
    firstId = docRef.id;
    const opt = document.createElement('option');
    opt.value = firstId;
    opt.textContent = 'My Aquarium';
    aquariumSelect.appendChild(opt);
    list.push({ id: firstId, name: 'My Aquarium' });
  }

  const selected = selectId || firstId;
  aquariumSelect.value = selected;
  currentAquariumId = selected;
  deleteAquariumBtn.classList.toggle('hidden', aquariumSelect.options.length <= 1);
  updateAquariumMenuButtons(list);
  loadData(uid);
}

function updateAquariumMenuButtons(list = null) {
  if (!aquariumMenu) return;
  if (!list) {
    list = Array.from(aquariumSelect.options).map(o => ({ id: o.value, name: o.textContent }));
  }
  aquariumMenu.innerHTML = '';
  if (list.length === 0) {
    aquariumMenu.classList.add('hidden');
    return;
  }
  aquariumMenu.classList.remove('hidden');
  list.slice(0, 3).forEach(aq => {
    const btn = document.createElement('button');
    btn.textContent = aq.name;
    if (aq.id === currentAquariumId) btn.classList.add('active');
    btn.addEventListener('click', () => {
      aquariumSelect.value = aq.id;
      currentAquariumId = aq.id;
      const user = auth.currentUser;
      if (user) loadData(user.uid);
      updateAquariumMenuButtons(list);
    });
    aquariumMenu.appendChild(btn);
  });
}

function parseNumber(value) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value)
    .replace(/,/g, '.')
    .replace(/\s+/g, '')
    .trim();
  if (cleaned === '' || cleaned === '.') return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function formatNumber(value) {
  if (typeof value !== 'number' || isNaN(value)) return '—';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function sanitizeMeasurementData(data) {
  return {
    ph: parseNumber(data.ph),
    gh: parseNumber(data.gh),
    kh: parseNumber(data.kh),
    chlorine: parseNumber(data.chlorine),
    nitrite: parseNumber(data.nitrite),
    nitrate: parseNumber(data.nitrate),
    fe2: parseNumber(data.fe2),
    co2: parseNumber(data.co2),
    timestamp: data.timestamp
  };
}

dataForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const numericFields = ['ph', 'gh', 'kh', 'chlorine', 'nitrite', 'nitrate', 'fe2'];
  for (const id of numericFields) {
    if (document.getElementById(id).value.includes(',')) {
      resultDiv.textContent = 'Use a dot (.) instead of a comma (,) for decimal numbers.';
      return;
    }
  }

  const ph = parseNumber(document.getElementById('ph').value);
  const gh = parseNumber(document.getElementById('gh').value);
  const kh = parseNumber(document.getElementById('kh').value);
  const chlorine = parseNumber(document.getElementById('chlorine').value);
  const nitrite = parseNumber(document.getElementById('nitrite').value);
  const nitrate = parseNumber(document.getElementById('nitrate').value);
  const fe2 = parseNumber(document.getElementById('fe2').value);
  const co2 = ph !== null && !isNaN(ph) && kh !== null && !isNaN(kh)
    ? Math.round(3 * kh * Math.pow(10, (7 - ph)))
    : null;

  lastMeasurement = { ph, gh, kh, chlorine, nitrite, nitrate, fe2, co2 };

  if (!currentAquariumId) {
    alert('Please create an aquarium first.');
    return;
  }

  try {
    await addDoc(collection(db, `users/${user.uid}/aquariums/${currentAquariumId}/measurements`), {
      timestamp: new Date(),
      ph, gh, kh, chlorine, nitrite, nitrate, fe2, co2
    });

    resultDiv.textContent = '';
    showAIReport(lastMeasurement);
    loadData(user.uid);
  } catch (err) {
    alert('Error saving data: ' + err.message);
  }
});

function generateAdvice(ph, gh, kh, chlorine, nitrite, nitrate, co2) {
  const advice = [];
  let maxSeverity = 0;

  function checkSeverity(cond, warningMsg, criticalMsg) {
    if (!cond) return;
    if (criticalMsg) {
      maxSeverity = Math.max(maxSeverity, 2);
      advice.push(criticalMsg);
    } else if (warningMsg) {
      maxSeverity = Math.max(maxSeverity, 1);
      advice.push(warningMsg);
    }
  }

  if (ph === null || isNaN(ph)) advice.push("pH value missing");
  else {
    checkSeverity(ph < 6 || ph > 8, "pH is slightly out of range (6-8).", "pH is critically out of range!");
  }

  if (gh === null || isNaN(gh)) advice.push("GH value missing");
  else {
    checkSeverity(gh < 3, "GH is low, monitor fish health.");
  }

  if (kh === null || isNaN(kh)) advice.push("KH value missing");
  else {
    checkSeverity(kh < 3, "KH is low, may cause pH swings.");
  }

  if (chlorine !== null && !isNaN(chlorine) && chlorine > 0) {
    maxSeverity = 2;
    advice.push("Chlorine detected! Use dechlorinator immediately.");
  }
  if (nitrite !== null && !isNaN(nitrite) && nitrite > 0.3) {
    maxSeverity = 2;
    advice.push("Nitrite levels are high! Partial water change recommended.");
  }
  if (nitrate !== null && !isNaN(nitrate) && nitrate > 40) {
    maxSeverity = 1;
    advice.push("Nitrate is elevated, consider cleaning or less feeding.");
  }
  if (co2 !== null && !isNaN(co2)) {
    if (co2 > 30) {
      maxSeverity = Math.max(maxSeverity, 2);
      advice.push("CO₂ is too high, aerate water.");
    } else if (co2 < 5) {
      maxSeverity = Math.max(maxSeverity, 1);
      advice.push("CO₂ is low, plants may suffer.");
    }
  }

  if (advice.length === 0) {
    advice.push("✅ Water quality looks good!");
  }

  return { text: advice.join(" "), severity: maxSeverity };
}

async function loadData(uid) {
  historyList.innerHTML = '';
  if (!currentAquariumId) return;
  const q = query(collection(db, `users/${uid}/aquariums/${currentAquariumId}/measurements`), orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);

  const labels = [];
  const phData = [];
  const ghData = [];
  const khData = [];
  const chlorineData = [];
  const nitriteData = [];
  const nitrateData = [];
  const fe2Data = [];
  const co2Data = [];
  const filter = filterDate.value;

  const reminderData = [];

  let firstMeasurement = null;

  querySnapshot.forEach((docSnapshot, index) => {
    if (docSnapshot.data().init) return; // skip placeholder docs
    const d = sanitizeMeasurementData(docSnapshot.data());
    const docId = docSnapshot.id;
    const date = d.timestamp.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    if (filter && filter !== dateStr) return;

    if (!firstMeasurement) firstMeasurement = d;

    reminderData.push(d);

    labels.push(date.toLocaleDateString());
    phData.push(typeof d.ph === 'number' && !isNaN(d.ph) ? d.ph : null);
    ghData.push(typeof d.gh === 'number' && !isNaN(d.gh) ? d.gh : null);
    khData.push(typeof d.kh === 'number' && !isNaN(d.kh) ? d.kh : null);
    chlorineData.push(typeof d.chlorine === 'number' && !isNaN(d.chlorine) ? d.chlorine : null);
    nitriteData.push(typeof d.nitrite === 'number' && !isNaN(d.nitrite) ? d.nitrite : null);
    nitrateData.push(typeof d.nitrate === 'number' && !isNaN(d.nitrate) ? d.nitrate : null);
    fe2Data.push(typeof d.fe2 === 'number' && !isNaN(d.fe2) ? d.fe2 : null);
    co2Data.push(typeof d.co2 === 'number' && !isNaN(d.co2) ? d.co2 : null);

    const li = document.createElement('li');
    li.className = "flex justify-between items-center py-2 hover:bg-blue-100 rounded px-2";

    const textSpan = document.createElement('span');
    textSpan.textContent = `${date.toLocaleString()} - Fe2: ${formatNumber(d.fe2)}`;
    textSpan.className = "cursor-pointer flex-grow";
    textSpan.onclick = () => {
      detailContent.innerHTML = `
        <p><strong>pH:</strong> ${formatNumber(d.ph)}</p>
        <p><strong>GH:</strong> ${formatNumber(d.gh)}</p>
        <p><strong>KH:</strong> ${formatNumber(d.kh)}</p>
        <p><strong>CO₂:</strong> ${formatNumber(d.co2)} mg/L</p>
        <p><strong>Chlorine:</strong> ${formatNumber(d.chlorine)}</p>
        <p><strong>Nitrite:</strong> ${formatNumber(d.nitrite)}</p>
        <p><strong>Nitrate:</strong> ${formatNumber(d.nitrate)}</p>
        <p><strong>Fe2:</strong> ${formatNumber(d.fe2)}</p>
        <p><strong>Date:</strong> ${date.toLocaleDateString()}<br/><strong>Time:</strong> ${date.toLocaleTimeString()}</p>
      `;
      detailView.classList.remove('hidden');
    };

    const delBtn = document.createElement('span');
    delBtn.className = "delete-btn";
    delBtn.title = "Delete this measurement";
    delBtn.textContent = "✖";
    delBtn.onclick = async (ev) => {
      ev.stopPropagation();
      if (confirm("Are you sure you want to delete this measurement?")) {
        try {
          await deleteDoc(doc(db, `users/${uid}/aquariums/${currentAquariumId}/measurements`, docId));
          loadData(uid);
        } catch (error) {
          alert("Failed to delete: " + error.message);
        }
      }
    };

    li.appendChild(textSpan);
    li.appendChild(delBtn);
    historyList.appendChild(li);
  });

  if (firstMeasurement) {
    lastMeasurement = firstMeasurement;
    showAIReport(lastMeasurement);
  } else {
    lastMeasurement = null;
    aiAdviceBox.classList.remove('disabled');
    aiAdviceBox.style.backgroundColor = '#e0e0e0';
    aiAdviceText.textContent = "This feature will be available in a future version.";
    aiStatusArrow.style.display = 'none';
    aiStatusIcon.textContent = '⏳';
    aiStatusIcon.className = 'text-gray-500 my-3 text-4xl';
  }

  updateOrCreateChart(labels, [
    { label: 'pH', data: phData, color: 'rgba(59, 130, 246, 1)' },
    { label: 'GH (°dH)', data: ghData, color: 'rgba(96, 165, 250, 1)' },
    { label: 'KH (°dH)', data: khData, color: 'rgba(251, 113, 133, 1)' },
    { label: 'Chlorine (mg/L)', data: chlorineData, color: 'rgba(34, 197, 94, 1)' },
    { label: 'Nitrite (mg/L)', data: nitriteData, color: 'rgba(234, 179, 8, 1)' },
    { label: 'Nitrate (mg/L)', data: nitrateData, color: 'rgba(249, 115, 22, 1)' },
    { label: 'Fe2 (mg/L)', data: fe2Data, color: 'rgba(139, 92, 246, 1)' },
    { label: 'CO₂ (mg/L)', data: co2Data, color: 'rgba(16, 185, 129, 1)' }
  ]);

  updateReminders(reminderData);
}

function updateOrCreateChart(labels, datasets) {
  const ctx = document.getElementById('chart').getContext('2d');
  let chartInstance = chartMain;

  if (chartInstance) {
    chartInstance.data.labels = labels;
    datasets.forEach((ds, idx) => {
      if (chartInstance.data.datasets[idx]) {
        chartInstance.data.datasets[idx].data = ds.data;
      }
    });
    chartInstance.update();
  } else {
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map(ds => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color,
          backgroundColor: ds.color + '33',
          tension: 0.4
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
    chartMain = chartInstance;
  }
}


function showAIReport(measurement) {
  const { ph, gh, kh, chlorine, nitrite, nitrate, fe2, co2 } = measurement;
  const { text, severity } = generateAdvice(ph, gh, kh, chlorine, nitrite, nitrate, co2);

  aiAdviceBox.classList.remove('disabled');
  aiAdviceBox.style.backgroundColor = severity === 2 ? '#fee2e2' : (severity === 1 ? '#fef3c7' : '#d1fae5');
  aiAdviceText.textContent = text;

  aiStatusArrow.style.display = 'block';
  aiStatusArrow.style.borderBottom = '8px solid ' + (severity === 2 ? '#dc2626' : (severity === 1 ? '#facc15' : '#10b981'));
  aiStatusArrow.style.borderLeft = '6px solid transparent';
  aiStatusArrow.style.borderRight = '6px solid transparent';
  const positions = ['10%', '50%', '90%'];
  aiStatusArrow.style.left = positions[severity];

  aiStatusIcon.textContent = severity === 2 ? '⚠️' : (severity === 1 ? '⚠' : '✅');
  aiStatusIcon.className = severity === 2 ? 'my-3 text-4xl text-red-600' :
                          severity === 1 ? 'my-3 text-4xl text-yellow-600' :
                                           'my-3 text-4xl text-green-600';
}

function updateReminders(measurements) {
  if (!reminderList) return;
  const lastDates = {};
  measurements.forEach((m) => {
    const ts = m.timestamp.toDate ? m.timestamp.toDate() : new Date(m.timestamp);
    for (const key in testFrequencies) {
      if (!lastDates[key] && m[key] !== null && !isNaN(m[key])) {
        lastDates[key] = ts;
      }
    }
  });

  reminderList.innerHTML = '';
  const now = new Date();
  for (const key in testFrequencies) {
    const li = document.createElement('li');
    li.classList.add('col-span-1', 'glass', 'rounded-lg', 'px-2', 'py-1');
    const lastDate = lastDates[key];
    const freq = testFrequencies[key];
    let text;
    if (!lastDate) {
      text = `${testLabels[key]}: test today`;
      li.classList.add('text-green-600', 'font-semibold');
    } else {
      const daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
      const daysLeft = freq - daysSince;
      if (daysLeft <= 0) {
        text = `${testLabels[key]}: test today`;
        li.classList.add('text-green-600', 'font-semibold');
      } else {
        text = `${testLabels[key]}: in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
        li.classList.add('text-black');
      }
    }
    li.textContent = text;
    reminderList.appendChild(li);
  }
}


filterDate.addEventListener('change', () => {
  const user = auth.currentUser;
  if (user) loadData(user.uid);
});

aquariumSelect.addEventListener('change', () => {
  currentAquariumId = aquariumSelect.value;
  const user = auth.currentUser;
  if (user) loadData(user.uid);
  deleteAquariumBtn.classList.toggle('hidden', aquariumSelect.options.length <= 1);
  updateAquariumMenuButtons();
});

addAquariumBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return;
  const name = prompt('Aquarium name');
  if (!name) return;
  try {
    const docRef = await addDoc(collection(db, `users/${user.uid}/aquariums`), { name });
    await setDoc(doc(db, `users/${user.uid}/aquariums/${docRef.id}/measurements`, 'init'), { init: true, timestamp: new Date() });
    loadAquariums(user.uid, docRef.id);
  } catch (err) {
    alert('Failed to add aquarium: ' + err.message);
  }
});

deleteAquariumBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user || !currentAquariumId) return;
  if (!confirm('Delete this aquarium?')) return;
  await deleteDoc(doc(db, `users/${user.uid}/aquariums`, currentAquariumId));
  currentAquariumId = null;
  loadAquariums(user.uid);
});



