import { useState, useEffect } from "react";

export type QualityLevel = "excellent" | "good" | "weak" | "poor" | "unknown" | "new" | "connecting" | "disconnected" | "failed" | "closed";

export interface QualityMetrics {
  quality: QualityLevel;
  label: string;
  rtt?: number;
  packetLoss?: number;
  jitter?: number;
  bitrate?: number;
  connectionState: RTCPeerConnectionState | "unknown";
  statsAvailable: boolean;
}

const QUALITY_LABELS: Record<QualityLevel, string> = {
  excellent: "Excellent Connection",
  good: "Good Connection",
  weak: "Weak Connection",
  poor: "Poor Connection",
  unknown: "Checking connection...",
  new: "Checking connection...",
  connecting: "Connecting...",
  disconnected: "Connection interrupted.",
  failed: "Connection failed.",
  closed: "Connection closed.",
};

const RTT_THRESHOLDS = { excellent: 100, good: 200, weak: 400 };
const PL_THRESHOLDS = { excellent: 1, good: 3, weak: 8 };
const JITTER_THRESHOLDS = { excellent: 20, good: 50, weak: 100 };

export function useConnectionQuality(getPeerConnections: () => RTCPeerConnection[]) {
  const [metrics, setMetrics] = useState<QualityMetrics>({
    quality: "unknown",
    label: QUALITY_LABELS["unknown"],
    connectionState: "unknown",
    statsAvailable: false
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const qualityHistory: QualityLevel[] = [];
    const HISTORY_SIZE = 2;

    const pollStats = async () => {
      const peerConnections = getPeerConnections();
      
      if (!peerConnections || peerConnections.length === 0) {
        setMetrics(prev => prev.quality !== "unknown" ? { ...prev, quality: "unknown", label: QUALITY_LABELS["unknown"], connectionState: "unknown" } : prev);
        return;
      }

      // Find the most advanced connection state
      const statePriority = { "connected": 5, "connecting": 4, "new": 3, "disconnected": 2, "failed": 1, "closed": 0 };
      let bestState: RTCPeerConnectionState = "closed";
      
      for (const pc of peerConnections) {
        if ((statePriority[pc.connectionState as keyof typeof statePriority] || 0) > (statePriority[bestState as keyof typeof statePriority] || 0)) {
            bestState = pc.connectionState;
        }
      }

      if (bestState !== "connected") {
          const stateQuality = bestState as QualityLevel;
          setMetrics(prev => ({
              ...prev,
              quality: stateQuality,
              label: QUALITY_LABELS[stateQuality] || QUALITY_LABELS["unknown"],
              connectionState: bestState
          }));
          return;
      }

      let worstConnectionQuality: QualityLevel | null = null;
      let overallRtt: number | undefined;
      let overallPl: number | undefined;
      let overallJitter: number | undefined;
      let overallBitrate: number | undefined;
      let anyStatsFound = false;

      for (const pc of peerConnections) {
        if (pc.connectionState !== "connected") continue;

        try {
          const stats = await pc.getStats();
          let pcRtt: number | undefined;
          let pcPacketLoss: number | undefined;
          let pcJitter: number | undefined;
          let pcBitrate: number | undefined;
          
          let packetsLost = 0;
          let packetsReceived = 0;

          stats.forEach((report) => {
            if (report.type === "candidate-pair" && report.state === "succeeded") {
              anyStatsFound = true;
              if (report.currentRoundTripTime !== undefined) {
                pcRtt = report.currentRoundTripTime * 1000;
              } else if (report.roundTripTime !== undefined) {
                 pcRtt = report.roundTripTime * 1000; 
              }
            }

            if (report.type === "inbound-rtp") {
              anyStatsFound = true;
              if (report.jitter !== undefined) {
                pcJitter = report.jitter * 1000;
              }
              if (report.packetsLost !== undefined) packetsLost += report.packetsLost;
              if (report.packetsReceived !== undefined) packetsReceived += report.packetsReceived;
              if (report.bytesReceived !== undefined) pcBitrate = report.bytesReceived * 8; // Simplified bps
            }
          });

          if (packetsReceived > 0) {
            pcPacketLoss = (packetsLost / (packetsReceived + packetsLost)) * 100;
          }

          // Calculate quality based ONLY on available metrics
          const scores: number[] = [];
          
          if (pcRtt !== undefined) {
             if (pcRtt > RTT_THRESHOLDS.weak) scores.push(1);
             else if (pcRtt > RTT_THRESHOLDS.good) scores.push(2);
             else if (pcRtt > RTT_THRESHOLDS.excellent) scores.push(3);
             else scores.push(4);
          }
          
          if (pcPacketLoss !== undefined) {
             if (pcPacketLoss > PL_THRESHOLDS.weak) scores.push(1);
             else if (pcPacketLoss > PL_THRESHOLDS.good) scores.push(2);
             else if (pcPacketLoss > PL_THRESHOLDS.excellent) scores.push(3);
             else scores.push(4);
          }
          
          if (pcJitter !== undefined) {
             if (pcJitter > JITTER_THRESHOLDS.weak) scores.push(1);
             else if (pcJitter > JITTER_THRESHOLDS.good) scores.push(2);
             else if (pcJitter > JITTER_THRESHOLDS.excellent) scores.push(3);
             else scores.push(4);
          }

          let pcQuality: QualityLevel = "unknown";
          if (scores.length > 0) {
              // A severe metric (score 1) limits the overall quality
              if (scores.includes(1)) {
                  pcQuality = "poor";
              } else {
                  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                  if (avg <= 1.5) pcQuality = "poor";
                  else if (avg <= 2.5) pcQuality = "weak";
                  else if (avg <= 3.5) pcQuality = "good";
                  else pcQuality = "excellent";
              }
          }

          if (pcQuality !== "unknown") {
              const qualityOrder = { "poor": 1, "weak": 2, "good": 3, "excellent": 4 };
              if (!worstConnectionQuality || qualityOrder[pcQuality] < qualityOrder[worstConnectionQuality as keyof typeof qualityOrder]) {
                  worstConnectionQuality = pcQuality;
              }
          }

          if (pcRtt !== undefined) overallRtt = Math.max(overallRtt || 0, pcRtt);
          if (pcPacketLoss !== undefined) overallPl = Math.max(overallPl || 0, pcPacketLoss);
          if (pcJitter !== undefined) overallJitter = Math.max(overallJitter || 0, pcJitter);
          if (pcBitrate !== undefined) overallBitrate = (overallBitrate || 0) + pcBitrate;

        } catch (err) {
          console.error("Error fetching WebRTC stats", err);
        }
      }

      if (!anyStatsFound || worstConnectionQuality === null) {
        setMetrics(prev => ({
            ...prev,
            quality: "unknown",
            label: QUALITY_LABELS["unknown"],
            connectionState: bestState,
            statsAvailable: false
        }));
        return;
      }

      // Smoothing logic
      qualityHistory.push(worstConnectionQuality);
      if (qualityHistory.length > HISTORY_SIZE) {
        qualityHistory.shift();
      }

      const isConsistent = qualityHistory.length === HISTORY_SIZE && qualityHistory.every(q => q === qualityHistory[0]);

      if (isConsistent) {
        const validatedQuality = qualityHistory[0];
        setMetrics((prev) => {
          return {
            quality: validatedQuality,
            label: QUALITY_LABELS[validatedQuality],
            rtt: overallRtt !== undefined ? Math.round(overallRtt) : undefined,
            packetLoss: overallPl !== undefined ? Number(overallPl.toFixed(1)) : undefined,
            jitter: overallJitter !== undefined ? Math.round(overallJitter) : undefined,
            bitrate: overallBitrate !== undefined ? Math.round(overallBitrate / 1000) : undefined, // kbps
            connectionState: bestState,
            statsAvailable: true
          };
        });
      }
    };

    intervalId = setInterval(pollStats, 2000);
    pollStats();

    return () => {
      clearInterval(intervalId);
    };
  }, [getPeerConnections]);

  return metrics;
}
