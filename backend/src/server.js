import app from "./app.js";

export default app;

const PORT = Number(process.env.PORT) || 5050;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[fanhub] API listening on http://localhost:${PORT}`);
  });
}
