import Link from "next/link";
import { User } from "lucide-react";
import Button from "@/components/common/Button";

type NavbarState = "public" | "dashboard" | "form";

interface NavbarProps {
  state?: NavbarState;
  formStep?: { current: number; total: number; label: string };
  savedAt?: string;
}

const Navbar = ({ state = "public", formStep, savedAt }: NavbarProps) => {
  return (
    <nav className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Left: Logo */}
      <Link href="/" className="text-xl font-bold text-primary tracking-tight">
        Passport Seva
      </Link>

      {/* Center */}
      <div className="hidden md:flex items-center gap-6">
        {state === "public" && (
          <>
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it works</Link>
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
          </>
        )}
        {state === "dashboard" && (
          <>
            <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">My Applications</Link>
          </>
        )}
        {state === "form" && formStep && (
          <span className="text-sm font-medium text-muted-foreground">
            Step {formStep.current} of {formStep.total} — {formStep.label}
          </span>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {state === "public" && (
          <Link href="/login">
            <Button size="sm">Login / Signup</Button>
          </Link>
        )}
        {state === "dashboard" && (
          <>
            <Link href="/onboarding">
              <Button size="sm">New Application</Button>
            </Link>
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          </>
        )}
        {state === "form" && savedAt && (
          <span className="text-xs font-medium bg-amber/15 text-amber px-3 py-1.5 rounded-full">
            Draft Saved at {savedAt}
          </span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
