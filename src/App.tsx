import { useState, useCallback } from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import LoadingScreen from "./components/feature/LoadingScreen";
import ScrollToTop from "./components/feature/ScrollToTop";
import SEO from "./components/feature/SEO";

function App() {
  const [loading, setLoading] = useState(true);

  const Router = __IS_PREVIEW__ ? HashRouter : BrowserRouter;

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <SEO />
      {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <div
        style={{
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.5s ease',
          pointerEvents: loading ? 'none' : 'auto',
        }}
      >
        <Router {...(!__IS_PREVIEW__ ? { basename: __BASE_PATH__ } : {})}>
          <ScrollToTop />
          <AppRoutes />
        </Router>
      </div>
    </I18nextProvider>
  );
}

export default App;
