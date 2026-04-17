import "./global.css";

import React, { Suspense } from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import ReactDOM from "react-dom/client";
import routes from "~react-pages";

import { ThemeProvider } from "next-themes";

const App = () => {
  return <Suspense fallback={<p>Loading...</p>}>{useRoutes(routes)}</Suspense>;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* @ts-ignore */}
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router basename={import.meta.env.BASE_URL}>
        <App />
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
