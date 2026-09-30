const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmail = (v) => EMAIL_RE.test(String(v).trim());

/**
 * Runs `rules` ({ field: (value, allValues) => errorMessage | undefined })
 * and returns an object containing only the fields that failed.
 */
export function validate(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const msg = rule(values[field] ?? "", values);
    if (msg) errors[field] = msg;
  }
  return errors;
}

export const required = (label) => (v) => (String(v).trim() ? undefined : `${label} is required.`);
export const email = (v) =>
  !String(v).trim() ? "Email is required." : isEmail(v) ? undefined : "Enter a valid email, like you@company.com.";
