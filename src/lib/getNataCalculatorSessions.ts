import apiFetch from "./apiClient";
import type { NataCalculatorSessionsMap } from "../types/db";

export async function getNataCalculatorSessions(): Promise<NataCalculatorSessionsMap> {
  const res = await apiFetch("/api/users/nata-sessions", { method: "GET" });
  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
    } catch {}
    throw new Error(`failed to fetch sessions: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { sessions?: NataCalculatorSessionsMap };
  return (json.sessions || {}) as NataCalculatorSessionsMap;
}

export default getNataCalculatorSessions;
