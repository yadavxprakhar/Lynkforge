import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFetchMyShortUrls } from "../../hooks/useQuery";
import { useStoreContext } from "../../contextApi/ContextApi";
import { Copy, Check, BarChart2, Edit2, Trash2, Link as LinkIcon, Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/api";

const DashboardHome = () => {
  const { token } = useStoreContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedSlug, setCopiedSlug] = useState("");
  const [deleteModalSlug, setDeleteModalSlug] = useState("");

  const { isLoading, data: myShortenUrls = [], refetch } = useFetchMyShortUrls(token, () => {
    navigate("/error");
  });

  // KPI Calculations
  const totalLinks = myShortenUrls.length;
  const totalClicks = myShortenUrls.reduce((sum, link) => sum + (link.clickCount || 0), 0);
  
  // Calculate Links this month (created in current month/year)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const linksThisMonth = myShortenUrls.filter((link) => {
    const d = new Date(link.createdDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const avgClicks = totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : "0.0";

  // Filter links based on search query
  const filteredUrls = myShortenUrls.filter((link) => {
    const query = searchQuery.toLowerCase();
    return (
      link.shortUrl.toLowerCase().includes(query) ||
      (link.originalUrl && link.originalUrl.toLowerCase().includes(query))
    );
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredUrls.length / itemsPerPage);
  const paginatedUrls = filteredUrls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCopy = (shortUrl) => {
    const fullUrl = `${import.meta.env.VITE_REACT_FRONT_END_URL}/s/${shortUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(shortUrl);
    toast.success("Short URL copied!");
    setTimeout(() => setCopiedSlug(""), 2000);
  };

  const handleDelete = async () => {
    if (!deleteModalSlug) return;
    const loadingToast = toast.loading("Deleting link...");
    try {
      await api.delete(`/api/urls/${encodeURIComponent(deleteModalSlug)}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      });
      toast.success("Link deleted successfully", { id: loadingToast });
      setDeleteModalSlug("");
      refetch();
    } catch (err) {
      toast.error("Failed to delete link", { id: loadingToast });
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-display font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-[14px] text-[#A0A0A0]">
            Track link performance and manage aliases
          </p>
        </div>
        <Link
          to="/dashboard/create"
          className="btn-primary px-6 py-3 bg-[#4DFFB4] text-[#080808] hover:bg-[#3DE8A0] font-bold"
        >
          Create Link
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Links", value: totalLinks },
          { label: "Total Clicks", value: totalClicks },
          { label: "Links This Month", value: linksThisMonth },
          { label: "Avg Clicks / Link", value: avgClicks },
        ].map((stat, i) => (
          <div key={i} className="card p-6 flex flex-col gap-1">
            <span className="text-[12px] font-semibold tracking-[0.12em] text-[#525252] uppercase">
              {stat.label}
            </span>
            <span className="text-[40px] font-display font-extrabold text-[#4DFFB4] leading-none">
              {isLoading ? "..." : stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Main Table section */}
      <div className="flex flex-col gap-6 mt-4">
        {/* Search bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="input pl-11"
          />
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-[#A0A0A0]">Loading your links...</div>
        ) : filteredUrls.length === 0 ? (
          <div className="card p-20 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(77,255,180,0.08)] flex items-center justify-center text-[#4DFFB4]">
              <LinkIcon className="w-6 h-6" />
            </div>
            <h3 className="text-[18px] font-display font-semibold text-white">
              No links found
            </h3>
            <p className="text-[14px] text-[#525252] max-w-xs">
              {searchQuery ? "No links match your search." : "Create your first short link to get started."}
            </p>
            {!searchQuery && (
              <Link to="/dashboard/create" className="btn-primary mt-2">
                Create First Link
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.05)]">
                    <th className="pb-4 text-[11px] font-semibold tracking-[0.12em] text-[#525252] uppercase">
                      Original URL
                    </th>
                    <th className="pb-4 text-[11px] font-semibold tracking-[0.12em] text-[#525252] uppercase">
                      Short Link
                    </th>
                    <th className="pb-4 text-[11px] font-semibold tracking-[0.12em] text-[#525252] uppercase text-center">
                      Clicks
                    </th>
                    <th className="pb-4 text-[11px] font-semibold tracking-[0.12em] text-[#525252] uppercase">
                      Created
                    </th>
                    <th className="pb-4 text-[11px] font-semibold tracking-[0.12em] text-[#525252] uppercase text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUrls.map((link) => {
                    const formattedDate = new Date(link.createdDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const shortUrlDisplay = `${import.meta.env.VITE_REACT_FRONT_END_URL.replace(/^https?:\/\//, "")}/s/${link.shortUrl}`;

                    return (
                      <tr
                        key={link.id}
                        className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-150"
                      >
                        {/* Original URL */}
                        <td className="py-4 pr-4 max-w-[240px] truncate text-[14px] text-white">
                          <a
                            href={link.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {link.originalUrl}
                          </a>
                        </td>
                        {/* Short Link */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[13px] text-[#4DFFB4]">
                              {shortUrlDisplay}
                            </span>
                            <button
                              onClick={() => handleCopy(link.shortUrl)}
                              className="p-1 text-[#525252] hover:text-[#4DFFB4] transition-colors duration-150 focus:outline-none"
                              title="Copy URL"
                            >
                              {copiedSlug === link.shortUrl ? (
                                <Check className="w-4 h-4 text-[#4DFFB4]" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        {/* Clicks */}
                        <td className="py-4 px-4 text-center font-semibold text-[14px] text-[#4DFFB4]">
                          {link.clickCount || 0}
                        </td>
                        {/* Created Date */}
                        <td className="py-4 text-[14px] text-[#A0A0A0]">
                          {formattedDate}
                        </td>
                        {/* Actions */}
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/dashboard/analytics/${link.shortUrl}`}
                              className="p-2 text-[#525252] hover:text-white hover:bg-[rgba(255,255,255,0.04)] rounded-lg transition-colors duration-150"
                              title="Analytics"
                            >
                              <BarChart2 className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/dashboard/edit/${link.shortUrl}`}
                              className="p-2 text-[#525252] hover:text-white hover:bg-[rgba(255,255,255,0.04)] rounded-lg transition-colors duration-150"
                              title="Edit Link"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteModalSlug(link.shortUrl)}
                              className="p-2 text-[#525252] hover:text-[#FF4D4D] hover:bg-red-500/10 rounded-lg transition-colors duration-150 focus:outline-none"
                              title="Delete Link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-[13px] text-[#525252]">
                  Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredUrls.length)} of{" "}
                  {filteredUrls.length} links
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="p-2 border border-[rgba(255,255,255,0.08)] rounded-lg text-[#A0A0A0] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[13px] text-white px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="p-2 border border-[rgba(255,255,255,0.08)] rounded-lg text-[#A0A0A0] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-[400px] bg-[#0F0F0F] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-[18px] font-display font-semibold text-white">
                Delete Link permanently?
              </h3>
              <p className="text-[14px] text-[#A0A0A0] leading-relaxed">
                This will permanently remove the short URL and all its associated click analytics history. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModalSlug("")}
                className="btn-ghost flex-1 py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger flex-1 py-3"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
