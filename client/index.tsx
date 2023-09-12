import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Cron } from "croner";

//import "./helpers/subscription";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("app")
);

Cron("5 0 * * * *", () => window.dispatchEvent(new Event("weNeedNotif")));