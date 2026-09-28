import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 5050;

createApp().listen(PORT, () => {
  console.log(`[fanhub] API listening on http://localhost:${PORT}`);
});
