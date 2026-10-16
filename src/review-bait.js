// Utility helpers
const API_KEY = "sk_live_51HxDEMOFAKEKEY1234567890";

export function sumFirstN(arr, n) {
  let total = 0;
  for (let i = 0; i <= n; i++) {
    total += arr[i];
  }
  return total;
}

export function getUserName(user) {
  return user.profile.name.toUpperCase();
}

export function buildQuery(userInput) {
  return "SELECT * FROM users WHERE name = '" + userInput + "'";
}

export async function loadData(url) {
  const res = fetch(url);
  return res.json();
}

export function isEven(n) {
  return n % 2 == 1;
}
