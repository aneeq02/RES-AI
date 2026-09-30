const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The thread to open: `?thread=` only if it's a UUID from this agent's loaded threads, else the newest. */
export function pickThread(requested, threads) {
  if (requested && UUID.test(requested) && threads.some((t) => t.id === requested)) return requested;
  return threads[0]?.id;
}
