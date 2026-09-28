import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

import { router } from "@/router";
import { registerRouter } from "@/lib/api";

registerRouter(router);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
