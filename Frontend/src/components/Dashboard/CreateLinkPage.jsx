import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreContext } from "../../contextApi/ContextApi";
import { Sparkles, Copy, Check, QrCode } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/api";

const CreateLinkPage = () => {
  const { token } = useStoreContext();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);

  // Form states
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [title, setTitle] = useState(""); // captured optionally
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [generateQr, setGenerateQr] = useState(true);

  // Slug availability check states
  const [slugStatus, setSlugStatus] = useState(null); // 'available' | 'taken' | null
  const [slugLoading, setSlugLoading] = useState(false);

  // Success result states
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Debounced custom alias checker
  useEffect(() => {
    if (!customAlias || customAlias.trim().length < 3) {
      setSlugStatus(null);
      return;
    }
    setSlugLoading(true);
    const handler = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/urls/check-slug?slug=${customAlias.trim()}`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        setSlugStatus(data.exists ? "taken" : "available");
      } catch (err) {
        setSlugStatus(null);
      } finally {
        setSlugLoading(false);
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [customAlias, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl.trim()) {
      toast.error("Long URL is required");
      return;
    }

    if (slugStatus === "taken") {
      toast.error("Custom slug is already taken");
      return;
    }

    setLoader(true);
    setSuccessData(null);
    setCopied(false);

    try {
      // Build request payload matching AdvancedShortenRequest
      const payload = {
        originalUrl: originalUrl.trim(),
        customAlias: customAlias.trim() || null,
        password: password.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString().split(".")[0] : null, // format ISO Local DateTime
        generateQrCode: generateQr,
      };

      const { data } = await api.post("/api/urls/shorten/advanced", payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      });

      // Backend returns either the direct DTO or a map containing "url" (DTO) and "qrCodePngBase64"
      const urlMapping = data.url || data;
      const qrCode = data.qrCodePngBase64 || null;

      const fullShortUrl = `${import.meta.env.VITE_REACT_FRONT_END_URL}/s/${urlMapping.shortUrl}`;

      setSuccessData({
        shortUrl: urlMapping.shortUrl,
        fullShortUrl,
        qrCode,
      });

      toast.success("Short URL forged successfully!");
      
      // Reset form
      setOriginalUrl("");
      setCustomAlias("");
      setTitle("");
      setPassword("");
      setExpiresAt("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to forge link");
    } finally {
      setLoader(false);
    }
  };

  const copyResult = () => {
    if (!successData) return;
    navigator.clipboard.writeText(successData.fullShortUrl);
    setCopied(true);
    toast.success("Short URL copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[640px] mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-[28px] font-display font-bold text-white tracking-tight">
          Create a new link
        </h2>
        <p className="text-[14px] text-[#A0A0A0]">
          Configure your redirect destination and custom slug details below
        </p>
      </div>

      <div className="bg-[#0F0F0F] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 md:p-10 flex flex-col gap-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination URL */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
              Long URL
            </label>
            <input
              type="url"
              required
              placeholder="https://your-long-url.com/some/deep/path"
              className="input"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
          </div>

          {/* Custom Slug */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
                Custom Slug (Optional)
              </label>
              <div className="flex items-center gap-1.5 text-[12px]">
                {slugLoading && <span className="text-[#525252]">Checking...</span>}
                {!slugLoading && slugStatus === "available" && (
                  <span className="text-[#4DFFB4] font-semibold">✓ Available</span>
                )}
                {!slugLoading && slugStatus === "taken" && (
                  <span className="text-[#FF4D4D] font-semibold">✗ Taken</span>
                )}
              </div>
            </div>
            <div className="flex rounded-[10px] overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[#141414] focus-within:border-[rgba(77,255,180,0.5)] focus-within:shadow-[0_0_0_3px_rgba(77,255,180,0.08)] transition-all duration-200">
              <span className="px-4 py-3 bg-[#080808] border-r border-[rgba(255,255,255,0.08)] font-mono text-[13px] text-[#525252] flex items-center select-none">
                lnkfg.io/
              </span>
              <input
                type="text"
                placeholder="my-custom-slug"
                className="flex-1 bg-transparent px-4 py-3 text-[15px] font-mono text-[#4DFFB4] outline-none"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/\s+/g, ""))}
              />
            </div>
          </div>

          {/* Link Title */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
              Link Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Summer Marketing Campaign"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Advanced options grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
                Password Protection (Optional)
              </label>
              <input
                type="password"
                placeholder="Optional password override"
                className="input py-2.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Expiration */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                className="input py-2.5 text-[#A0A0A0]"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          {/* QR Option */}
          <div className="flex items-center gap-2.5 pt-4">
            <input
              id="generateQr"
              type="checkbox"
              className="accent-[#4DFFB4] w-4 h-4 cursor-pointer"
              checked={generateQr}
              onChange={(e) => setGenerateQr(e.target.checked)}
            />
            <label htmlFor="generateQr" className="text-[13px] text-[#A0A0A0] cursor-pointer select-none">
              Generate dynamic QR code for this link
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loader}
            className="btn-primary w-full py-3.5 mt-6 font-bold uppercase tracking-[0.08em]"
          >
            {loader ? "Forging Link..." : "Forge Link ⚡"}
          </button>
        </form>

        {/* Success Inline Card */}
        {successData && (
          <div className="mt-4 p-6 bg-[#141414] border border-[rgba(77,255,180,0.25)] rounded-[12px] flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold tracking-[0.12em] text-[#4DFFB4] uppercase">
                Success! Link is forged
              </span>
              <div className="flex items-center justify-between gap-4 bg-[#080808] border border-[rgba(255,255,255,0.06)] rounded-lg p-3 mt-2">
                <span className="font-mono text-[14px] text-[#4DFFB4] truncate">
                  {successData.fullShortUrl}
                </span>
                <button
                  type="button"
                  onClick={copyResult}
                  className="btn-primary py-2 px-4 text-[12px] shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Base64 QR Code */}
            {successData.qrCode && (
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                <div className="p-3 bg-white rounded-lg shrink-0">
                  <img
                    src={`data:image/png;base64,${successData.qrCode}`}
                    alt="QR Code"
                    className="w-24 h-24"
                  />
                </div>
                <div className="flex flex-col gap-1 text-center sm:text-left">
                  <span className="text-[14px] font-semibold text-white">Dynamic QR Code</span>
                  <p className="text-[12px] text-[#A0A0A0]">
                    Scan to instantly redirect to your destination. High-res copy generated.
                  </p>
                  <a
                    href={`data:image/png;base64,${successData.qrCode}`}
                    download={`lynkforge-${successData.shortUrl}-qr.png`}
                    className="text-[12px] text-[#4DFFB4] hover:underline self-center sm:self-start mt-1.5 flex items-center gap-1 font-semibold"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Download QR Code
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateLinkPage;
