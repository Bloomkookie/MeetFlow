"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Video, Home, Calendar, Settings, User, LogOut, Edit3 } from "lucide-react";
import SettingsModal from "../settings/SettingsModal";
import { ThemeToggle } from "../ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  
  useEffect(() => {
    setIsMounted(true);
    const storedName = sessionStorage.getItem("displayName");
    if (storedName && storedName !== "You") {
      setUser({
        name: storedName,
        email: sessionStorage.getItem("userEmail") || "user@example.com"
      });
    }
  }, [pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem("displayName");
    sessionStorage.removeItem("userEmail");
    setUser(null);
    setIsProfileOpen(false);
    router.push("/login");
  };

  // Hide navbar in meeting room and auth pages
  if (pathname?.startsWith("/meeting/") || pathname === "/login" || pathname === "/signup") {
    if (!pathname?.includes("dashboard")) return null;
  }

  return (
    <nav className="bg-card dark:bg-background border-b border-border dark:border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl text-white">
                <Video className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-foreground dark:text-foreground hidden sm:block">MeetFlow</span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/" 
                  ? "text-primary bg-blue-50 dark:bg-blue-900/30" 
                  : "text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-secondary dark:hover:bg-card"
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/whiteboards"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/whiteboards" 
                  ? "text-primary bg-blue-50 dark:bg-blue-900/30" 
                  : "text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-secondary dark:hover:bg-card"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              Whiteboards
            </Link>
          </div>

          <div className="flex items-center gap-4 relative">
            <ThemeToggle />
            {!isMounted ? null : user ? (
              <>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white p-2 rounded-full hover:bg-secondary dark:hover:bg-card transition-colors w-9 h-9 flex items-center justify-center"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary dark:text-blue-400 font-semibold text-sm border border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors uppercase"
                >
                  {user.name.charAt(0)}
                </button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-card rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-secondary flex items-center gap-2">
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button 
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-secondary flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  </div>
                )}

                <SettingsModal 
                  isOpen={isSettingsOpen} 
                  onClose={() => setIsSettingsOpen(false)} 
                  userId={1} 
                />
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Sign In
                </Link>
                <Link href="/signup" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#0948CC] transition-colors">
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="sm:hidden border-t border-border bg-card flex justify-around p-2">
        <Link
          href="/"
          className={`flex flex-col items-center p-2 rounded-md ${
            pathname === "/" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link href="/whiteboards" className={`flex flex-col items-center p-2 rounded-md ${pathname === '/whiteboards' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Edit3 className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Whiteboards</span>
        </Link>
        <div className="flex flex-col items-center p-2 rounded-md text-muted-foreground">
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Profile</span>
        </div>
      </div>
    </nav>
  );
}
