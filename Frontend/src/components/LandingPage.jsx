import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStoreContext } from "../contextApi/ContextApi";
import { useInView } from "../hooks/useInView";
import api from "../api/api";
import toast from "react-hot-toast";

const LandingPage = () => {
  const navigate = useNavigate();
  const { token } = useStoreContext();
  const [quickUrl, setQuickUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortUrlResult, setShortUrlResult] = useState("");
  const [copied, setCopied] = useState(false);

  // Initialize scroll animation observer
  useInView();

  const handleShorten = async (e) => {
    e.preventDefault();
    const originalUrl = quickUrl.trim();
    if (!originalUrl) {
      toast.error("Please paste a URL first");
      return;
    }

    setLoading(true);
    setShortUrlResult("");
    setCopied(false);

    try {
      const endpoint = token ? "/api/urls/shorten" : "/api/urls/public/shorten-once";
      const config = token
        ? {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: "Bearer " + token,
            },
          }
        : {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          };

      const { data: res } = await api.post(endpoint, { originalUrl }, config);
      const fullShortUrl = `${import.meta.env.VITE_REACT_FRONT_END_URL}/s/${res.shortUrl}`;
      setShortUrlResult(fullShortUrl);
      setQuickUrl("");
      toast.success("Short URL forged!");
    } catch (err) {
      const status = err?.response?.status;
      if (!token && (status === 401 || status === 403)) {
        toast.error("Limit reached. Please sign in to forge more links.");
        navigate("/login");
      } else {
        toast.error("Could not forge short URL. Please check your link format.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shortUrlResult) return;
    navigator.clipboard.writeText(shortUrlResult);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#080808] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Grid Overlay texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center text-center gap-8 relative z-10">
          {/* Announcement Pill */}
          <div
            data-animate
            className="data-animate inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(77,255,180,0.08)] border border-[rgba(77,255,180,0.2)] text-[12px] font-semibold text-[#4DFFB4]"
          >
            <span>New: QR Code generation is live</span>
            <span className="text-[10px] opacity-80">→</span>
          </div>

          {/* Heading */}
          <h1
            data-animate
            className="data-animate text-[48px] md:text-[80px] font-display font-extrabold leading-[0.95] tracking-[-0.03em] max-w-[800px] text-white"
          >
            Forge Your <br />
            <span className="text-[#4DFFB4]">Links.</span>
          </h1>

          {/* Subtitle */}
          <p
            data-animate
            className="data-animate text-[16px] md:text-[18px] text-[#A0A0A0] max-w-[500px] leading-relaxed"
          >
            Shorten, track, and manage your URLs with precision. Built for developers and teams who move fast.
          </p>

          {/* Shortener Widget */}
          <div data-animate className="data-animate w-full max-w-[680px] mt-4">
            <form
              onSubmit={handleShorten}
              className="flex flex-col sm:flex-row gap-3 bg-[#141414] border border-[rgba(255,255,255,0.10)] rounded-[12px] p-2.5"
            >
              <input
                type="url"
                placeholder="Paste your long URL here..."
                required
                className="flex-1 bg-transparent px-4 py-3 text-[15px] font-mono text-[#4DFFB4] placeholder-[#525252] outline-none"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary rounded-[8px] sm:w-auto px-8 py-3.5 bg-[#4DFFB4] text-[#080808] hover:bg-[#3DE8A0] font-bold"
              >
                {loading ? "Forging..." : "Shorten"}
              </button>
            </form>

            {/* Disclaimer */}
            <p className="text-[12px] text-[#525252] mt-4">
              No signup required for 3 free links &middot; Full analytics with free account
            </p>

            {/* Success result widget */}
            {shortUrlResult && (
              <div className="mt-6 p-4 rounded-[12px] bg-[#0F0F0F] border border-[rgba(77,255,180,0.25)] flex items-center justify-between gap-4 max-w-[600px] mx-auto animate-fade-in">
                <span className="font-mono text-[14px] text-[#4DFFB4] truncate">
                  {shortUrlResult}
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="btn-primary py-2 px-4 text-[12px] bg-[#4DFFB4] text-[#080808]"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-t border-[rgba(255,255,255,0.06)]" />

      {/* Stats Strip */}
      <section className="py-16 bg-[#0F0F0F]">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div data-animate className="data-animate flex flex-col items-center md:items-start gap-1">
            <span className="text-[52px] md:text-[64px] font-display font-extrabold text-[#4DFFB4] leading-none">
              2.4B+
            </span>
            <span className="text-[11px] font-semibold tracking-[0.15em] text-[#525252] uppercase">
              Links Shortened
            </span>
          </div>

          <div data-animate className="data-animate flex flex-col items-center md:items-start gap-1 border-y md:border-y-0 md:border-x border-[rgba(255,255,255,0.06)] py-6 md:py-0 md:px-8">
            <span className="text-[52px] md:text-[64px] font-display font-extrabold text-[#4DFFB4] leading-none">
              99.9%
            </span>
            <span className="text-[11px] font-semibold tracking-[0.15em] text-[#525252] uppercase">
              Uptime Guarantee
            </span>
          </div>

          <div data-animate className="data-animate flex flex-col items-center md:items-start gap-1">
            <span className="text-[52px] md:text-[64px] font-display font-extrabold text-[#4DFFB4] leading-none">
              0ms
            </span>
            <span className="text-[11px] font-semibold tracking-[0.15em] text-[#525252] uppercase">
              Redirect Latency
            </span>
          </div>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-t border-[rgba(255,255,255,0.06)]" />

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="text-center md:text-left mb-16">
          <h4
            data-animate
            className="data-animate text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase mb-2"
          >
            What you get
          </h4>
          <h2
            data-animate
            className="data-animate text-[36px] md:text-[52px] font-display font-bold leading-none tracking-[-0.02em] text-white"
          >
            Everything a link needs.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "⚡", title: "Custom Short Links", desc: "Create memorable slugs to represent your brand or campaigns." },
            { icon: "📊", title: "Real-Time Analytics", desc: "Monitor clicks, referrer sources, and visitor demographics live." },
            { icon: "🔒", title: "Secure & Private", desc: "Password-protect sensitive destinations with encryption." },
            { icon: "🖼️", title: "QR Code Generator", desc: "Instantly create customizable high-resolution QR codes." },
            { icon: "✏️", title: "Edit Any Link", desc: "Modify redirect destination URLs without changing your short links." },
            { icon: "🔑", title: "JWT Auth Flow", desc: "Secure multi-device user registration and token-based login." },
          ].map((feat, index) => (
            <div
              key={index}
              data-animate
              className="data-animate card flex flex-col items-start gap-4"
            >
              <span className="text-[36px] filter drop-shadow-[0_0_8px_rgba(77,255,180,0.2)]">
                {feat.icon}
              </span>
              <h3 className="text-[20px] font-display font-semibold text-white">
                {feat.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-[#A0A0A0]">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <hr className="border-t border-[rgba(255,255,255,0.06)]" />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="text-center mb-20">
          <h4
            data-animate
            className="data-animate text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase mb-2"
          >
            Process
          </h4>
          <h2
            data-animate
            className="data-animate text-[36px] md:text-[52px] font-display font-bold leading-none tracking-[-0.02em] text-white"
          >
            How it works.
          </h2>
        </div>

        <div className="flex flex-col gap-16">
          {[
            { num: "01", step: "Paste Long URL", desc: "Drop your lengthy destination URL into our secure forging interface. Custom slug options and passwords can be applied instantly." },
            { num: "02", step: "Customize Slug", desc: "Define a clean branding slug to increase click-through rates. Generate matching high-resolution QR codes." },
            { num: "03", step: "Copy & Share", desc: "Instantly copy your clean short link to your clipboard. Distribute across campaigns and watch analytics stream live." }
          ].map((item, index) => (
            <div
              key={index}
              data-animate
              className={`data-animate flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Number */}
              <div className="w-full md:w-1/2 flex justify-center text-[96px] font-display font-extrabold text-[#4DFFB4] leading-none opacity-80 select-none">
                {item.num}
              </div>
              {/* Description */}
              <div className="w-full md:w-1/2 flex flex-col gap-3 text-center md:text-left">
                <h3 className="text-[22px] font-display font-bold text-white">
                  {item.step}
                </h3>
                <p className="text-[15px] leading-relaxed text-[#A0A0A0]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <hr className="border-t border-[rgba(255,255,255,0.06)]" />

      {/* CTA Section */}
      <section id="pricing" className="relative py-24 px-6 text-center border-t border-[rgba(77,255,180,0.15)] bg-[#0F0F0F]">
        <div className="max-w-[600px] mx-auto flex flex-col items-center gap-6">
          <h2
            data-animate
            className="data-animate text-[36px] md:text-[52px] font-display font-bold leading-none text-white italic"
          >
            Start forging links.
          </h2>
          <p
            data-animate
            className="data-animate text-[15px] text-[#A0A0A0] leading-relaxed"
          >
            Join developers and campaign teams who move fast. Claim your custom domain shortener dashboard today.
          </p>
          <div data-animate className="data-animate flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            {token ? (
              <Link to="/dashboard" className="btn-primary px-8 py-3.5">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary px-8 py-3.5">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-ghost px-8 py-3.5">
                  Login to Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
