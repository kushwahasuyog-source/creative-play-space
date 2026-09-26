/** Hand a piece of assistant output over to another page (builder, templates). */
const KEY = "botforge:handoff";

export function setHandoff(text: string) {
  try {
    sessionStorage.setItem(KEY, text);
  } catch {
    /* storage unavailable — the target page simply starts empty */
  }
}

export function takeHandoff(): string | null {
  try {
    const value = sessionStorage.getItem(KEY);
    if (value) sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}
