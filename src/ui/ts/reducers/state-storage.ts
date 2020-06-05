export function getStoredState<T>(defaultState: T, key: string): T {
  const stateString = localStorage.getItem(key);
  if (!stateString) {
    return defaultState;
  }
  const state: T = JSON.parse(stateString);
  if (!state) {
    return defaultState;
  }
  return state;
}
