import PageShell from "@/components/layout/PageShell";
import SurfaceCard from "@/components/common/SurfaceCard";
import Button from "@/components/common/Button";
import Link from "next/link";
import { Upload, CheckCircle2 } from "lucide-react";

export default function DocumentUploadPage() {
  return (
    <PageShell
      navbarState="form"
      formStep={{ current: 4, total: 5, label: "Documents" }}
      savedAt="2:45 PM"
      contentClassName="max-w-2xl animate-fade-in"
    >
      <SurfaceCard className="p-8">
        <h2 className="mb-1">Upload Documents</h2>
        <p className="text-sm text-muted-foreground mb-8">Accepted formats: PDF, JPG, PNG (max 5MB each)</p>

        <h2 className="text-base font-semibold mb-4">Required Documents</h2>
        <div className="space-y-4 mb-8">
          <div className="border border-success/30 bg-success/5 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Aadhaar Card</div>
              <div className="text-xs text-muted-foreground">aadhaar_front.pdf — 1.2 MB</div>
            </div>
            <button className="text-xs text-primary hover:underline shrink-0">Replace</button>
          </div>

          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <div className="font-medium text-sm mb-1">Address Proof</div>
            <div className="text-xs text-muted-foreground">Drag & drop or click to browse</div>
          </div>
        </div>

        <h2 className="text-base font-semibold mb-4">Optional Documents</h2>
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <div className="font-medium text-sm mb-1">Supporting Document</div>
          <div className="text-xs text-muted-foreground">Drag & drop or click to browse</div>
        </div>

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <Link href="/form">
            <Button variant="outline" size="lg">Back</Button>
          </Link>
          <Link href="/confirmation">
            <Button size="lg">Save & Continue</Button>
          </Link>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
