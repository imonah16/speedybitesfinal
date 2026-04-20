import { Link } from "react-router-dom";
import { ArrowRight, Clock, Star, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
            <Star className="h-3.5 w-3.5 fill-primary" /> Fresh, Fast & Delicious
          </div>
          <h1 className="font-heading text-5xl lg:text-7xl font-bold leading-tight">
            Welcome to <span className="text-primary">SpeedyBites</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Quality food served fast. Browse our menu, place your order, and enjoy a great dining experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/order">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
                Order Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/menu">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                View Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "⚡", title: "Fast Service", desc: "Your food prepared and served quickly, every time." },
            { icon: "🍽️", title: "Fresh Ingredients", desc: "Every dish made with quality, fresh ingredients." },
            { icon: "📱", title: "Easy Ordering", desc: "Browse the menu and place your order with ease." },
          ].map(f => (
            <div key={f.title} className="text-center p-6 bg-card border rounded-2xl hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-heading text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="font-heading text-3xl font-bold">Ready to eat?</h2>
          <p className="text-primary-foreground/80">Check out our full menu and place your order today.</p>
          <Link to="/order">
            <Button size="lg" variant="secondary" className="mt-2 h-12 px-8 text-base">
              Start Your Order <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}