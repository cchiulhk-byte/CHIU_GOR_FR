import { useState, useCallback } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import LoadingScreen from "./components/feature/LoadingScreen";
import ScrollToTop from "./components/feature/ScrollToTop";
import SEO from "./components/feature/SEO";

function App() {
  const [loading, setLoading] = useState(true);

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
        <BrowserRouter basename={__BASE_PATH__}>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </div>
    </I18nextProvider>
  );
}

export default App;
