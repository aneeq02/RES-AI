/** Incremental text/event-stream parser: push decoded chunks, get (event, parsedJson) callbacks. */
export function createSseParser(onEvent) {
  let buf = "";
  return {
    push(chunk) {
      buf += chunk.replace(/\r\n/g, "\n");
      let i;
      while ((i = buf.indexOf("\n\n")) !== -1) {
        const raw = buf.slice(0, i);
        buf = buf.slice(i + 2);
        let event = "message";
        const data = [];
        for (const line of raw.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
        }
        if (data.length) onEvent(event, JSON.parse(data.join("\n")));
      }
    },
  };
}
