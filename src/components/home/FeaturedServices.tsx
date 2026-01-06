import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ArrowRight, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ServiceWithProfile {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: string | null;
  created_at: string;
  user_id: string;
  images: string[] | null;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

const FeaturedServices = () => {
  const [services, setServices] = useState<ServiceWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select(`
            *,
            profile:profiles(full_name, email, avatar_url)
          `)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(4);

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <Badge variant="accent" className="mb-3">Featured</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Popular Services
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Discover top-rated services from verified professionals trusted by thousands.
            </p>
          </div>
          <Link to="/explore">
            <Button variant="ghost" className="group">
              Explore All
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No services available yet</h3>
            <p className="text-muted-foreground mb-4">
              Check back soon for new services from our vendors.
            </p>
            <Link to="/register">
              <Button>Become a Vendor</Button>
            </Link>
          </div>
        ) : (
          /* Services Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="group glass-card-hover rounded-2xl overflow-hidden opacity-0 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  {service.images && service.images.length > 0 ? (
                    <img 
                      src={service.images[0]} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground" />
                  )}
                  <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Vendor */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-semibold ring-2 ring-background overflow-hidden">
                      {service.profile?.avatar_url ? (
                        <img src={service.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        service.profile?.full_name?.charAt(0) || "?"
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {service.profile?.full_name || "Unknown Vendor"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium text-sm">New</span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      {service.description?.slice(0, 30) || "Quality service"}...
                    </span>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">From</span>
                      <p className="font-display font-bold text-lg">
                        ${service.price || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedServices;
