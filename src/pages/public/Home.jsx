import { Link } from "react-router-dom";
import { ArrowRight, Clock, Flame, Heart, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-20 px-4">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-orange-200 text-orange-600 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
            <Flame className="h-3.5 w-3.5 fill-orange-500" /> Fresh, Fast & Absolutely Delicious
          </div>
          <h1 className="font-heading text-5xl lg:text-7xl font-bold leading-tight">
            Welcome to{" "}
            <span className="relative">
              <span className="text-primary">SpeedyBites</span>
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full opacity-60" />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Comfort food served with love and speed. Browse our menu, place your order, and enjoy a truly great dining experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/order">
              <Button size="lg" className="h-13 px-8 text-base shadow-xl shadow-primary/25 rounded-2xl font-semibold">
                Order Now <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link to="/menu">
              <Button size="lg" variant="outline" className="h-13 px-8 text-base rounded-2xl font-semibold bg-white/70 backdrop-blur-sm border-orange-200 hover:bg-orange-50">
                Browse Menu
              </Button>
            </Link>
          </div>
          {/* Social proof */}
          <div className="flex items-center justify-center gap-1 pt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm text-muted-foreground ml-2 font-medium">Loved by our regulars</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gradient-to-b from-amber-50/50 to-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-center mb-10 text-foreground">Why SpeedyBites?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "⚡", title: "Lightning Fast", desc: "Your food prepared and served quickly, every single time.", color: "from-amber-100 to-yellow-50", border: "border-amber-200" },
              { icon: "🍲", title: "Cozy Comfort Food", desc: "Every dish crafted with fresh, quality ingredients and a whole lot of love.", color: "from-orange-100 to-amber-50", border: "border-orange-200" },
              { icon: "📱", title: "Easy Ordering", desc: "Browse the full menu and place your order right from your phone.", color: "from-rose-100 to-pink-50", border: "border-rose-200" },
            ].map(f => (
              <div key={f.title} className={`text-center p-7 bg-gradient-to-br ${f.color} border ${f.border} rounded-3xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="font-heading text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu highlights */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Heart className="h-3.5 w-3.5 fill-rose-500" /> Customer Favourites
          </div>
          <h2 className="font-heading text-3xl font-bold mb-3">What people love</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">From hearty mains to sweet treats — there's something for everyone at SpeedyBites.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: "🍔", label: "Burgers" },
              { emoji: "🍕", label: "Pizzas" },
              { emoji: "🥗", label: "Salads" },
              { emoji: "🍰", label: "Desserts" },
            ].map(item => (
              <Link to="/menu" key={item.label}>
                <div className="p-6 bg-card border rounded-2xl hover:shadow-md hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                  <div className="text-4xl mb-2">{item.emoji}</div>
                  <p className="font-semibold text-sm">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 mx-4 mb-8 rounded-3xl bg-gradient-to-br from-primary via-orange-500 to-accent text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative max-w-3xl mx-auto text-center space-y-4">
          <Sparkles className="h-8 w-8 mx-auto text-yellow-200" />
          <h2 className="font-heading text-3xl font-bold">Hungry? We've got you. 🍽️</h2>
          <p className="text-white/80 text-lg">Check out our full menu and place your order — it's quick, easy and delicious.</p>
          <Link to="/order">
            <Button size="lg" className="mt-2 h-12 px-8 text-base bg-white text-primary hover:bg-white/90 font-bold rounded-2xl shadow-xl">
              Start Your Order <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}