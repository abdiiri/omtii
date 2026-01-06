import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Star, Users, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const stats = [
    { icon: Users, value: "2M+", label: "Active Users" },
    { icon: Briefcase, value: "500K+", label: "Services" },
    { icon: Star, value: "4.9", label: "Avg Rating" },
  ];

  const popularSearches = [
    "Web Development",
    "Logo Design",
    "Digital Marketing",
    "Video Editing",
    "Content Writing",
  ];

  return (
    <section className="relative overflow-hidden hero-gradient text-primary-foreground">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-6">
            <Badge variant="glass" className="px-4 py-1.5 text-sm">
              <Star className="h-3.5 w-3.5 mr-1.5 fill-accent text-accent" />
              Trusted by 2M+ professionals worldwide
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 animate-slide-up">
            Find the perfect{" "}
            <span className="gradient-text">freelance</span>
            <br />
            services for your business
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto animate-slide-up stagger-1">
            Connect with talented professionals, discover unique services, and bring your projects to life with OMTII.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 animate-slide-up stagger-2">
            <div className="relative flex gap-2 p-2 bg-card/10 backdrop-blur-xl rounded-2xl border border-primary-foreground/10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/50" />
                <Input
                  type="search"
                  placeholder="Try 'website design' or 'video editing'"
                  className="pl-12 h-12 bg-card/20 border-transparent text-primary-foreground placeholder:text-primary-foreground/40 focus:bg-card/30 rounded-xl"
                />
              </div>
              <Button variant="hero" size="lg" className="px-8 rounded-xl">
                Search
              </Button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12 animate-slide-up stagger-3">
            <span className="text-sm text-primary-foreground/60">Popular:</span>
            {popularSearches.map((search) => (
              <Link
                key={search}
                to={`/explore?q=${encodeURIComponent(search)}`}
                className="text-sm px-3 py-1 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
              >
                {search}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto animate-slide-up stagger-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="h-5 w-5 text-accent" />
                  <span className="font-display text-2xl sm:text-3xl font-bold">
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-primary-foreground/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Cards - Desktop Only */}
        <div className="hidden lg:block absolute top-1/4 left-8 xl:left-16 animate-float">
          <div className="glass-card rounded-2xl p-4 max-w-[200px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent" />
              <div>
                <p className="font-semibold text-foreground text-sm">Sarah K.</p>
                <p className="text-xs text-muted-foreground">UI Designer</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute bottom-1/4 right-8 xl:right-16 animate-float-delayed">
          <div className="glass-card rounded-2xl p-4 max-w-[220px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-success/20 flex items-center justify-center">
                <span className="text-success font-bold">✓</span>
              </div>
              <p className="font-semibold text-foreground text-sm">Order Completed</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Your project has been delivered!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
