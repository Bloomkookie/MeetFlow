"use client";

import { useState } from "react";
import DashboardActions from "../components/dashboard/DashboardActions";
import UpcomingMeetings from "../components/dashboard/UpcomingMeetings";
import RecentMeetings from "../components/dashboard/RecentMeetings";
import MeetingHistory from "../components/dashboard/MeetingHistory";
import { Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const PMI = "360 740 8686";

  const handleMeetingCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your meeting history and insights?")) return;
    try {
      const res = await fetch("http://localhost:8000/api/meetings/history", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear history");
      toast.success("History cleared successfully");
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  const handleCopyPMI = () => {
    navigator.clipboard.writeText(PMI.replace(/\s/g, ''));
    setCopied(true);
    toast.success("Personal Meeting ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-foreground">{greeting}</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">Ready for your next meeting?</p>
        </div>
        <div className="bg-card dark:bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Personal Meeting ID</p>
            <p className="text-lg font-bold text-foreground tracking-wide mt-0.5">{PMI}</p>
          </div>
          <button 
            onClick={handleCopyPMI}
            className="p-2 bg-secondary rounded-lg hover:bg-border transition-colors text-muted-foreground hover:text-foreground"
            title="Copy ID"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <DashboardActions onMeetingCreated={handleMeetingCreated} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-foreground dark:text-foreground">Upcoming Meetings</h2>
          <UpcomingMeetings refreshKey={refreshKey} />
        </div>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground dark:text-foreground">Recent Meetings</h2>
            <button 
              onClick={handleClearHistory}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear History</span>
            </button>
          </div>
          <RecentMeetings refreshKey={refreshKey} />
        </div>
      </div>

      <MeetingHistory />
    </div>
  );
}
