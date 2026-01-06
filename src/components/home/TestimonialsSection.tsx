import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      content: "MarketFlow transformed how we hire freelancers. The quality of professionals here is outstanding, and the platform makes everything so seamless.",
      author: "David Chen",
      role: "CEO, TechStart Inc.",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop",
      rating: 5,
    },
    {
      id: 2,
      content: "As a freelancer, this platform has been a game-changer. The client quality is excellent, and I've grown my business significantly.",
      author: "Maria Garcia",
      role: "Brand Designer",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
      rating: 5,
    },
    {
      id: 3,
      content: "The secure payment system and clear communication tools made our project run smoothly from start to finish. Highly recommended!",
      author: "James Wilson",
      role: "Marketing Director",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 hero-gradient text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Loved by Thousands
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Join our community of satisfied clients and successful freelancers.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative glass-card rounded-2xl p-6 opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
            >
              {/* Quote Icon */}
              <Quote className="h-8 w-8 text-primary/30 mb-4" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
          {[
            { value: "2M+", label: "Active Users" },
            { value: "$150M+", label: "Paid to Freelancers" },
            { value: "500K+", label: "Projects Completed" },
            { value: "4.9/5", label: "Average Rating" },
          ].map((stat, index) => (
            <div key={stat.label} className="opacity-0 animate-fade-in" style={{ animationDelay: `${0.4 + index * 0.1}s`, animationFillMode: 'forwards' }}>
              <p className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-primary-foreground/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
