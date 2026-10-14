import React, { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowRight, LoaderCircle, MailCheck } from "lucide-react";
import Field from "../components/forms/Field";
import { getSupabase, supabaseConfigured } from "../lib/supabase";
import { email as emailRule } from "../utils/validation";

export default function Login({ mode = "login" }) {
  const [params] = useSearchParams();
  const { state } = useLocation();
  const next = params.get("next") || "/app";
  const [email, setEmail] = useState(state?.email || "");
  const [error, setError] = useState();
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const redirectTo = typeof window === "undefined" ? "" : `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const isSignup = mode === "signup";

  const sendLink = async (e) => {
    e.preventDefault();
    const msg = emailRule(email);
    setError(msg);
    if (msg) return;
    setStatus("sending");
    try {
      const supabase = await getSupabase();
      const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo } });
      if (err) {
        setError(err.message);
        setStatus("idle");
      } else setStatus("sent");
    } catch {
      setError("We couldn't send the link. Check your connection and try again.");
      setStatus("idle");
    }
  };

  const google = async () => {
    try {
      const supabase = await getSupabase();
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    } catch {
      setError("We couldn't reach Google sign-in. Check your connection and try again.");
    }
  };

  return (
    <section className="container-page flex min-h-[80vh] items-center justify-center pb-24 pt-32">
      <div className="card w-full max-w-md p-8 md:p-10">
        {!supabaseConfigured ? (
          <p role="alert" className="text-sm text-muted">Sign-in isn't configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.</p>
        ) : status === "sent" ? (
          <div role="status" className="text-center">
            <MailCheck size={36} className="mx-auto text-ok" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Check your inbox</h1>
            <p className="mt-2 text-sm text-muted">We sent a sign-in link to <span className="font-bold text-ink">{email.trim()}</span>. It expires in an hour.</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight">{isSignup ? "Create your account" : "Welcome back"}</h1>
            <p className="mt-2 text-sm text-muted">{isSignup ? "Your AI team is a few minutes away." : "Sign in to your res workspace."}</p>
            <button type="button" onClick={google} className="btn-secondary mt-8 w-full">Continue with Google</button>
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-subtle">
              <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
            </div>
            <form onSubmit={sendLink} noValidate className="space-y-4">
              <Field label="Work email" type="email" autoComplete="email" inputMode="email" placeholder="you@company.com" value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(undefined); }} error={error} />
              <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
                {status === "sending" ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : null}
                Email me a sign-in link <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-muted">
              {isSignup ? "Already have an account? " : "New to res? "}
              <Link to={`${isSignup ? "/login" : "/signup"}?next=${encodeURIComponent(next)}`} className="font-bold text-ink underline-offset-4 hover:underline">
                {isSignup ? "Sign in" : "Create an account"}
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
