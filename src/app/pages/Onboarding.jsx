import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../../components/navbar/Logo";
import ProfileForm, { toForm } from "../components/ProfileForm";
import { hasActivePlan, useMe } from "../../context/MeContext";
import { api } from "../../lib/api";

export default function Onboarding() {
  const { me, refresh } = useMe();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");

  const save = async (body) => {
    await api("/profile", { method: "PUT", body });
    const fresh = await refresh();
    const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
    navigate(safeNext || (hasActivePlan(fresh) ? "/app" : "/checkout"), { replace: true });
  };

  return (
    <div className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-xl">
        <Logo className="text-4xl" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Tell your team about your business</h1>
        <p className="mt-2 text-muted">Every agent reads this before it works for you. You can change it any time in Settings.</p>
        <div className="card mt-8 p-6 md:p-8">
          <ProfileForm initial={toForm(me)} onSubmit={save} submitLabel="Finish setup" stepped showDraft />
        </div>
      </div>
    </div>
  );
}
