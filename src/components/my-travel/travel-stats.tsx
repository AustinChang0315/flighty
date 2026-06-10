import type { TravelStats } from "@/lib/travel-utils";

export function TravelStats({ stats }: { stats: TravelStats }) {
  return (
    <div className="border-t bg-card">
      <div className="grid grid-cols-4 divide-x">
        <StatItem label="Total Flights" value={String(stats.totalFlights)} />
        <StatItem
          label="Distance Flown"
          value={`${stats.distanceFlown.toLocaleString()} mi`}
        />
        <StatItem
          label="Airports Visited"
          value={String(stats.airportsVisited)}
        />
        <StatItem label="Countries" value={String(stats.countries)} />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
