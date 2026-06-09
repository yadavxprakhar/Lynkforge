import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#080808] border-t border-[rgba(255,255,255,0.06)] py-16">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-white font-display font-extrabold text-[18px] tracking-tight group focus:outline-none"
            >
              <svg
                className="w-4 h-4 text-[#4DFFB4]"
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
            <p className="text-[14px] leading-relaxed text-[#A0A0A0]">
              Shorten, track, and manage your URLs with precision. Built for developers and teams who move fast.
            </p>
          </div>

          {/* Column 2: Product */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
              Product
            </h4>
            <nav className="flex flex-col gap-2.5">
              <a href="#features" className="text-[13px] text-[#A0A0A0] hover:text-white transition-colors duration-150">
                Features
              </a>
              <a href="#pricing" className="text-[13px] text-[#A0A0A0] hover:text-white transition-colors duration-150">
                Pricing
              </a>
              <a href="#changelog" className="text-[13px] text-[#A0A0A0] hover:text-white transition-colors duration-150">
                Changelog
              </a>
            </nav>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
              Legal
            </h4>
            <nav className="flex flex-col gap-2.5">
              <a href="/privacy" className="text-[13px] text-[#A0A0A0] hover:text-white transition-colors duration-150">
                Privacy Policy
              </a>
              <a href="/terms" className="text-[13px] text-[#A0A0A0] hover:text-white transition-colors duration-150">
                Terms of Service
              </a>
            </nav>
          </div>

          {/* Column 4: Connect */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
              Connect
            </h4>
            <nav className="flex flex-col gap-2.5">
              <a
                href="https://github.com/yadavxprakhar/Lynkforge---A-URL-Shortner-App"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[#A0A0A0] hover:text-white transition-colors duration-150"
              >
                GitHub
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[#A0A0A0] hover:text-white transition-colors duration-150"
              >
                Twitter
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom divider and info */}
        <div className="pt-8 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#525252]">
            &copy; 2026 Lynkforge. All rights reserved.
          </p>
          <p className="text-[12px] text-[#525252]">
            Built with Spring Boot + React
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
