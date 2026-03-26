import PageShell from "@/components/layout/PageShell";
import SurfaceCard from "@/components/common/SurfaceCard";
import Button from "@/components/common/Button";
import Link from "next/link";
import { IdCard, FileText, Wifi, Check } from "lucide-react";

const items = [
  { icon: IdCard, label: "Aadhaar Card", desc: "Your 12-digit Aadhaar number linked to your mobile" },
  { icon: FileText, label: "Address Proof", desc: "Utility bill, bank statement, or rent agreement" },
  { icon: Wifi, label: "Stable Internet", desc: "For uploading documents and completing payment" },
];

export default function OnboardingPage() {
  return (
    <PageShell navbarState="dashboard" contentClassName="max-w-2xl py-16 animate-fade-in">
      <h1 className="mb-2">Before we start...</h1>
      <p className="text-muted-foreground mb-10">Please keep these items handy for a smooth application process.</p>

      <div className="space-y-4 mb-10">
        {items.map((item, i) => (
          <SurfaceCard key={i} className="flex items-start gap-4 p-5">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-base mb-0.5">{item.label}</div>
              <div className="text-sm text-muted-foreground">{item.desc}</div>
            </div>
            <Check className="w-5 h-5 text-success mt-1 shrink-0" />
          </SurfaceCard>
        ))}
      </div>

      <Link href="/form">
        <Button size="lg" className="w-full h-12 text-base">
          I'm ready, let's start
        </Button>
      </Link>
    </PageShell>
  );
}
