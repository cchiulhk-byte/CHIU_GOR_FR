import { useNavigate } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { Suspense, useEffect } from "react";
import routes from "./config";
import LoadingFallback from "../components/feature/LoadingFallback";
import { resolveNavigate } from "./navigatePromise";

declare global {
  interface Window {
    REACT_APP_NAVIGATE: ReturnType<typeof useNavigate>;
  }
}

export function AppRoutes() {
  const element = useRoutes(routes);
  const navigate = useNavigate();
  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
    resolveNavigate(window.REACT_APP_NAVIGATE);
  });
  return <Suspense fallback={<LoadingFallback />}>{element}</Suspense>;
}
