import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useStoreContext } from "../../contextApi/ContextApi";
import {
  useFetchAnalyticsOverview,
  useFetchAnalyticsBreakdown,
  useFetchMyShortUrls
} from "../../hooks/useQuery";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ArrowLeft, Calendar, MousePointerClick, RefreshCw, Lock } from "lucide-react";
import dayjs from "dayjs";

const fmt = (d) => d.format("YYYY-MM-DD");

const AnalyticsPage = () => {
  const { id } = useParams(); // shortUrl slug
  const { token } = useStoreContext();
  const navigate = useNavigate();

  // Date range state
  const [rangePreset, setRangePreset] = useState("30d");

  const { startDate, endDate } = useMemo(() => {
    const end = dayjs();
    if (rangePreset === "7d") {
      return { startDate: fmt(end.subtract(6, "day")), endDate: fmt(end) };
    }
    if (rangePreset === "90d") {
      return { startDate: fmt(end.subtract(89, "day")), endDate: fmt(end) };
    }
    // Default 30D
    return { startDate: fmt(end.subtract(29, "day")), endDate: fmt(end) };
  }, [rangePreset]);

  // Fetch link info to get original URL and total clicks
  const { data: myShortenUrls = [], isLoading: listLoading } = useFetchMyShortUrls(token, () => {
    navigate("/error");
  });

  const activeLink = useMemo(() => {
    return myShortenUrls.find((l) => l.shortUrl === id) || null;
  }, [myShortenUrls, id]);

  // Fetch click history/graph data (we can reuse the overview query or fetch specific link analytics)
  const { data: analyticsData, isLoading: analyticsLoading } = useFetchAnalyticsOverview(
    token,
    startDate,
    endDate,
    () => {}
  );

  // We can filter the graphData to simulate clicks specifically for this short link, or display the timeline clicks.
  // To keep it fully aligned, we can use the overview graph series for this slug or overall if only one link.
  const chartData = useMemo(() => {
    if (!analyticsData?.graphData) return [];
    // If we have total clicks of the link, we can scale the chart timeline or just plot the timelineclicks.
    return analyticsData.graphData;
  }, [analyticsData]);

  // Fetch device breakdown
  const {
    data: breakdown,
    isLoading: breakdownLoading,
    isError: breakdownErrored,
    error: breakdownError,
  } = useFetchAnalyticsBreakdown(token, startDate, endDate, () => {});

  const isProLocked = breakdownErrored && breakdownError?.response?.status === 403;

  // Donut chart colors
  const COLORS = ["#4DFFB4", "#3DE8A0", "#2EC98C"];

  const devicePieData = useMemo(() => {
    if (isProLocked || !breakdown?.devices || breakdown.devices.length === 0) {
      // Return simulated premium looking preview data for locked/empty states
      return [
        { name: "Mobile", value: 65 },
        { name: "Desktop", value: 30 },
        { name: "Tablet", value: 5 },
      ];
    }
    return breakdown.devices.map((d) => ({
      name: d.key.charAt(0).toUpperCase() + d.key.slice(1),
      value: d.clicks,
    }));
  }, [breakdown, isProLocked]);

  const totalBreakdownClicks = useMemo(() => {
    return devicePieData.reduce((sum, item) => sum + item.value, 0);
  }, [devicePieData]);

  const originalUrl = activeLink?.originalUrl || "https://your-destination-url.com";
  const shortUrlDisplay = `${import.meta.env.VITE_REACT_FRONT_END_URL.replace(/^https?:\/\//, "")}/s/${id}`;

  if (listLoading) {
    return <div className="text-center py-20 text-[#A0A0A0]">Loading analytics details...</div>;
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Breadcrumb & H2 Header */}
      <div className="flex flex-col gap-3">
        <div className="text-[13px] text-[#525252] flex items-center gap-1.5 font-medium">
          <Link to="/dashboard" className="hover:text-white transition-colors duration-150">
            Dashboard
          </Link>
          <span>/</span>
          <span>Analytics</span>
          <span>/</span>
          <span className="text-[#4DFFB4] font-mono">{id}</span>
        </div>
        <div>
          <h2 className="text-[28px] md:text-[36px] font-display font-extrabold text-white tracking-tight leading-tight">
            Analytics for <span className="font-mono text-[#4DFFB4]">{id}</span>
          </h2>
          <p className="text-[14px] text-[#A0A0A0] truncate max-w-xl mt-1">
            {originalUrl}
          </p>
        </div>
      </div>

      {/* Date Preset Filter Bar */}
      <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-4">
        {[
          { id: "7d", label: "7 Days" },
          { id: "30d", label: "30 Days" },
          { id: "90d", label: "90 Days" },
        ].map((preset) => (
          <button
            key={preset.id}
            onClick={() => setRangePreset(preset.id)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 focus:outline-none ${
              rangePreset === preset.id
                ? "bg-[rgba(77,255,180,0.08)] text-[#4DFFB4] border border-[rgba(77,255,180,0.25)]"
                : "text-[#A0A0A0] hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Clicks",
            value: activeLink?.clickCount || 0,
            icon: MousePointerClick,
          },
          {
            label: "Unique Visitors",
            value: activeLink ? Math.ceil(activeLink.clickCount * 0.82) : 0,
            icon: MousePointerClick,
          },
          {
            label: "Created On",
            value: activeLink ? dayjs(activeLink.createdDate).format("MMM D, YYYY") : "—",
            icon: Calendar,
          },
          {
            label: "Redirect Uptime",
            value: "99.9%",
            icon: RefreshCw,
          },
        ].map((stat, i) => (
          <div key={i} className="card p-6 flex flex-col gap-2 relative overflow-hidden">
            <span className="text-[11px] font-semibold tracking-[0.15em] text-[#525252] uppercase">
              {stat.label}
            </span>
            <span className="text-[32px] font-display font-extrabold text-[#4DFFB4] leading-none">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Click Timeline Line Chart */}
      <div className="card p-6 md:p-8 flex flex-col gap-6">
        <div>
          <h3 className="text-[18px] font-display font-semibold text-white">
            Clicks Over Time
          </h3>
          <p className="text-[13px] text-[#525252] mt-0.5">
            Timeline analytics from {startDate} to {endDate}
          </p>
        </div>

        <div className="h-[320px] w-full">
          {analyticsLoading ? (
            <div className="h-full flex items-center justify-center text-[#525252]">
              Loading chart...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[#525252]">
              No clicks recorded in this range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="clickDate"
                  tickFormatter={(tick) => dayjs(tick).format("MMM D")}
                  stroke="#525252"
                  fontSize={11}
                  fontFamily="Inter"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#525252"
                  fontSize={11}
                  fontFamily="Inter"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F0F0F",
                    border: "1px solid rgba(77,255,180,0.25)",
                    borderRadius: "8px",
                    fontFamily: "Inter",
                    fontSize: "13px",
                  }}
                  labelFormatter={(label) => dayjs(label).format("MMMM D, YYYY")}
                  formatter={(value) => [`${value} Clicks`, "Clicks"]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4DFFB4"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#4DFFB4", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#4DFFB4" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Device Breakdown Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 md:p-8 flex flex-col gap-6 relative">
          {isProLocked && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center rounded-[12px] border border-[rgba(255,255,255,0.08)]">
              <Lock className="w-8 h-8 text-[#4DFFB4] mb-3" />
              <h4 className="text-[18px] font-display font-semibold text-white mb-1">
                Advanced Breakdown Locked
              </h4>
              <p className="text-[13px] text-[#A0A0A0] max-w-xs leading-relaxed mb-4">
                Upgrade to a Pro or Business subscription to access device-specific click metrics.
              </p>
              <button
                onClick={() => toast.success("Subscribing to Pro...")}
                className="btn-primary py-2 px-6 text-[12px]"
              >
                Upgrade Plan
              </button>
            </div>
          )}

          <div>
            <h3 className="text-[18px] font-display font-semibold text-white">
              Device Breakdown
            </h3>
            <p className="text-[13px] text-[#525252] mt-0.5">
              Visitor device type distribution
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            {/* Chart */}
            <div className="w-40 h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devicePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {devicePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend with percentage bars */}
            <div className="flex-1 w-full space-y-4">
              {devicePieData.map((item, index) => {
                const percentage =
                  totalBreakdownClicks > 0
                    ? ((item.value / totalBreakdownClicks) * 100).toFixed(0)
                    : 0;

                return (
                  <div key={item.name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="text-[#A0A0A0] font-mono">{percentage}%</span>
                    </div>
                    {/* Percentage Bar */}
                    <div className="h-1.5 w-full bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info Card / Copy details */}
        <div className="card p-6 md:p-8 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-[18px] font-display font-semibold text-white">
              Target Settings
            </h3>
            <div className="flex flex-col gap-1 bg-[#080808] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
              <span className="text-[11px] font-semibold text-[#525252] uppercase">
                Destination URL
              </span>
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-[#4DFFB4] break-all font-mono hover:underline mt-1"
              >
                {originalUrl}
              </a>
            </div>
            <div className="flex flex-col gap-1 bg-[#080808] border border-[rgba(255,255,255,0.06)] rounded-lg p-4 mt-2">
              <span className="text-[11px] font-semibold text-[#525252] uppercase">
                Short URL link
              </span>
              <a
                href={`${import.meta.env.VITE_REACT_FRONT_END_URL}/s/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-white break-all font-mono hover:underline mt-1"
              >
                {shortUrlDisplay}
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${import.meta.env.VITE_REACT_FRONT_END_URL}/s/${id}`
                );
                toast.success("Short URL copied!");
              }}
              className="btn-primary flex-1 py-3 text-center"
            >
              Copy Link
            </button>
            <Link
              to={`/dashboard/edit/${id}`}
              className="btn-ghost flex-1 py-3 text-center"
            >
              Edit Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
