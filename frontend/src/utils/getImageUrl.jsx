// src/utils/getImageUrl.jsx
const BACKEND_URL = import.meta.env.VITE_API_URL;
export default function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${BACKEND_URL}${path}`;
}
