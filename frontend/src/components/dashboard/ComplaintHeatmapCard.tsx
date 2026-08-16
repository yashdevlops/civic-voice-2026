"use client";

import React, { useMemo, useState, useEffect } from "react";
import { MapPin, Maximize2, X, AlertTriangle, ExternalLink } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { HudCardFrame, LiveDot } from "./hud/HudPrimitives";

export interface HeatmapSpot {
  id: string;
  name: string;
  tickets: number;
  topPct: string;
  leftPct: string;
  type: "critical" | "warning" | "stable";
  coordinates: string;
}

interface ComplaintHeatmapCardProps {
  spots?: HeatmapSpot[];
  className?: string;
}

function getCitySeed(cityName: string): number {
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = (hash << 5) - hash + cityName.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function ComplaintHeatmapCard({ spots: customSpots, className = "" }: ComplaintHeatmapCardProps) {
  const { location } = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredSpot, setHoveredSpot] = useState<HeatmapSpot | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key dismiss for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const citySeed = useMemo(() => getCitySeed(location.city), [location.city]);

  // Dynamic Hotspots calculated for location
  const heatmapSpots = useMemo<HeatmapSpot[]>(() => {
    if (customSpots && customSpots.length > 0) return customSpots;

    const baseTop = 28 + (citySeed % 30);
    const baseLeft = 30 + (citySeed % 26);

    const latBase = (18.52 + (citySeed % 10) * 0.4).toFixed(4);
    const lngBase = (73.85 + (citySeed % 12) * 0.3).toFixed(4);

    return [
      {
        id: "spot-1",
        name: `${location.city} Central Ward 04`,
        tickets: 142 + (citySeed % 35),
        topPct: `${baseTop}%`,
        leftPct: `${baseLeft}%`,
        type: "critical",
        coordinates: `${latBase}° N, ${lngBase}° E`,
      },
      {
        id: "spot-2",
        name: `${location.city} East Division 12`,
        tickets: 88 + (citySeed % 25),
        topPct: `${(baseTop + 36) % 72}%`,
        leftPct: `${(baseLeft + 42) % 78}%`,
        type: "warning",
        coordinates: `${(parseFloat(latBase) + 0.042).toFixed(4)}° N, ${(parseFloat(lngBase) + 0.055).toFixed(4)}° E`,
      },
      {
        id: "spot-3",
        name: `${location.city} South Extension 08`,
        tickets: 45 + (citySeed % 15),
        topPct: `${(baseTop + 54) % 68}%`,
        leftPct: `${(baseLeft + 18) % 68}%`,
        type: "stable",
        coordinates: `${(parseFloat(latBase) - 0.031).toFixed(4)}° N, ${(parseFloat(lngBase) - 0.024).toFixed(4)}° E`,
      },
    ];
  }, [customSpots, location.city, citySeed]);

  return (
    <>
      <HudCardFrame className={`h-[400px] ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 font-display">
                <MapPin className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span>Complaint Heatmap</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live density map in {location.city}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{location.city}</span>
            </span>
          </div>
        </div>

        {/* Clean Light Map Viewport Stage */}
        <div
          className="flex-1 w-full rounded-2xl border border-emerald-200/60 overflow-hidden bg-gradient-to-br from-emerald-50/60 via-slate-50 to-emerald-50/40 relative flex items-center justify-center my-2 cursor-pointer transition-all duration-300 group-hover:border-emerald-300 z-10"
          onClick={() => setIsModalOpen(true)}
        >
          {/* Muted Geographic Grid Pattern Background */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden="true"
          />

          {/* Render Floating Hotspot Pin Markers */}
          {heatmapSpots.map((spot) => {
            let nodeBg = "bg-amber-500";
            let nodeGlow = "rgba(245, 158, 11, 0.4)";

            if (spot.type === "warning") {
              nodeBg = "bg-emerald-600";
              nodeGlow = "rgba(5, 150, 105, 0.4)";
            } else if (spot.type === "stable") {
              nodeBg = "bg-emerald-400";
              nodeGlow = "rgba(52, 211, 153, 0.4)";
            }

            return (
              <React.Fragment key={spot.id}>
                {/* Soft Pulse Halo */}
                <div
                  className={`absolute w-8 h-8 rounded-full ${nodeBg}/30 animate-ping pointer-events-none z-10`}
                  style={{ top: spot.topPct, left: spot.leftPct, transform: "translate(-50%, -50%)" }}
                  aria-hidden="true"
                />

                {/* Pin Marker */}
                <div
                  className={`absolute w-4 h-4 rounded-full ${nodeBg} border-2 border-white shadow-md cursor-pointer hover:scale-150 transition-transform z-20`}
                  style={{
                    top: spot.topPct,
                    left: spot.leftPct,
                    transform: "translate(-50%, -50%)",
                    boxShadow: `0 0 12px ${nodeGlow}`,
                  }}
                  onMouseEnter={() => setHoveredSpot(spot)}
                  onMouseLeave={() => setHoveredSpot(null)}
                />
              </React.Fragment>
            );
          })}

          {/* Hover Telemetry Card */}
          {hoveredSpot && (
            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl p-2.5 shadow-xl text-xs space-y-1 z-30 pointer-events-none font-sans">
              <span className="font-bold text-slate-800 block">{hoveredSpot.name}</span>
              <span className="text-emerald-600 font-extrabold font-display">{hoveredSpot.tickets} Active Issues</span>
            </div>
          )}

          {/* View Full Map CTA Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="absolute bottom-3 right-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105 z-20 cursor-pointer"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>View Full Map →</span>
          </button>

          {/* Location Badge */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md border border-emerald-200/80 px-3 py-1 rounded-full flex items-center gap-1.5 z-20 pointer-events-none shadow-sm">
            <LiveDot color="emerald" size="sm" />
            <span className="text-xs font-semibold text-slate-700">
              {location.city} Map
            </span>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium z-10">
          <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>High Density: Ward 04 ({heatmapSpots[0]?.tickets || 140}+ tickets)</span>
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            <LiveDot color="emerald" size="sm" />
            <span>Updated live</span>
          </div>
        </div>
      </HudCardFrame>

      {/* Interactive Fullscreen City Map Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="map-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 text-slate-900">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="map-modal-title" className="text-lg font-extrabold text-slate-900 font-display">
                    {location.city}, {location.state} — Live Grievance Map
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Real-time spatial distribution & ward density breakdown
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(location.city + ', ' + location.state)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                </a>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Map Viewport Container */}
            <div className="flex-1 relative w-full h-full bg-slate-100">
              {mounted ? (
                <iframe
                  title={`${location.city} Live Grievance Map`}
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    location.city + ", " + location.state
                  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  Loading map engine…
                </div>
              )}

              {/* Floating Cluster Overlay Chips */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-xl max-w-xs space-y-2 text-xs text-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-bold">
                  <span>Ward Hotspots ({location.city})</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live GPS
                  </span>
                </div>
                <div className="space-y-1.5">
                  {heatmapSpots.map((spot) => (
                    <div key={spot.id} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate max-w-[170px]">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            spot.type === "critical"
                              ? "bg-amber-500"
                              : spot.type === "warning"
                              ? "bg-emerald-600"
                              : "bg-emerald-400"
                          }`}
                        />
                        <span className="truncate">{spot.name}</span>
                      </span>
                      <span className="font-extrabold text-slate-900 font-display">
                        {spot.tickets} tickets
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Showing live grievance markers for {location.label}</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-white transition-colors"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Backward Compatibility Re-export Alias
export { ComplaintHeatmapCard as ComplaintHeatmap3D };
