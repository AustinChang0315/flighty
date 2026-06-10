"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";

import { supabase, type FlightRecord } from "@/lib/supabase";
import { searchAirports } from "@/lib/flight-airports-search";
import { allAirports } from "@/components/home/home-config";
import type { AirportInfo } from "@/registry/flight-airports";

export function AddFlightDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (flight: FlightRecord) => void;
}) {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromAirport, setFromAirport] = useState<AirportInfo | null>(null);
  const [toAirport, setToAirport] = useState<AirportInfo | null>(null);
  const [tripType, setTripType] = useState<"round-trip" | "one-way">(
    "round-trip",
  );
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fromResults = useMemo(
    () => searchAirports(allAirports, fromQuery, 6),
    [fromQuery],
  );
  const toResults = useMemo(
    () => searchAirports(allAirports, toQuery, 6),
    [toQuery],
  );

  const handleSubmit = async () => {
    if (!fromAirport || !toAirport) {
      setError("Please select both airports.");
      return;
    }
    if (!supabase) return;
    setSaving(true);
    setError("");

    const { data, error: err } = await supabase
      .from("flights")
      .insert({
        from_code: fromAirport.code,
        to_code: toAirport.code,
        trip_type: tripType,
        flight_date: date || null,
      })
      .select()
      .single();

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    onAdd(data as FlightRecord);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border-border mx-4 w-full max-w-md rounded-2xl border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold">Add Flight</h2>
          <button
            onClick={onClose}
            className="hover:bg-muted rounded-lg p-1 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 p-5">
          <AirportInput
            label="From"
            query={fromQuery}
            onQueryChange={(q) => {
              setFromQuery(q);
              setFromAirport(null);
            }}
            results={fromResults}
            selected={fromAirport}
            onSelect={(a) => {
              setFromAirport(a);
              setFromQuery(a.code);
            }}
          />
          <AirportInput
            label="To"
            query={toQuery}
            onQueryChange={(q) => {
              setToQuery(q);
              setToAirport(null);
            }}
            results={toResults}
            selected={toAirport}
            onSelect={(a) => {
              setToAirport(a);
              setToQuery(a.code);
            }}
          />

          {/* Trip type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Trip Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["round-trip", "one-way"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTripType(type)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    tripType === type
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {type === "round-trip" ? "Round Trip" : "One Way"}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Date{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-border bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t px-5 py-4">
          <button
            onClick={onClose}
            className="border-border hover:bg-accent flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-foreground text-background flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add Flight"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AirportInput({
  label,
  query,
  onQueryChange,
  results,
  selected,
  onSelect,
}: {
  label: string;
  query: string;
  onQueryChange: (q: string) => void;
  results: AirportInfo[];
  selected: AirportInfo | null;
  onSelect: (a: AirportInfo) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="border-border flex items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="text-muted-foreground size-3.5 shrink-0" />
        <input
          type="text"
          placeholder="Search by IATA code, city or country..."
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
          }}
          className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      {selected && (
        <p className="text-muted-foreground mt-1 text-xs">
          {selected.name} · {selected.city}, {selected.country}
        </p>
      )}
      {open && query.trim() && results.length > 0 && (
        <div className="border-border bg-popover absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border shadow-lg">
          {results.map((airport) => (
            <button
              key={airport.code}
              onMouseDown={() => onSelect(airport)}
              className="hover:bg-accent flex w-full flex-col px-3 py-2 text-left text-sm transition-colors"
            >
              <span className="font-medium">
                {airport.code} — {airport.city}
              </span>
              <span className="text-muted-foreground text-xs">
                {airport.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
