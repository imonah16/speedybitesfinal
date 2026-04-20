import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StaffLogin() {
  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) window.location.href = "/admin";
    });
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-xl p-8 w-full max-w-sm text-center space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold">Staff Login</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to access the management dashboard</p>
        </div>
        <Button onClick={handleLogin} className="w-full h-11 text-base shadow-lg shadow-primary/20">
          Sign In
        </Button>
        <a href="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to SpeedyBites
        </a>
      </div>
    </div>
  );
}