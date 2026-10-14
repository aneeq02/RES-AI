import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, Clock, LoaderCircle, Mail, Phone, Send } from "lucide-react";
import RevealOnScroll from "../components/motion/RevealOnScroll";
import Field from "../components/forms/Field";
import { CONTACT } from "../data/nav";
import { validate, required, email as emailRule } from "../utils/validation";

const TOPICS = ["AI Agents", "CRM", "Website Management", "Billing", "Something else"];

const RULES = {
  name: required("Name"),
  email: emailRule,
  message: (v) => (String(v).trim().length >= 10 ? undefined : "Tell us a little more (at least 10 characters)."),
};

export default function Contact() {
  const [values, setValues] = useState({ name: "", email: "", topic: TOPICS[0], message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validate(values, RULES);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    // TODO: POST to a form endpoint (e.g. Formspree / your API) when available.
    setTimeout(() => setStatus("sent"), 900);
  };

  return (
    <>
      <section className="container-page grid items-start gap-12 pb-24 pt-32 md:pt-40 lg:grid-cols-2 lg:gap-20">
        <RevealOnScroll>
          <span className="eyebrow mb-6">Contact</span>
          <h1 className="page-title">
            Let's build <br />
            your team.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Ready to automate? Send us a note and a real person from our onboarding team will get back to you.
          </p>

          <ul className="mt-10 space-y-3">
            {[
              { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
              { icon: Phone, label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/[^+\d]/g, "")}` },
              { icon: Clock, label: "Response time", value: "Within 1 business day" },
            ].map(({ icon: Icon, label, value, href }) => {
              const inner = (
                <>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-brand/25 bg-brand/10 text-brand-ink">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-[0.14em] text-subtle">{label}</span>
                    <span className="block font-bold">{value}</span>
                  </span>
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <a href={href} className="flex items-center gap-4 rounded-2xl p-2 -m-2 transition hover:bg-ink/5">
                      {inner}
                    </a>
                  ) : (
                    <div className="flex items-center gap-4">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </RevealOnScroll>

        <RevealOnScroll delay={0.15}>
          <div className="card p-6 md:p-10">
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-10 text-center" role="status">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ok/15 text-ok">
                    <CircleCheck size={32} aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 text-3xl font-bold tracking-tight">Message sent</h2>
                  <p className="mt-3 text-muted">
                    Thanks, {values.name.split(" ")[0]}. We'll reply to <span className="text-ink">{values.email}</span> soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setValues({ name: "", email: "", topic: TOPICS[0], message: "" });
                      setStatus("idle");
                    }}
                    className="btn-secondary mt-8"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" exit={{ opacity: 0 }} onSubmit={onSubmit} noValidate className="space-y-6">
                  <Field label="Name" name="name" autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={values.email}
                    onChange={set("email")}
                    error={errors.email}
                  />
                  <fieldset>
                    <legend className="field-label">What can we help with?</legend>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map((t) => (
                        <label
                          key={t}
                          className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-ink ${
                            values.topic === t ? "border-brand bg-brand text-on-brand" : "border-line bg-canvas/40 text-ink-soft hover:border-line-strong"
                          }`}
                        >
                          <input type="radio" name="topic" value={t} checked={values.topic === t} onChange={set("topic")} className="sr-only" />
                          {t}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <Field
                    as="textarea"
                    label="Message"
                    name="message"
                    rows={5}
                    placeholder="Tell us about your business and what you'd like to automate."
                    value={values.message}
                    onChange={set("message")}
                    error={errors.message}
                  />
                  <button type="submit" disabled={status === "sending"} className="btn-light btn-lg w-full">
                    {status === "sending" ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Sending…
                      </>
                    ) : (
                      <>
                        Send message <Send size={18} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
