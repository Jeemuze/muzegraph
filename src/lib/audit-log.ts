type AuthEventType = "LOGIN_SUCCESS" | "LOGIN_FAILED" | "LOGIN_BLOCKED";

interface AuthEventData {
  email?: string;
  userId?: string;
  reason?: string;
}

export function logAuthEvent(event: AuthEventType, data: AuthEventData) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, event, ...data };

  // Structured logging — bisa dihubungkan ke external service (Datadog, Sentry, dll)
  if (event === "LOGIN_SUCCESS") {
    console.log("[AUTH]", JSON.stringify(logEntry));
  } else {
    console.warn("[AUTH]", JSON.stringify(logEntry));
  }
}
