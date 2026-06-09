import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetchMyShortUrls } from "../../hooks/useQuery";
import { useStoreContext } from "../../contextApi/ContextApi";
import toast from "react-hot-toast";
import api from "../../api/api";

const EditLinkPage = () => {
  const { id } = useParams(); // shortUrl parameter
  const { token } = useStoreContext();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);

  // Form states
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const { data: myShortenUrls = [], isLoading } = useFetchMyShortUrls(token, () => {
    navigate("/error");
  });

  // Pre-fill form when link is found in list
  useEffect(() => {
    if (!isLoading && myShortenUrls.length > 0) {
      const link = myShortenUrls.find((l) => l.shortUrl === id);
      if (link) {
        setOriginalUrl(link.originalUrl);
        setCustomAlias(link.shortUrl);
        // Expiry or password are not returned in the basic DTO, so we keep them empty unless changed
      } else {
        toast.error("Link not found");
        navigate("/dashboard");
      }
    }
  }, [id, myShortenUrls, isLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl.trim()) {
      toast.error("Long URL is required");
      return;
    }

    setLoader(true);
    try {
      const payload = {
        originalUrl: originalUrl.trim(),
        customAlias: customAlias.trim() || null,
        password: password.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString().split(".")[0] : null,
      };

      await api.put(`/api/urls/${encodeURIComponent(id)}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      });

      toast.success("Link updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update link");
    } finally {
      setLoader(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-[#A0A0A0]">Loading link settings...</div>;
  }

  return (
    <div className="w-full max-w-[640px] mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-[28px] font-display font-bold text-white tracking-tight">
          Edit Link settings
        </h2>
        <p className="text-[14px] text-[#A0A0A0]">
          Modify the destination URL, custom slug alias, or security parameters
        </p>
      </div>

      <div className="bg-[#0F0F0F] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination URL */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
              Long URL (Destination)
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
            <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
              Custom Slug / Alias
            </label>
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

          {/* Advanced options grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
                New Password (Optional)
              </label>
              <input
                type="password"
                placeholder="Set new password"
                className="input py-2.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Expiration */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
                New Expiration Date
              </label>
              <input
                type="datetime-local"
                className="input py-2.5 text-[#A0A0A0]"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="btn-ghost flex-1 py-3.5 uppercase tracking-[0.08em]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loader}
              className="btn-primary flex-1 py-3.5 bg-[#4DFFB4] text-[#080808] hover:bg-[#3DE8A0] font-bold uppercase tracking-[0.08em]"
            >
              {loader ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLinkPage;
