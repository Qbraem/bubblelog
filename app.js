// AI advice logic based on latest measurement
function generateAIAdvice(data) {
  const { ph, gh, kh, chlorine, nitrite, nitrate } = data;

  let score = 100;
  if (ph < 6.5 || ph > 8.0) score -= 20;
  if (gh < 4 || gh > 12) score -= 15;
  if (kh < 3 || kh > 8) score -= 15;
  if (chlorine > 0.1) score -= 20;
  if (nitrite > 0.5) score -= 20;
  if (nitrate > 40) score -= 10;

  let advice = "Water parameters look great!";
  let icon = "🟢";
  if (score < 80) {
    advice = "Your water quality could use some improvement.";
    icon = "🟠";
  }
  if (score < 50) {
    advice = "Warning! Your water may be unsafe for fish.";
    icon = "🔴";
  }

  const arrow = document.getElementById("ai-status-arrow");
  const barWidth = document.getElementById("ai-status-meter").offsetWidth;
  if (arrow && barWidth) {
    arrow.style.position = "absolute";
    arrow.style.left = `${(score / 100) * (barWidth - 20)}px`;
    arrow.innerHTML = "⬆️";
  }

  document.getElementById("ai-advice-text").textContent = advice;
  document.getElementById("ai-status-icon").textContent = icon;
}

// Fetch latest measurement from Firebase for current user
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "./firebase-config.js";

const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const q = query(
      collection(db, "measurements"),
      where("user", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const latestDoc = querySnapshot.docs[0].data();
      generateAIAdvice(latestDoc);
    } else {
      document.getElementById("ai-advice-text").textContent = "Add your first measurements to get an AI advice!";
      document.getElementById("ai-status-icon").textContent = "⏳";
    }
  }
});
