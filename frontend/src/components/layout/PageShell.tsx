import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

type NavbarState = "public" | "dashboard" | "form";

interface PageShellProps {
  children: ReactNode;
  navbarState?: NavbarState;
  formStep?: { current: number; total: number; label: string };
  savedAt?: string;
  contentClassName?: string;
}

const PageShell = ({
  children,
  navbarState,
  formStep,
  savedAt,
  contentClassName,
}: PageShellProps) => {
  return (
    <div className="min-h-screen bg-background">
      {navbarState ? <Navbar state={navbarState} formStep={formStep} savedAt={savedAt} /> : null}
      <main className={cn("mx-auto px-6 py-12", contentClassName)}>{children}</main>
    </div>
  );
};

export default PageShell;
