"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2, TrendingUp } from "lucide-react";
import {
  analyticsService,
  type AnalyticsOverview,
} from "@/services/admin-tools-service";

/**
 * Dashboard charts, drawn as inline SVG — no chart library, so nothing extra
 * ships to the browser for four small plots.
 *
 * Series colours come from a validated categorical palette (blue / orange).
 * They are assigned per entity and never cycled, so changing the range never
 * repaints a series.
 */
const SERIES = {
  leads: { light: "#2a78d6", dark: "#3987e5", label: "Leads" },
  signups: { light: "#eb6834", dark: "#d95926", label: "Signups" },
};

const STATUS_ORDER = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"] as const;

const RANGES = [7, 30, 90];

export function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    analyticsService
      .overview(days)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (!data) return null;

  const leadStatusTotals = STATUS_ORDER.map((status) => ({
    status,
    count:
      (data.leadStatus.contact[status] ?? 0) +
      (data.leadStatus.counselor[status] ?? 0),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <TrendingUp className="h-4 w-4 text-primary" />
          Performance
        </h2>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          {RANGES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setDays(option);
                setIsLoading(true);
              }}
              className={`rounded px-2.5 py-1 text-[11px] font-bold transition-colors ${
                option === days
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {option}d
            </button>
          ))}
        </div>
      </div>

      {/* Hero number: the one figure that says whether the pipeline is working. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Conversion rate"
          value={`${data.totals.conversionRate}%`}
          hint="of all leads ever"
          emphasis
        />
        <StatTile
          label="Contact leads"
          value={String(data.totals.contactLeads)}
          hint="all time"
        />
        <StatTile
          label="Counselor leads"
          value={String(data.totals.counselorLeads)}
          hint="all time"
        />
        <StatTile
          label="Website users"
          value={String(data.totals.users)}
          hint={`${data.signupMethods.phone} phone · ${data.signupMethods.google} Google · ${data.signupMethods.email} email`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title={`Leads & signups · last ${days} days`}>
          <LineChart
            series={[
              { key: "leads", points: data.leadsPerDay, ...SERIES.leads },
              { key: "signups", points: data.signupsPerDay, ...SERIES.signups },
            ]}
          />
        </Card>

        <Card title="Lead pipeline">
          <BarList
            items={leadStatusTotals.map((row) => ({
              label: row.status,
              value: row.count,
            }))}
            emptyLabel="No leads yet."
          />
        </Card>
      </div>

      <Card title="Most saved colleges">
        <BarList
          items={data.topSavedColleges.map((c) => ({
            label: c.name,
            value: c.saves,
          }))}
          emptyLabel="No colleges saved yet — students save colleges from the public site."
        />
      </Card>
    </div>
  );
}

/* ─── Pieces ───────────────────────────────────────────────────────────────── */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        emphasis ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-foreground">{value}</p>
      {hint && (
        <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

type Series = {
  key: string;
  label: string;
  light: string;
  dark: string;
  points: { date: string; count: number }[];
};

function LineChart({ series }: { series: Series[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const width = 560;
  const height = 160;
  const padding = { top: 12, right: 12, bottom: 22, left: 28 };

  const length = Math.max(...series.map((s) => s.points.length), 1);
  // A flat-zero series would divide by zero; 1 keeps the baseline on the floor.
  const max = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.count)));

  const x = (i: number) =>
    padding.left +
    (i * (width - padding.left - padding.right)) / Math.max(length - 1, 1);
  const y = (value: number) =>
    height -
    padding.bottom -
    (value / max) * (height - padding.top - padding.bottom);

  const labels = series[0]?.points ?? [];

  const path = (points: { count: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.count)}`).join(" ");

  const isEmpty = series.every((s) => s.points.every((p) => p.count === 0));

  return (
    <div className="space-y-2">
      {/* Legend is always present for 2+ series, so identity is never colour-alone. */}
      <div className="flex items-center gap-4">
        {series.map((s) => (
          <span
            key={s.key}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: s.light }}
            />
            {s.label}
            <span className="text-foreground">
              {s.points.reduce((sum, p) => sum + p.count, 0)}
            </span>
          </span>
        ))}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label={`${series.map((s) => s.label).join(" and ")} per day`}
          onMouseLeave={() => setHover(null)}
        >
          {/* Recessive gridlines. */}
          {[0, 0.5, 1].map((fraction) => (
            <line
              key={fraction}
              x1={padding.left}
              x2={width - padding.right}
              y1={y(max * fraction)}
              y2={y(max * fraction)}
              className="stroke-border"
              strokeWidth={1}
            />
          ))}
          <text
            x={4}
            y={y(max) + 4}
            className="fill-muted-foreground text-[9px]"
          >
            {max}
          </text>
          <text x={4} y={y(0) + 4} className="fill-muted-foreground text-[9px]">
            0
          </text>

          {series.map((s) => (
            <path
              key={s.key}
              d={path(s.points)}
              fill="none"
              stroke={s.light}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Crosshair + invisible hit targets wider than the marks. */}
          {hover !== null && (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padding.top}
              y2={height - padding.bottom}
              className="stroke-muted-foreground"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
          {hover !== null &&
            series.map((s) => (
              <circle
                key={s.key}
                cx={x(hover)}
                cy={y(s.points[hover]?.count ?? 0)}
                r={4}
                fill={s.light}
                className="stroke-card"
                strokeWidth={2}
              />
            ))}
          {labels.map((_, i) => (
            <rect
              key={i}
              x={x(i) - 6}
              y={0}
              width={12}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}

          {labels.length > 0 && (
            <>
              <text
                x={padding.left}
                y={height - 6}
                className="fill-muted-foreground text-[9px]"
              >
                {format(new Date(labels[0].date), "dd MMM")}
              </text>
              <text
                x={width - padding.right}
                y={height - 6}
                textAnchor="end"
                className="fill-muted-foreground text-[9px]"
              >
                {format(new Date(labels[labels.length - 1].date), "dd MMM")}
              </text>
            </>
          )}
        </svg>

        {hover !== null && labels[hover] && (
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] shadow-lg">
            <p className="font-bold text-foreground">
              {format(new Date(labels[hover].date), "dd MMM yyyy")}
            </p>
            {series.map((s) => (
              <p key={s.key} className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: s.light }}
                />
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-bold text-foreground">
                  {s.points[hover]?.count ?? 0}
                </span>
              </p>
            ))}
          </div>
        )}

        {isEmpty && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            No activity in this range.
          </p>
        )}
      </div>
    </div>
  );
}

function BarList({
  items,
  emptyLabel,
}: {
  items: { label: string; value: number }[];
  emptyLabel: string;
}) {
  const max = useMemo(
    () => Math.max(1, ...items.map((i) => i.value)),
    [items],
  );

  if (items.length === 0 || items.every((i) => i.value === 0)) {
    return <p className="py-6 text-center text-xs text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-[11px] font-semibold text-muted-foreground">
            {item.label}
          </span>
          <div className="h-4 flex-1 overflow-hidden rounded bg-muted/40">
            <div
              className="h-full rounded"
              style={{
                width: `${Math.max((item.value / max) * 100, item.value > 0 ? 3 : 0)}%`,
                background: SERIES.leads.light,
              }}
            />
          </div>
          {/* Values are always labelled, so the bar colour never carries meaning alone. */}
          <span className="w-8 shrink-0 text-right text-[12px] font-bold text-foreground">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
