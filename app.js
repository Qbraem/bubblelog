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
const languageMenu = document.getElementById('language-menu');
const languageToggle = document.getElementById('language-toggle');
const languageDropdown = document.getElementById('language-dropdown');
const languageCurrent = document.getElementById('language-current');
const extraRegisterFields = document.getElementById('extra-register-fields');
const welcomeInfo = document.getElementById('welcome-info');
const welcomeDismiss = document.getElementById('welcome-dismiss');
const welcomeLine1 = document.getElementById('welcome-line1');
const welcomeLine2 = document.getElementById('welcome-line2');
const welcomeLine3 = document.getElementById('welcome-line3');

const translations = {
  en: {
    line1: "BubbleLog helps you monitor your aquarium's water quality and spot trends.",
    line2: "Add your measurements regularly so we can provide accurate graphs and insights.",
    line3: "We are currently testing a new AI feature that offers advice based on your data.",
    logout: "Logout",
    contact: "Contact Developer",
    loginHeading: "Login or Register",
    loginBtn: "Login",
    registerBtn: "Register",
    toggleToRegister: "Don't have an account? Register",
    toggleToLogin: "Already have an account? Login",
    measurementsTitle: "Your Measurements"
  },
  nl: {
    line1: "BubbleLog helpt je de waterkwaliteit van je aquarium bij te houden en trends te zien.",
    line2: "Voeg regelmatig je metingen toe zodat we nauwkeurige grafieken en inzichten kunnen tonen.",
    line3: "We testen momenteel een nieuwe AI-functie die advies geeft op basis van jouw gegevens.",
    logout: "Uitloggen",
    contact: "Ontwikkelaar contacteren",
    loginHeading: "Inloggen of Registreren",
    loginBtn: "Inloggen",
    registerBtn: "Registreren",
    toggleToRegister: "Nog geen account? Registreren",
    toggleToLogin: "Reeds een account? Inloggen",
    measurementsTitle: "Jouw Metingen"
  }
};

function setLanguage(lang) {
  const t = translations[lang] || translations.en;
  welcomeLine1.textContent = t.line1;
  welcomeLine2.textContent = t.line2;
  welcomeLine3.textContent = t.line3;
  
  if (languageCurrent) languageCurrent.textContent = lang.toUpperCase();
  localStorage.setItem('lang', lang);
  currentLang = lang;
}

const savedLang = localStorage.getItem('lang') || 'en';
let currentLang = savedLang;
if (languageToggle) {
  const arrow = document.getElementById('language-arrow');
  languageToggle.addEventListener('click', () => {
    const isShown = languageDropdown.classList.toggle('show');
    arrow.style.transform = isShown ? 'rotate(180deg)' : 'rotate(0deg)';
    languageToggle.setAttribute('aria-expanded', isShown);
  });

  languageDropdown.querySelectorAll('button[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      languageDropdown.classList.remove('show');
      arrow.style.transform = 'rotate(0deg)';
      languageToggle.setAttribute('aria-expanded', false);
    });
  });

  document.addEventListener('click', (ev) => {
    if (!languageMenu.contains(ev.target)) {
      if (languageDropdown.classList.contains('show')) {
        languageDropdown.classList.remove('show');
        arrow.style.transform = 'rotate(0deg)';
        languageToggle.setAttribute('aria-expanded', false);
      }
    }
  });

  setLanguage(savedLang);
  updateAuthTexts(savedLang);
}

let isRegister = false;
let currentUserData = null;
let lastMeasurement = null;

function updateAuthTexts(lang = currentLang) {
  const t = translations[lang] || translations.en;
  authSubmit.textContent = isRegister ? t.registerBtn : t.loginBtn;
  toggleLink.textContent = isRegister ? t.toggleToLogin : t.toggleToRegister;
}

if (welcomeDismiss) {
  welcomeDismiss.addEventListener('click', () => {
    welcomeInfo.classList.add('hidden');
  });
}

