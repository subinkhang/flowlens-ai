import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routers/index.router.tsx";
import "./index.css";
import { worker } from "./api/mocks/browser.ts";

// ✅ Khởi động mock server trước khi render app
worker.start().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
});
