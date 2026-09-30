/**
 * Maps a failed POST /tasks/:id/start into the message shown under the task card.
 * `err` is the ApiError thrown by `api()`: { status, body }.
 */
export function taskStartErrorMessage(err) {
  if (err?.body?.error === "insufficient_credits") return "Not enough credits.";
  if (err?.status === 503 && err?.body?.error === "enqueue_failed") {
    return "Buddy couldn't queue this task. Your credits were refunded.";
  }
  if (err?.status === 409) return "This task was already started.";
  return "Couldn't start the task.";
}