toggleLink.addEventListener('click', () => {
  isRegister = !isRegister;
  updateAuthTexts();

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
    if (welcomeInfo) welcomeInfo.classList.remove('hidden');
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

    loadData(user.uid);
  } else {
    authContainer.classList.remove('hidden');
    dashboard.classList.add('hidden');
    if (welcomeInfo) welcomeInfo.classList.add('hidden');
    profileContainer.style.display = 'none';
    if (profileUsername) profileUsername.textContent = '';
    currentUserData = null;
    lastMeasurement = null;
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

let chartPh = null;
let chartCo2 = null;

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

  lastMeasurement = { ph, gh, kh, chlorine, nitrite, nitrate, co2 };

  try {
    await addDoc(collection(db, `users/${user.uid}/measurements`), {
      timestamp: new Date(),
      ph, gh, kh, chlorine, nitrite, nitrate, co2
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

  if (isNaN(ph)) advice.push("pH value missing");
  else {
    checkSeverity(ph < 6 || ph > 8, "pH is slightly out of range (6-8).", "pH is critically out of range!");
  }

  if (isNaN(gh)) advice.push("GH value missing");
  else {
    checkSeverity(gh < 3, "GH is low, monitor fish health.");
  }

  if (isNaN(kh)) advice.push("KH value missing");
  else {
    checkSeverity(kh < 3, "KH is low, may cause pH swings.");
  }

  if (!isNaN(chlorine) && chlorine > 0) {
    maxSeverity = 2;
    advice.push("Chlorine detected! Use dechlorinator immediately.");
  }
  if (!isNaN(nitrite) && nitrite > 0.3) {
    maxSeverity = 2;
    advice.push("Nitrite levels are high! Partial water change recommended.");
  }
  if (!isNaN(nitrate) && nitrate > 40) {
    maxSeverity = 1;
    advice.push("Nitrate is elevated, consider cleaning or less feeding.");
  }
  if (!isNaN(co2)) {
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
  const q = query(collection(db, `users/${uid}/measurements`), orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);

  const labels = [];
  const phData = [];
  const co2Data = [];
  const filter = filterDate.value;

  let firstMeasurement = null;

  querySnapshot.forEach((docSnapshot, index) => {
    const d = docSnapshot.data();
    const docId = docSnapshot.id;
    const date = d.timestamp.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    if (filter && filter !== dateStr) return;

    if (!firstMeasurement) firstMeasurement = d;

    labels.push(date.toLocaleDateString());
    phData.push(d.ph);
    co2Data.push(d.co2);

    const li = document.createElement('li');
    li.className = "flex justify-between items-center py-2 hover:bg-blue-100 rounded px-2";

    const textSpan = document.createElement('span');
    textSpan.textContent = date.toLocaleString();
    textSpan.className = "cursor-pointer flex-grow";
    textSpan.onclick = () => {
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

    const delBtn = document.createElement('span');
    delBtn.className = "delete-btn";
    delBtn.title = "Delete this measurement";
    delBtn.textContent = "✖";
    delBtn.onclick = async (ev) => {
      ev.stopPropagation();
      if (confirm("Are you sure you want to delete this measurement?")) {
        try {
          await deleteDoc(doc(db, `users/${uid}/measurements`, docId));
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

  updateOrCreateChart('chart', labels, phData, 'pH', 'rgba(59, 130, 246, 1)');
  updateOrCreateChart('chart-co2', labels, co2Data, 'CO₂ (mg/L)', 'rgba(34, 197, 94, 1)');
}

function updateOrCreateChart(canvasId, labels, data, label, color) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  let chartInstance = (canvasId === 'chart') ? chartPh : chartCo2;

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.update();
  } else {
    chartInstance = new Chart(ctx, {
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
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
    if (canvasId === 'chart') chartPh = chartInstance;
    else chartCo2 = chartInstance;
  }
}


function showAIReport(measurement) {
  const { ph, gh, kh, chlorine, nitrite, nitrate, co2 } = measurement;
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


filterDate.addEventListener('change', () => {
  const user = auth.currentUser;
  if (user) loadData(user.uid);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((err) => {
      console.error('ServiceWorker registration failed:', err);
    });
  });
}


