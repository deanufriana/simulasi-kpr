import "./global.css";

import React, { Suspense, useEffect } from "react";
import { HashRouter as Router, useRoutes, useLocation } from "react-router-dom";
import ReactDOM from "react-dom/client";
import routes from "~react-pages";

import { ThemeProvider } from "next-themes";

import { Layout } from "./components/Layout";
import { Loader } from "./components/Loader";
import { initGA, trackPageView } from "./lib/analytics";

const App = () => {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

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
