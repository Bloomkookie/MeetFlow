"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import { createScheduledMeeting } from "../../lib/api";
import { toast } from "sonner";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Copy } from "lucide-react";
import { Meeting } from "../../types/meeting";

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleMeetingModal({ isOpen, onClose, onSuccess }: ScheduleMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [isLoading, setIsLoading] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<Meeting | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time) {
      toast.error("Please fill in all required fields");
      return;
    }

    const scheduledDate = new Date(`${date}T${time}`);
    if (scheduledDate < new Date()) {
      toast.error("Meeting time must be in the future");
      return;
    }

    setIsLoading(true);
    try {
      const meeting = await createScheduledMeeting({
        title,
        description,
        scheduled_at: scheduledDate.toISOString(),
        duration: parseInt(duration),
      });
      
      setCreatedMeeting(meeting);
      toast.success("Meeting scheduled successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to schedule meeting");
    } finally {
      setIsLoading(false);
    }
  };

  const copyInvite = () => {
    if (createdMeeting) {
      navigator.clipboard.writeText(createdMeeting.invite_link);
      toast.success("Invite link copied to clipboard");
    }
  };

  const handleClose = () => {
    setCreatedMeeting(null);
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setDuration("30");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Schedule Meeting">
      {createdMeeting ? (
        <div className="space-y-6">
          <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium mb-1">Meeting Scheduled!</h4>
            <p className="text-sm">Your meeting "{createdMeeting.title}" has been created.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Invite Link</label>
            <div className="flex">
              <input
                readOnly
                value={createdMeeting.invite_link}
                className="flex-1 px-4 py-2 bg-secondary border border-border rounded-l-lg text-muted-foreground text-sm outline-none"
              />
              <button
                onClick={copyInvite}
                className="bg-primary hover:bg-[#0948CC] text-white px-4 rounded-r-lg transition-colors flex items-center justify-center"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="w-full bg-card border border-border hover:bg-secondary text-foreground font-medium py-2 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Topic *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Meeting"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Time *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] bg-card"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="45">45 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="90">1 Hour 30 Minutes</option>
              <option value="120">2 Hours</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-[#0948CC] text-white font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : "Save"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
