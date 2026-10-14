import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import ProfileForm, { toForm } from "../components/ProfileForm";
import { formatDate } from "../components/CreditsMeter";
import { useMe } from "../../context/MeContext";
import { api } from "../../lib/api";
import { openBillingPortal } from "../../lib/billing";
import { hasActivePlan, subscriptionNeedsPayment } from "../../lib/subscription";
import PaymentIssueNotice from "../../components/billing/PaymentIssueNotice";
import { getPlan } from "../../data/plans";

export default function Settings() {
  const { me, refresh } = useMe();
  const [saved, setSaved] = useState(false);
  const [portalError, setPortalError] = useState(null);
  const plan = getPlan(me.subscription?.planId);

  const save = async (body) => {
    await api("/profile", { method: "PUT", body });
    await refresh();
    setSaved(true);
  };

  const openPortal = async () => {
    try {
      await openBillingPortal();
    } catch {
      setPortalError("Billing isn't available yet. Choose a plan first.");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="card p-6 md:p-8" aria-labelledby="profile-h">
        <h1 id="profile-h" className="text-3xl font-extrabold tracking-[-0.03em]">Business <span className="hl">profile</span></h1>
        <p className="mt-1 text-sm text-muted">Your agents read this before every task.</p>
        <div className="mt-6">
          <ProfileForm key={me.business?.company} initial={toForm(me)} onSubmit={save} submitLabel="Save changes" />
          {saved && <p role="status" className="mt-3 text-sm text-ok">Saved.</p>}
        </div>
      </section>
      <aside className="card h-fit p-6" aria-labelledby="plan-h">
        <h2 id="plan-h" className="kicker">Plan and credits</h2>
        {subscriptionNeedsPayment(me) ? (
          <PaymentIssueNotice className="mt-4" />
        ) : hasActivePlan(me) ? (
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Plan</dt><dd>{plan?.name ?? me.subscription.planId}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Credits left</dt><dd>{me.credits.balance} / {me.credits.allowance}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Resets</dt><dd>{formatDate(me.credits.resetsAt)}</dd></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink/10" aria-hidden="true"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, Math.round((me.credits.balance / Math.max(1, me.credits.allowance)) * 100))}%` }} /></div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted">No active plan. <Link to="/checkout" className="font-bold text-ink underline">Choose one</Link></p>
        )}
        <button type="button" onClick={openPortal} className="btn-secondary mt-6 w-full">Manage billing <ExternalLink size={16} aria-hidden="true" /></button>
        {portalError && <p className="field-error" role="alert">{portalError}</p>}
      </aside>
    </div>
  );
}
