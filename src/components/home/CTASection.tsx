import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 sm:p-12 lg:p-16">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-foreground/10 rounded-full blur-3xl" />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="text-primary-foreground">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-6">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Start selling today</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Ready to grow your business?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
                Join thousands of freelancers and businesses already thriving on MarketFlow. Create your account and start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button variant="accent" size="xl" className="w-full sm:w-auto group">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/become-vendor">
                  <Button variant="glass" size="xl" className="w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                    Become a Vendor
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content - Features */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "No upfront costs", desc: "Start selling with zero fees" },
                { title: "Secure payments", desc: "Protected transactions always" },
                { title: "Global reach", desc: "Access clients worldwide" },
                { title: "24/7 support", desc: "We're always here to help" },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10"
                >
                  <h3 className="font-semibold text-primary-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-primary-foreground/70">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
