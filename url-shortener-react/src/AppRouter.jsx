import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/NavBar";
import ShortenUrlPage from "./components/ShortenUrlPage";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import AboutPage from "./components/AboutPage";
import PrivacyPage from "./components/PrivacyPage";
import TermsPage from "./components/TermsPage";
import CookiePage from "./components/CookiePage";
import AccessibilityPage from "./components/AccessibilityPage";
import PrivacyManagerPage from "./components/PrivacyManagerPage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import ErrorPage from "./components/ErrorPage";
import { useStoreContext } from "./contextApi/ContextApi";
import PageFade from "./components/PageFade";
import AmbientDarkBackground from "./components/AmbientDarkBackground";
import AmbientLightBackground from "./components/AmbientLightBackground";

const shellSurface = (dark) =>
  dark
    ? "relative overflow-x-hidden min-h-screen flex flex-col bg-transparent text-lx-foreground motion-safe:transition-[color] motion-safe:duration-[480ms] motion-safe:ease-out"
    : "relative overflow-x-hidden flex min-h-screen flex-col bg-transparent text-lx-foreground motion-safe:transition-colors motion-safe:duration-[480ms] motion-safe:ease-out";

const AppRouter = () => {
  const { pathname, hash } = useLocation();
  const { theme } = useStoreContext();
  const hideHeaderFooter = pathname.startsWith("/s");
  const isDark = theme === "dark";

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pathname, hash]);

  return (
    <div className={shellSurface(isDark)}>
      {isDark ? <AmbientDarkBackground /> : <AmbientLightBackground />}
      {!hideHeaderFooter && (
        <>
          <Navbar />
          <div aria-hidden className="h-[theme(spacing.navbar)]" />
        </>
      )}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: isDark ? "var(--lx-elevated)" : "var(--lx-surface)",
            color: "var(--lx-text-primary)",
            border: "1px solid var(--lx-border)",
            borderRadius: "0.75rem",
            boxShadow: isDark
              ? "0 4px 24px -4px rgb(0 0 0 / 0.35)"
              : "0 10px 40px -14px rgb(15 23 42 / 0.12), 0 4px 12px -10px rgb(37 99 235 / 0.08)",
            transitionProperty: "background-color,color,box-shadow",
            transitionDuration: "0.35s",
          },
          success: {
            iconTheme: {
              primary: isDark ? "#34d399" : "#059669",
              secondary: isDark ? "var(--lx-elevated)" : "var(--lx-surface)",
            },
          },
          error: {
            iconTheme: {
              primary: isDark ? "#f87171" : "#dc2626",
              secondary: isDark ? "var(--lx-elevated)" : "var(--lx-surface)",
            },
          },
        }}
      />
      <main className="relative z-[1] flex-1 motion-safe:transition-[background-color,color] motion-safe:duration-[480ms]">
        <Routes>
          <Route
            path="/"
            element={
              <PageFade>
                <LandingPage />
              </PageFade>
            }
          />
          <Route
            path="/about"
            element={
              <PageFade>
                <AboutPage />
              </PageFade>
            }
          />
          <Route
            path="/privacy"
            element={
              <PageFade>
                <PrivacyPage />
              </PageFade>
            }
          />
          <Route
            path="/terms"
            element={
              <PageFade>
                <TermsPage />
              </PageFade>
            }
          />
          <Route
            path="/cookie"
            element={
              <PageFade>
                <CookiePage />
              </PageFade>
            }
          />
          <Route
            path="/accessibility"
            element={
              <PageFade>
                <AccessibilityPage />
              </PageFade>
            }
          />
          <Route
            path="/privacy-manager"
            element={
              <PageFade>
                <PrivacyManagerPage />
              </PageFade>
            }
          />
          <Route path="/s/:url" element={<ShortenUrlPage />} />

          <Route
            path="/register"
            element={
              <PrivateRoute publicPage={true}>
                <PageFade>
                  <RegisterPage />
                </PageFade>
              </PrivateRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PrivateRoute publicPage={true}>
                <PageFade>
                  <LoginPage />
                </PageFade>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute publicPage={false}>
                <PageFade>
                  <DashboardLayout />
                </PageFade>
              </PrivateRoute>
            }
          />
          <Route
            path="/error"
            element={
              <PageFade>
                <ErrorPage />
              </PageFade>
            }
          />
          <Route
            path="*"
            element={
              <PageFade>
                <ErrorPage variant="notFound" />
              </PageFade>
            }
          />
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
};

export default AppRouter;

export const SubDomainRouter = () => {
  const { theme } = useStoreContext();
  const isDark = theme === "dark";

  return (
    <div className={shellSurface(isDark)}>
      {isDark ? <AmbientDarkBackground /> : <AmbientLightBackground />}
      <div className="relative z-[1] flex min-h-screen flex-col">
        <Routes>
          <Route path="/:url" element={<ShortenUrlPage />} />
        </Routes>
      </div>
    </div>
  );
};
