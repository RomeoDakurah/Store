// src/utils/getImageUrl.jsx
const BACKEND_URL = "http://127.0.0.1:8000";
export default function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${BACKEND_URL}${path}`;
}
