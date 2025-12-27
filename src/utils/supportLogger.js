// src/utils/supportLogger.js
import { supabase } from '../services/supabaseClient';

export const logSupportEvent = async (eventType, username, metadata = {}) => {
  // Get or create a persistent ID for this specific browsing session
  let sessionId = sessionStorage.getItem('wishpeti_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('wishpeti_session_id', sessionId);
  }

  const { error } = await supabase.from('session_logs').insert({
    user_session_id: sessionId,
    event_type: eventType,
    username_viewed: username,
    metadata: {
      ...metadata,
      url: window.location.href,
      timestamp: new Date().toISOString()
    },
    user_agent: navigator.userAgent
  });

  if (error) console.error("Logging failed:", error);
};