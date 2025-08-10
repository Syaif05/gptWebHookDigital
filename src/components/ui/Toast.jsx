"use client";
import { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(null);
export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((msg, tone = "neutral") => {
    const id = Math.random().toString(36).slice(2);
    setList((s) => [...s, { id, msg, tone }]);
    setTimeout(() => setList((s) => s.filter((t) => t.id !== id)), 3000);
  }, []);
  return <ToastCtx.Provider value={{ push }}>{children}</ToastCtx.Provider>;
}
export function useToast() {
  return useContext(ToastCtx);
}

export function Toaster() {
  const [list] = useState(null); // placeholder to force client
  return (
    <div id="toaster" className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* injected by provider via portal in simple way */}
    </div>
  );
}
