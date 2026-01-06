import { Search, MessageSquare, CreditCard, ThumbsUp } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Find Your Service",
      description: "Browse thousands of services or search for exactly what you need.",
      color: "from-primary to-primary/80",
    },
    {
      icon: MessageSquare,
      title: "Connect & Discuss",
      description: "Chat with vendors, discuss your requirements, and get custom quotes.",
      color: "from-accent to-accent/80",
    },
    {
      icon: CreditCard,
      title: "Pay Securely",
      description: "Make secure payments through our platform. Your funds are protected.",
      color: "from-success to-success/80",
    },
    {
      icon: ThumbsUp,
      title: "Get Results",
      description: "Receive your deliverables, request revisions, and leave a review.",
      color: "from-info to-info/80",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Get started in minutes. Our simple process makes it easy to find and work with the best professionals.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary via-accent to-success" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative text-center opacity-0 animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
              >
                {/* Icon */}
                <div className="relative inline-flex mb-6">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-border flex items-center justify-center font-display font-bold text-sm">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-display font-semibold text-xl mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
