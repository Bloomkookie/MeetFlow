"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import ActionItemCard from "../../../../components/meetings/ActionItemCard";
import { toast } from "sonner";
import Link from "next/link";

export default function MeetingInsightsPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;
  
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const fetchInsights = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"}/meetings/${meetingId}/insights`);
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      } else if (res.status === 404) {
        setInsights(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [meetingId]);

  const handleGenerateInsights = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"}/meetings/${meetingId}/analyze`, {
        method: "POST"
      });
      if (res.ok) {
        toast.success("AI Analysis complete!");
        await fetchInsights();
      } else {
        const errorData = await res.json();
        toast.error(`Analysis failed: ${errorData.detail}`);
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-card dark:bg-card border border-border dark:border-border-strong rounded-lg hover:bg-secondary dark:hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground dark:text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground dark:text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              ZoomSense Intelligence
            </h1>
            <p className="text-muted-foreground dark:text-muted-foreground">Meeting ID: {meetingId}</p>
          </div>
        </div>
        
        {(!insights || insights.analysis_status === "failed") && (
          <button 
            onClick={handleGenerateInsights}
            disabled={analyzing}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all disabled:opacity-50"
          >
            {analyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Insights</>
            )}
          </button>
        )}
      </div>

      {!insights && !analyzing ? (
        <div className="bg-card dark:bg-background border border-border dark:border-border rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-500 mx-auto rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-2">No Insights Yet</h2>
          <p className="text-muted-foreground dark:text-muted-foreground max-w-md mx-auto mb-6">
            Generate AI-powered summaries, key decisions, and action items from your meeting transcript.
          </p>
        </div>
      ) : analyzing || (insights && insights.analysis_status === "processing") ? (
         <div className="bg-card dark:bg-background border border-border dark:border-border rounded-xl p-12 text-center shadow-sm">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-2">Analyzing Meeting...</h2>
          <p className="text-muted-foreground dark:text-muted-foreground">Our AI is processing the transcript and extracting intelligence.</p>
        </div>
      ) : insights && insights.analysis_status === "completed" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <div className="bg-card dark:bg-background border border-border dark:border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">Executive Summary</h3>
              <p className="text-muted-foreground dark:text-secondary-foreground leading-relaxed">
                {insights.summary}
              </p>
            </div>

            {/* Decisions */}
            <div className="bg-card dark:bg-background border border-border dark:border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">Key Decisions</h3>
              {insights.key_decisions?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground dark:text-secondary-foreground">
                  {insights.key_decisions.map((dec: string, i: number) => (
                    <li key={i}>{dec}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground dark:text-muted-foreground italic">No explicit decisions were recorded.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Action Items */}
            <div className="bg-card dark:bg-background border border-border dark:border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4 flex justify-between items-center">
                Action Items
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
                  {insights.action_items?.filter((ai: any) => ai.status !== 'dismissed').length || 0}
                </span>
              </h3>
              
              <div className="space-y-4">
                {insights.action_items?.length > 0 ? (
                  insights.action_items.map((item: any) => (
                    <ActionItemCard key={item.id} item={item} onUpdate={fetchInsights} />
                  ))
                ) : (
                  <p className="text-muted-foreground dark:text-muted-foreground italic text-sm">No action items were assigned.</p>
                )}
              </div>
            </div>

            {/* Topics */}
            <div className="bg-card dark:bg-background border border-border dark:border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">Topics Discussed</h3>
              <div className="flex flex-wrap gap-2">
                {insights.topics?.map((topic: string, i: number) => (
                  <span key={i} className="bg-secondary dark:bg-card text-slate-700 dark:text-secondary-foreground px-3 py-1 rounded-lg text-sm font-medium">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
