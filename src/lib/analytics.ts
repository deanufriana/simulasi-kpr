import ReactGA from "react-ga4";

export const GA_MEASUREMENT_ID = "G-25CEMG7DB1";

export const initGA = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
