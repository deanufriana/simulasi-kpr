import "./global.css";

import React, { Suspense } from "react";
import { HashRouter as Router, useRoutes } from "react-router-dom";
import ReactDOM from "react-dom/client";
import routes from "~react-pages";

import { ThemeProvider } from "next-themes";

import { Layout } from "./components/Layout";
import { Loader } from "./components/Loader";

const App = () => {
  return (
    <Layout>
      <Suspense fallback={<Loader />}>{useRoutes(routes)}</Suspense>
    </Layout>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* @ts-ignore */}
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
