import { useQuery } from "react-query"
import api from "../api/api"

const authHeaders = (token) => ({
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
    },
});

export const useFetchMyShortUrls = (token, onError) => {
    return useQuery("my-shortenurls",
         async () => {
            return await api.get(
                "/api/urls/myurls",
            authHeaders(token)
        );
    },
          {
            select: (res) => {
                const rows = Array.isArray(res?.data) ? [...res.data] : [];
                rows.sort(
                    (a, b) =>
                        new Date(b.createdDate) - new Date(a.createdDate)
                );
                return rows;
            },
            onError,
            staleTime: 5000
          }
        );
};

export const useFetchAnalyticsOverview = (token, startDate, endDate, onError) => {
    return useQuery(
        ["analytics-overview", startDate, endDate],
        async () => {
            return await api.get(
                `/api/analytics/overview?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`,
                authHeaders(token)
            );
        },
        {
            select: (res) => {
                const payload = res?.data ?? {};
                const series = Array.isArray(payload.series) ? payload.series : [];
                const graphData = series.map((row) => ({
                    clickDate: row.date,
                    count: row.clicks,
                }));
                return {
                    graphData,
                    kpis: {
                        totalClicks: payload.totalClicks ?? 0,
                        clicksToday: payload.clicksToday ?? 0,
                        activeLinks: payload.activeLinks ?? 0,
                        topLink: payload.topLink ?? null,
                        previousTotalClicks: payload.previousTotalClicks ?? null,
                        percentChange: payload.percentChange ?? null,
                    },
                };
            },
            enabled: Boolean(token && startDate && endDate),
            onError,
            staleTime: 5000
        }
    );
};

export const fetchLinkAnalytics = async (token, shortUrl, startDate, endDate) => {
    const { data } = await api.get(
        `/api/analytics/links/${encodeURIComponent(shortUrl)}?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`,
        authHeaders(token)
    );
    const series = Array.isArray(data?.series) ? data.series : [];
    return series.map((row) => ({ clickDate: row.date, count: row.clicks }));
};

export const useFetchAnalyticsBreakdown = (token, startDate, endDate, onError) => {
    return useQuery(
        ["analytics-breakdown", startDate, endDate],
        async () => {
            return await api.get(
                `/api/analytics/breakdown?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`,
                authHeaders(token)
            );
        },
        {
            select: (res) => {
                const payload = res?.data ?? {};
                return {
                    topReferrers: Array.isArray(payload.topReferrers) ? payload.topReferrers : [],
                    devices: Array.isArray(payload.devices) ? payload.devices : [],
                };
            },
            enabled: Boolean(token && startDate && endDate),
            /** Starter plan receives 403 by design — do not funnel that to a global error page. */
            retry: (failureCount, error) =>
                failureCount < 3 && error?.response?.status !== 403,
            onError:
                typeof onError === "function"
                    ? (err) => {
                          if (err?.response?.status === 403) return;
                          onError(err);
                      }
                    : undefined,
            staleTime: 5000
        }
    );
};

export const downloadAnalyticsCsv = async (token, startDate, endDate) => {
    const res = await api.get(
        `/api/analytics/export.csv?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`,
        {
            ...authHeaders(token),
            responseType: "blob",
        }
    );
    return res?.data;
};