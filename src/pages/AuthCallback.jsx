import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// supabase-js finishes the sign-in from the URL on load; we wait for the session and continue.
export default function AuthCallback() {
  const { session, loading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);
  const next = params.get("next") || "/app";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/app";

  useEffect(() => {
    if (session) navigate(safeNext, { replace: true });
  }, [session, safeNext, navigate]);

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), 10000);
    return () => clearTimeout(id);
  }, []);

  return (
    <section className="container-page flex min-h-[70vh] items-center justify-center pt-32" role="status">
      {timedOut && !loading && !session ? (
        <p className="text-muted">That sign-in link didn't work or has expired. <Link to="/login" className="font-bold text-white underline">Try again</Link></p>
      ) : (
        <p className="flex items-center gap-3 text-muted"><LoaderCircle className="animate-spin" aria-hidden="true" /> Signing you in…</p>
      )}
    </section>
  );
}
