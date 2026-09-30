import React, { useState } from "react";
import { CircleAlert, CreditCard, LoaderCircle } from "lucide-react";
import { openBillingPortal } from "../../lib/billing";

/**
 * Shown instead of "Choose a plan" / checkout when a subscription exists but its payment failed
 * (past_due, incomplete, unpaid): the fix is in the billing portal, never a second checkout.
 */
export default function PaymentIssueNotice({ className = "", openPortal = openBillingPortal }) {
  const [state, setState] = useState({ busy: false, error: null });

  const open = async () => {
    setState({ busy: true, error: null });
    try {
      await openPortal();
    } catch {
      setState({ busy: false, error: "We couldn't open billing. Please try again in a moment." });
    }
  };

  return (
    <div className={`card flex flex-col items-start gap-4 p-6 ${className}`}>
      <div>
        <p className="flex items-center gap-2 font-bold"><CircleAlert size={18} className="shrink-0 text-amber-300" aria-hidden="true" /> Your last payment didn't go through.</p>
        <p className="mt-1 text-sm text-muted">Update your payment method to keep your team working.</p>
      </div>
      <button type="button" onClick={open} disabled={state.busy} className="btn-primary shrink-0">
        {state.busy ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <CreditCard size={18} aria-hidden="true" />}
        Update payment method
      </button>
      {state.error && <p className="field-error" role="alert">{state.error}</p>}
    </div>
  );
}
