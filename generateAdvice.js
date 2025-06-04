export function generateAdvice(ph, gh, kh, chlorine, nitrite, nitrate, co2) {
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
