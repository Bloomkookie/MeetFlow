"use client";

import { useState } from "react";
import { Check, X, User, Calendar, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ActionItem {
  id: number;
  description: string;
  assignee?: string;
  deadline?: string;
  status: string;
  is_approved: boolean;
  ai_generated: boolean;
}

interface ActionItemCardProps {
  item: ActionItem;
  onUpdate: () => void;
}

export default function ActionItemCard({ item, onUpdate }: ActionItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleApprove = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:8000/api/action-items/${item.id}/approve`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to approve");
      toast.success("Action item approved");
      onUpdate();
    } catch (err) {
      toast.error("Error approving action item");
      setIsUpdating(false);
    }
  };

  const handleDismiss = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:8000/api/action-items/${item.id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to dismiss");
      toast.success("Action item dismissed");
      onUpdate();
    } catch (err) {
      toast.error("Error dismissing action item");
      setIsUpdating(false);
    }
  };

  if (item.status === "dismissed") return null;

  return (
    <div className={`p-4 rounded-xl border ${item.is_approved ? 'bg-[#ECFDF3] dark:bg-[#163524] border-[#22C55E]/30' : 'bg-[#FFF7E6] dark:bg-[#3B2F12] border-[#F59E0B]/30'} shadow-sm`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <p className="text-foreground dark:text-foreground font-medium">{item.description}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground dark:text-muted-foreground">
            {item.assignee && (
              <div className="flex items-center gap-1 text-[#F59E0B]">
                <User className="w-4 h-4" />
                <span>{item.assignee}</span>
              </div>
            )}
            {item.deadline && (
              <div className="flex items-center gap-1 text-[#F59E0B]">
                <Calendar className="w-4 h-4" />
                <span>{item.deadline}</span>
              </div>
            )}
            {item.ai_generated && !item.is_approved && (
              <span className="bg-[#F3E8FF] dark:bg-[#2E1F47] text-[#7C3AED] dark:text-[#C4B5FD] px-2 py-0.5 rounded text-xs font-medium">
                AI Suggested
              </span>
            )}
          </div>
        </div>
        
        {!item.is_approved && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleApprove}
              disabled={isUpdating}
              className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
              title="Approve"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDismiss}
              disabled={isUpdating}
              className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
