export function formatDate(d, sep = "-") {
  if (!d) return "";
  d = new Date(d);
  return d.getFullYear() + sep + String(d.getMonth() + 1).padStart(2, "0") + sep + String(d.getDate()).padStart(2, "0");
}
export function formatTime(d) {
  if (!d) return "";
  d = new Date(d);
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
export function getPressureStatus(sys, dia) {
  if (sys >= 140 || dia >= 90) return { level: "high", label: "偏高", color: "#fa709a" };
  if (sys < 90 || dia < 60) return { level: "low", label: "偏低", color: "#f6d365" };
  return { level: "normal", label: "正常", color: "#43e97b" };
}
export function getSugarStatus(v) {
  if (v >= 7.0) return { level: "high", label: "偏高", color: "#fa709a" };
  if (v < 3.9) return { level: "low", label: "偏低", color: "#f6d365" };
  return { level: "normal", label: "正常", color: "#43e97b" };
}
export function getOxygenStatus(v) {
  if (v >= 95) return { level: "normal", label: "正常", color: "#43e97b" };
  if (v >= 90) return { level: "low", label: "偏低", color: "#f6d365" };
  return { level: "danger", label: "危险", color: "#fa709a" };
}
export function getHRStatus(v) {
  if (v > 100) return { level: "high", label: "偏快", color: "#f6d365" };
  if (v < 60) return { level: "low", label: "偏慢", color: "#f6d365" };
  return { level: "normal", label: "正常", color: "#43e97b" };
}
export const relationMap = { self: "本人", spouse: "配偶", parent: "父母", child: "子女", other: "其他" };