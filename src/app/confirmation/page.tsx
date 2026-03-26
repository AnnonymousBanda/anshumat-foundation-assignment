import PageShell from "@/components/layout/PageShell";
import SurfaceCard from "@/components/common/SurfaceCard";
import Button from "@/components/common/Button";
import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";

export default function ConfirmationPage() {
  return (
    <PageShell navbarState="dashboard" contentClassName="max-w-2xl py-20 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-success" />
      </div>

      <h1 className="mb-2">Application Submitted Successfully</h1>
      <p className="text-muted-foreground mb-8">Your passport application has been received and is being processed.</p>

      <SurfaceCard className="p-6 mb-8 inline-block">
        <div className="text-sm text-muted-foreground mb-1">Application Reference Number (ARN)</div>
        <div className="text-2xl font-bold text-primary tracking-wider">MH0924X7832</div>
      </SurfaceCard>

      <div className="flex flex-col items-center gap-4 mb-10">
        <Button variant="outline" size="lg" className="gap-2">
          <Download className="w-4 h-4" /> Download Application Receipt as PDF
        </Button>
        <Link href="/dashboard">
          <Button variant="ghost" size="lg">Go to Dashboard</Button>
        </Link>
      </div>

      <div className="bg-secondary/50 rounded-xl p-6 text-left max-w-md mx-auto">
        <h2 className="text-base font-semibold mb-2">What's next?</h2>
        <p className="text-sm text-muted-foreground">
          Visit your nearest Passport Seva Kendra (PSK) on your scheduled date with original documents for verification. You'll receive an SMS with your appointment details within 48 hours.
        </p>
      </div>
    </PageShell>
  );
}
