import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Filler,
} from "chart.js";
import { useStoreContext } from "../../contextApi/ContextApi";
import dayjs from "dayjs";

ChartJS.register(
  BarElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  Legend,
  Filler
);

const GRAPH_FONT =
  "'Inter','system-ui','-apple-system','Segoe UI',sans-serif";

const Graph = ({ graphData: graphDataProp }) => {
  const { t, i18n } = useTranslation();
  const { theme } = useStoreContext();
  const isDark = theme === "dark";
  const graphData = Array.isArray(graphDataProp) ? graphDataProp : [];

  const labels = useMemo(() => graphData.map((item) => `${item.clickDate}`), [graphData]);
  const userPerDaya = useMemo(() => graphData.map((item) => item.count), [graphData]);
  const maxXTicks = graphData.length > 75 ? 9 : graphData.length > 45 ? 11 : 13;

  const tickColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark
    ? "rgba(148, 163, 184, 0.12)"
    : "rgba(15, 23, 42, 0.06)";
  const titleColor = isDark ? "#e2e8f0" : "#475569";

  const data = useMemo(
    () => ({
      labels: graphData.length > 0 ? labels : ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      datasets: [
        {
          label: t("chart.datasetLabel"),
          data: graphData.length > 0 ? userPerDaya : [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1],
          backgroundColor:
            graphData.length > 0
              ? isDark
                ? "#60a5fa"
                : "#2563eb"
              : isDark
                ? "rgba(96, 165, 250, 0.12)"
                : "rgba(37, 99, 235, 0.08)",
          borderRadius: 6,
          borderSkipped: false,
          borderColor: "transparent",
          fill: true,
          tension: 0.4,
          barThickness: 20,
          categoryPercentage: 1.5,
          barPercentage: 1.5,
        },
      ],
    }),
    [graphData.length, labels, userPerDaya, isDark, t, i18n.language]
  );

  const options = useMemo(
    () => ({
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: titleColor,
            font: { family: GRAPH_FONT, size: 12, weight: "600" },
          },
        },
        tooltip: {
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          titleColor: isDark ? "#e2e8f0" : "#0f172a",
          bodyColor: isDark ? "#94a3b8" : "#475569",
          borderColor: isDark ? "#334155" : "#e2e8f0",
          borderWidth: 1,
          padding: 10,
          titleFont: { family: GRAPH_FONT },
          bodyFont: { family: GRAPH_FONT },
          callbacks: {
            title: (items) => {
              const raw = items?.[0]?.label;
              return raw ? dayjs(raw).format("MMM D, YYYY") : "";
            },
            label: (item) =>
              t("chart.tooltipClicks", { value: item.parsed?.y ?? 0 }),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: tickColor,
            font: { family: GRAPH_FONT },
            callback: function (value) {
              if (Number.isInteger(value)) {
                return value.toString();
              }
              return "";
            },
          },
          grid: {
            color: gridColor,
          },
          title: {
            display: true,
            text: t("chart.yTitle"),
            color: titleColor,
            font: {
              family: GRAPH_FONT,
              size: 13,
              weight: "600",
            },
          },
        },
        x: {
          beginAtZero: true,
          ticks: {
            color: tickColor,
            font: { family: GRAPH_FONT, size: 11 },
            autoSkip: true,
            maxTicksLimit: maxXTicks,
            callback: function (value, _index) {
              const raw = this.getLabelForValue(value);
              if (!raw) return "";
              // show compact labels when range is long
              return graphData.length > 45
                ? dayjs(raw).format("MMM D")
                : dayjs(raw).format("MMM D");
            },
          },
          grid: {
            color: gridColor,
          },
          title: {
            display: true,
            text: t("chart.xTitle"),
            color: titleColor,
            font: {
              family: GRAPH_FONT,
              size: 13,
              weight: "600",
            },
          },
        },
      },
    }),
    [
      tickColor,
      gridColor,
      titleColor,
      isDark,
      maxXTicks,
      graphData.length,
      t,
      i18n.language,
    ]
  );

  return <Bar className="h-full min-h-[280px] w-full" data={data} options={options} />;
};

export default Graph;
