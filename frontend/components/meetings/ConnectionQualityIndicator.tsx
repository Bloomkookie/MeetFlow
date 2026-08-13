import { useState, useRef, useEffect } from "react";
import { useConnectionQuality, QualityLevel } from "../../hooks/useConnectionQuality";

interface ConnectionQualityIndicatorProps {
  getPeerConnections: () => RTCPeerConnection[];
}

const QUALITY_COLORS: Record<QualityLevel, string> = {
  excellent: "bg-green-500",
  good: "bg-green-400",
  weak: "bg-yellow-400",
  poor: "bg-red-500",
  unknown: "bg-gray-400 animate-pulse",
  new: "bg-gray-400 animate-pulse",
  connecting: "bg-blue-400 animate-pulse",
  disconnected: "bg-orange-500",
  failed: "bg-red-600",
  closed: "bg-gray-600",
};

export default function ConnectionQualityIndicator({ getPeerConnections }: ConnectionQualityIndicatorProps) {
  const metrics = useConnectionQuality(getPeerConnections);
  const [showDetails, setShowDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // We can toggle diagnostic mode in dev environment
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDetails(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 bg-card/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-white hover:bg-card/20 transition-colors"
        aria-label="Connection Quality"
      >
        <span className={`w-2 h-2 rounded-full ${QUALITY_COLORS[metrics.quality]}`}></span>
        <span className="text-xs font-medium truncate max-w-[120px] sm:max-w-none">
          {["excellent", "good", "weak", "poor"].includes(metrics.quality) ? "Connection Quality" : metrics.label}
        </span>
      </button>

      {showDetails && (
        <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-72 bg-card rounded-xl shadow-xl border border-border p-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
             <span className={`w-3 h-3 rounded-full ${QUALITY_COLORS[metrics.quality]}`}></span>
             <h3 className="font-semibold text-foreground">{metrics.label}</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Latency (RTT):</span>
              <span className="text-foreground font-semibold">{metrics.rtt !== undefined ? `${metrics.rtt} ms` : "--"}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Packet Loss:</span>
              <span className="text-foreground font-semibold">{metrics.packetLoss !== undefined ? `${metrics.packetLoss}%` : "--"}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Jitter:</span>
              <span className="text-foreground font-semibold">{metrics.jitter !== undefined ? `${metrics.jitter} ms` : "--"}</span>
            </div>
          </div>

          {isDev && (
            <div className="mt-4 pt-3 border-t border-slate-100 bg-secondary -mx-4 -mb-4 p-4 rounded-b-xl text-xs font-mono text-slate-600">
              <p className="font-bold text-foreground mb-1">Dev Diagnostics</p>
              <p>State: {metrics.connectionState}</p>
              <p>Bitrate: {metrics.bitrate !== undefined ? `${metrics.bitrate} kbps` : "N/A"}</p>
              <p>Stats Extracted: {metrics.statsAvailable ? "Yes" : "No"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
