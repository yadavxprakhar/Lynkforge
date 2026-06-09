import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/NavBar";
import ShortenUrlPage from "./components/ShortenUrlPage";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import DashboardHome from "./components/Dashboard/DashboardHome";
import CreateLinkPage from "./components/Dashboard/CreateLinkPage";
import EditLinkPage from "./components/Dashboard/EditLinkPage";
import AnalyticsPage from "./components/Dashboard/AnalyticsPage";
import PrivateRoute from "./PrivateRoute";
import ErrorPage from "./components/ErrorPage";
import AboutPage from "./components/AboutPage";
import PrivacyPage from "./components/PrivacyPage";
import TermsPage from "./components/TermsPage";

const AppRouter = () => {
  const { pathname, hash } = useLocation();
  
  // Header and footer are hidden inside dashboard content to let the dashboard use its fixed sidebar layout cleanly.
  const isDashboard = pathname.startsWith("/dashboard");
  const isRedirect = pathname.startsWith("/s/");

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
    <div className="relative min-h-screen flex flex-col bg-[#080808] text-white selection:bg-[#4DFFB4]/30 selection:text-white">
      {!isDashboard && !isRedirect && <Navbar />}
      
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#141414",
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "0.5rem",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
          },
          success: {
            iconTheme: {
              primary: "#4DFFB4",
              secondary: "#080808",
            },
          },
          error: {
            iconTheme: {
              primary: "#FF4D4D",
              secondary: "#080808",
            },
          },
        }}
      />
      
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          
          <Route
            path="/login"
            element={
              <PrivateRoute publicPage={true}>
                <LoginPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PrivateRoute publicPage={true}>
                <SignupPage />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute publicPage={false}>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="create" element={<CreateLinkPage />} />
            <Route path="edit/:id" element={<EditLinkPage />} />
            <Route path="analytics/:id" element={<AnalyticsPage />} />
          </Route>
          
          <Route path="/s/:url" element={<ShortenUrlPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<ErrorPage variant="notFound" />} />
        </Routes>
      </main>
      
      {!isDashboard && !isRedirect && <Footer />}
    </div>
  );
};

export default AppRouter;

export const SubDomainRouter = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#080808] text-white">
      <Routes>
        <Route path="/:url" element={<ShortenUrlPage />} />
      </Routes>
    </div>
  );
};
