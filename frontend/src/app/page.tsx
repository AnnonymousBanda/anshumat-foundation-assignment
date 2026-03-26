import Navbar from "@/components/Navbar";
import Button from "@/components/common/Button";
import Link from "next/link";
import { FileText, CreditCard, Building2, ArrowRight } from "lucide-react";

const steps = [
  { icon: FileText, label: "Apply Online", desc: "Fill the application form from home" },
  { icon: CreditCard, label: "Pay Fees", desc: "Secure online payment via multiple methods" },
  { icon: Building2, label: "Visit PSK", desc: "Complete verification at Passport Seva Kendra" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar state="public" />

      <section className="bg-card">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center animate-fade-in">
          <h1 className="mb-4">Apply for your Indian Passport<br />with ease</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            A simpler, faster, and more transparent passport application experience — from the comfort of your home.
          </p>
          <Link href="/login">
            <Button size="lg" className="text-base px-8 py-6 rounded-lg gap-2">
              Start New Application <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="bg-card rounded-xl p-8 text-center border border-border shadow-sm animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-sm font-semibold text-muted-foreground mb-1">Step {i + 1}</div>
              <h2 className="text-lg font-semibold mb-2">{step.label}</h2>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Passport Seva — Ministry of External Affairs, Government of India
      </footer>
    </div>
  );
}
