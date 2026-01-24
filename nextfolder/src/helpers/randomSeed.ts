export function randomSeed(min = 5, max = 22) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789-!/";
  const length = Math.floor(Math.random() * (max - min + 1)) + min;

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}
