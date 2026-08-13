import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-secondary dark:bg-background border-t border-border dark:border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-primary font-bold text-xl mr-2">Zoom Clone</span>
            <span className="text-muted-foreground text-sm">© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
