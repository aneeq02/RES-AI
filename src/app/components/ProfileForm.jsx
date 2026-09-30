import React, { useState } from "react";
import { LoaderCircle, Wand2 } from "lucide-react";
import Field from "../../components/forms/Field";
import { api } from "../../lib/api";

const EMPTY = { name: "", company: "", website: "", industry: "", audience: "", competitors: "", brandVoice: "" };
// eslint-disable-next-line react-refresh/only-export-components
export const toForm = (me) => ({
  ...EMPTY,
  name: me?.profile?.name || "",
  ...(me?.business ? { ...me.business, competitors: me.business.competitors.join(", ") } : {}),
});
const toBody = (v) => ({ ...v, competitors: v.competitors.split(",").map((s) => s.trim()).filter(Boolean) });

/** steps: array of field-name arrays; one step per page when `stepped`, all fields at once otherwise. */
// eslint-disable-next-line react-refresh/only-export-components
export const STEPS = [
  { title: "Your company", fields: ["name", "company", "website", "industry"] },
  { title: "Customers and competitors", fields: ["audience", "competitors"] },
  { title: "Brand voice", fields: ["brandVoice"] },
];

const FIELDS = {
  name: { label: "Your name", autoComplete: "name" },
  company: { label: "Company name", autoComplete: "organization" },
  website: { label: "Website", placeholder: "yourcompany.com", inputMode: "url" },
  industry: { label: "Industry", placeholder: "e.g. B2B SaaS for project management" },
  audience: { label: "Who are your customers?", as: "textarea", rows: 3, placeholder: "e.g. Operations leads at 20–200 person agencies" },
  competitors: { label: "Main competitors", hint: "Comma-separated, e.g. Asana, Monday.com, ClickUp" },
  brandVoice: { label: "How should we sound?", as: "textarea", rows: 4, placeholder: "e.g. Plain-spoken, confident, no jargon. Short sentences." },
};

export default function ProfileForm({ initial, onSubmit, submitLabel, stepped = false, showDraft = false }) {
  const [values, setValues] = useState(initial);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [draftState, setDraftState] = useState({ busy: false, error: null });
  const visible = stepped ? STEPS[step].fields : STEPS.flatMap((s) => s.fields);
  const last = !stepped || step === STEPS.length - 1;

  const set = (k) => (e) => { setValues((v) => ({ ...v, [k]: e.target.value })); if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined })); };

  const draft = async () => {
    setDraftState({ busy: true, error: null });
    try {
      const { draft: d } = await api("/profile/draft-from-website", { method: "POST", body: { website: values.website } });
      setValues((v) => ({ ...v, ...Object.fromEntries(Object.entries({ ...d, competitors: d.competitors.join(", ") }).filter(([k, val]) => val && !v[k])) }));
      setDraftState({ busy: false, error: null });
    } catch (e) {
      setDraftState({ busy: false, error: e.body?.error || "Couldn't read that website." });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (visible.includes("company") && !values.company.trim()) {
      setErrors({ company: "Company name is required." });
      return;
    }
    if (!last) { setStep((s) => s + 1); return; }
    setBusy(true);
    try { await onSubmit(toBody(values)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {stepped && <p className="text-sm text-subtle">Step {step + 1} of {STEPS.length} · {STEPS[step].title}</p>}
      {visible.map((k) => (
        <Field key={k} name={k} {...FIELDS[k]} value={values[k]} onChange={set(k)} error={errors[k]} />
      ))}
      {showDraft && visible.includes("website") && (
        <div>
          <button type="button" onClick={draft} disabled={!values.website.trim() || draftState.busy} className="btn-secondary">
            {draftState.busy ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Wand2 size={16} aria-hidden="true" />}
            Fill from my website
          </button>
          {draftState.error && <p className="field-error" role="alert">{draftState.error}</p>}
          {draftState.busy && <p className="mt-2 text-sm text-subtle" role="status">Buddy is reading your site…</p>}
        </div>
      )}
      <div className="flex gap-3">
        {stepped && step > 0 && <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-secondary">Back</button>}
        <button type="submit" disabled={busy} className="btn-primary">{last ? submitLabel : "Continue"}</button>
      </div>
    </form>
  );
}
