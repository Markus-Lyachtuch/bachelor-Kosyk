export const saveToLocalStorage = <T>(key: string, value: T) => {
  return localStorage.setItem(key, JSON.stringify(value));
};

export const getFromLocalStorage = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  return item ? (JSON.parse(item) as T) : null;
};

export const removeFromLocalStorage = (key: string) => {
  return localStorage.removeItem(key);
}
