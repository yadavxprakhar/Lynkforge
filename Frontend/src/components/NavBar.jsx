import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useStoreContext } from "../contextApi/ContextApi";

const NavBar = () => {
  const navigate = useNavigate();
  const { token, setToken } = useStoreContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onLogOut = () => {
    setToken(null);
    localStorage.removeItem("JWT_TOKEN");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 border-b border-[rgba(255,255,255,0.06)] transition-all duration-300 ${
        isScrolled
          ? "bg-[#080808]/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1200px] h-full px-6 lg:px-20 flex items-center justify-between">
        {/* Logo Left */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-display font-extrabold text-[20px] tracking-tight group focus:outline-none"
        >
          <svg
            className="w-5 h-5 text-[#4DFFB4] transition-transform duration-300 group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
          </svg>
          <span>LYNKFORGE</span>
        </Link>

        {/* Center/Right Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("features")}
            className="text-[13px] font-medium text-[#A0A0A0] hover:text-white transition-colors duration-150 focus:outline-none"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="text-[13px] font-medium text-[#A0A0A0] hover:text-white transition-colors duration-150 focus:outline-none"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-[13px] font-medium text-[#A0A0A0] hover:text-white transition-colors duration-150 focus:outline-none"
          >
            Docs
          </button>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {token ? (
            <>
              <Link to="/dashboard" className="btn-ghost py-2.5 px-5 text-[12px]">
                Dashboard
              </Link>
              <button
                onClick={onLogOut}
                className="btn-primary py-2.5 px-5 text-[12px] bg-[#4DFFB4] text-[#080808] hover:bg-[#3DE8A0]"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost py-2.5 px-5 text-[12px]">
                Login
              </Link>
              <Link to="/signup" className="btn-primary py-2.5 px-5 text-[12px]">
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#A0A0A0] hover:text-white transition-colors duration-150 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#080808]/98 backdrop-blur-lg z-40 flex flex-col px-6 py-8 gap-6 border-t border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => scrollToSection("features")}
            className="text-[16px] font-medium text-[#A0A0A0] hover:text-white transition-colors duration-150 text-left py-2"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="text-[16px] font-medium text-[#A0A0A0] hover:text-white transition-colors duration-150 text-left py-2"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-[16px] font-medium text-[#A0A0A0] hover:text-white transition-colors duration-150 text-left py-2"
          >
            Docs
          </button>
          
          <div className="h-[1px] bg-[rgba(255,255,255,0.06)] my-4" />

          {token ? (
            <div className="flex flex-col gap-4">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-ghost w-full text-center"
              >
                Dashboard
              </Link>
              <button onClick={onLogOut} className="btn-primary w-full">
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-ghost w-full text-center"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full text-center"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default NavBar;
