import { useState, useEffect } from "react";
import { X, Camera, Mic, Moon, Sun, Save } from "lucide-react";
import { toast } from "sonner";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number; // For demo purposes, default to 1
}

interface UserSettings {
  default_camera_enabled: boolean;
  default_microphone_enabled: boolean;
  preferred_theme: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function SettingsModal({ isOpen, onClose, userId }: SettingsModalProps) {
  const [settings, setSettings] = useState<UserSettings>({
    default_camera_enabled: true,
    default_microphone_enabled: true,
    preferred_theme: "dark",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings({
          default_camera_enabled: data.default_camera_enabled,
          default_microphone_enabled: data.default_microphone_enabled,
          preferred_theme: data.preferred_theme,
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        toast.success("Settings saved successfully");
        // Also persist locally for quick pre-join access
        localStorage.setItem("userSettings", JSON.stringify(settings));
        onClose();
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-foreground">Settings</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-slate-600 hover:bg-secondary rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-[#0B5CFF] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Meeting Preferences */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Meeting Preferences</h3>
                
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-border hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${settings.default_camera_enabled ? 'bg-blue-100 text-blue-600' : 'bg-secondary text-muted-foreground'}`}>
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Default Camera State</p>
                      <p className="text-sm text-muted-foreground">Turn on camera when joining</p>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${settings.default_camera_enabled ? 'bg-primary' : 'bg-gray-200'}`}>
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={settings.default_camera_enabled}
                      onChange={(e) => setSettings({...settings, default_camera_enabled: e.target.checked})}
                    />
                    <div className={`absolute top-1 left-1 bg-card w-4 h-4 rounded-full transition-transform ${settings.default_camera_enabled ? 'translate-x-5' : ''}`}></div>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-border hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${settings.default_microphone_enabled ? 'bg-blue-100 text-blue-600' : 'bg-secondary text-muted-foreground'}`}>
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Default Microphone State</p>
                      <p className="text-sm text-muted-foreground">Turn on mic when joining</p>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${settings.default_microphone_enabled ? 'bg-primary' : 'bg-gray-200'}`}>
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={settings.default_microphone_enabled}
                      onChange={(e) => setSettings({...settings, default_microphone_enabled: e.target.checked})}
                    />
                    <div className={`absolute top-1 left-1 bg-card w-4 h-4 rounded-full transition-transform ${settings.default_microphone_enabled ? 'translate-x-5' : ''}`}></div>
                  </div>
                </label>
              </div>

              {/* Appearance */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className={`cursor-pointer flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${settings.preferred_theme === 'light' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-border hover:bg-secondary'}`}>
                    <Sun className={`w-6 h-6 mb-2 ${settings.preferred_theme === 'light' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                    <span className={`font-medium ${settings.preferred_theme === 'light' ? 'text-blue-700' : 'text-slate-700'}`}>Light Mode</span>
                    <input 
                      type="radio" 
                      name="theme" 
                      value="light" 
                      className="sr-only"
                      checked={settings.preferred_theme === 'light'}
                      onChange={(e) => setSettings({...settings, preferred_theme: e.target.value})}
                    />
                  </label>

                  <label className={`cursor-pointer flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${settings.preferred_theme === 'dark' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-border hover:bg-secondary'}`}>
                    <Moon className={`w-6 h-6 mb-2 ${settings.preferred_theme === 'dark' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                    <span className={`font-medium ${settings.preferred_theme === 'dark' ? 'text-blue-700' : 'text-slate-700'}`}>Dark Mode</span>
                    <input 
                      type="radio" 
                      name="theme" 
                      value="dark" 
                      className="sr-only"
                      checked={settings.preferred_theme === 'dark'}
                      onChange={(e) => setSettings({...settings, preferred_theme: e.target.value})}
                    />
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-secondary flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 font-medium text-slate-700 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="px-5 py-2.5 font-medium bg-primary text-white hover:bg-[#0948CC] rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <Save className="w-5 h-5" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
