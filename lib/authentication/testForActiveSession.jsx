// Replace your existing testForActiveSession.jsx with this version
// that doesn't force redirects and just returns the session status

import { getSessionCookie } from "./session";

export const testForActiveSession = () => {
  try {
    const sessionUsername = getSessionCookie("adminLinker");
    return sessionUsername || null;
  } catch (error) {
    console.error("Error checking session:", error);
    return null;
  }
}