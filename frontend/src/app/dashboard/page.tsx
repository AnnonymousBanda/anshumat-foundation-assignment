import PageShell from "@/components/layout/PageShell";
import SurfaceCard from "@/components/common/SurfaceCard";
import Button from "@/components/common/Button";
import Link from "next/link";
import ProgressBar from "@/components/common/ProgressBar";
import { CheckCircle2, Circle } from "lucide-react";

export default function DashboardPage() {
  return (
    <PageShell navbarState="dashboard" contentClassName="max-w-3xl animate-fade-in">
      <h1 className="mb-8">My Dashboard</h1>

      <SurfaceCard className="p-6 mb-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Application Draft</h2>
            <p className="text-sm text-muted-foreground">Started Oct 24, 2025</p>
          </div>
          <span className="text-xs font-medium bg-amber/15 text-amber px-3 py-1 rounded-full">Draft</span>
        </div>
        <ProgressBar value={40} className="mb-3" />
        <p className="text-sm text-muted-foreground mb-5">40% complete — Family Details pending</p>
        <Link href="/form">
          <Button>Resume Application</Button>
        </Link>
      </SurfaceCard>

      <h2 className="text-lg font-semibold mb-4">Past Applications</h2>
      <SurfaceCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-semibold">Passport Renewal</div>
            <div className="text-sm text-muted-foreground">ARN: MH0823K4521</div>
          </div>
          <span className="text-xs font-medium bg-success/15 text-success px-3 py-1 rounded-full">Completed</span>
        </div>

        <div className="space-y-4 pl-4 border-l-2 border-border">
          {[
            { label: "Application Submitted", date: "Aug 12, 2023", done: true },
            { label: "Payment Confirmed", date: "Aug 12, 2023", done: true },
            { label: "PSK Visit Completed", date: "Aug 20, 2023", done: true },
            { label: "Passport Dispatched", date: "Sep 02, 2023", done: true },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 relative">
              <div className="absolute -left-[1.35rem] bg-background">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <Circle className="w-4 h-4 text-muted" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
