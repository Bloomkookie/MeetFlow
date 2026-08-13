"use client";

import { useEffect, useState } from "react";
import { Search, History, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatTime } from "../../lib/utils";
import Link from "next/link";
import LoadingSpinner from "../ui/LoadingSpinner";
import EmptyState from "../ui/EmptyState";

export default function MeetingHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"}/meetings/history/search?query=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        toast.error("Failed to load meeting history");
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search
    const timer = setTimeout(fetchHistory, 300);
    return () => clearTimeout(timer);
  }, [query, refreshKey]);

  const handleClearInsights = async () => {
    if (!confirm("Are you sure you want to clear all insights history?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"}` + "/zoomsense/history", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear insights");
      toast.success("Insights cleared successfully");
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to clear insights");
    }
  };

  return (
    <div className="bg-card dark:bg-background rounded-xl shadow-sm border border-border dark:border-border p-6 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-foreground dark:text-foreground flex items-center gap-2">
          <History className="w-5 h-5" />
          Meeting History & Insights
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search topics, decisions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary dark:bg-card border border-border dark:border-border-strong rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-foreground"
            />
          </div>
          <button 
            onClick={handleClearInsights}
            className="flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors border border-transparent dark:border-transparent whitespace-nowrap"
          >
            Clear Insights
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10"><LoadingSpinner /></div>
      ) : history.length === 0 ? (
        <EmptyState 
          icon={<History className="w-8 h-8" />}
          title="No history found"
          description={query ? "No meetings match your search query." : "Your past meetings and insights will appear here."}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border dark:border-border text-sm text-muted-foreground dark:text-muted-foreground">
                <th className="py-3 px-4 font-medium">Meeting</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Insights</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.meeting.id} className="border-b border-border dark:border-border hover:bg-secondary dark:hover:bg-card/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground dark:text-foreground line-clamp-1">{item.meeting.title}</p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground font-mono mt-0.5">{item.meeting.meeting_code}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground dark:text-secondary-foreground">
                    {formatDate(item.meeting.created_at)}
                    <br />
                    <span className="text-xs">{formatTime(item.meeting.created_at)}</span>
                  </td>
                  <td className="py-3 px-4">
                    {item.analysis_status === "completed" ? (
                      <span className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full text-xs font-medium">
                        <Sparkles className="w-3 h-3" /> Ready
                      </span>
                    ) : item.has_transcript ? (
                      <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full text-xs font-medium">
                        Transcript Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-secondary dark:bg-card text-slate-600 dark:text-muted-foreground px-2.5 py-1 rounded-full text-xs font-medium">
                        No Transcript
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link 
                      href={`/meeting/${item.meeting.meeting_code}/insights`}
                      className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
