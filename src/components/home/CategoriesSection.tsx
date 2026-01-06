import { Link } from "react-router-dom";
import {
  Code,
  Palette,
  Video,
  PenTool,
  Music,
  BarChart3,
  Camera,
  Megaphone,
  Cpu,
  BookOpen,
  Globe,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CategoriesSection = () => {
  const categories = [
    {
      icon: Code,
      name: "Development",
      count: "25K+",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Palette,
      name: "Design",
      count: "18K+",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10",
    },
    {
      icon: Video,
      name: "Video",
      count: "12K+",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: PenTool,
      name: "Writing",
      count: "15K+",
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Music,
      name: "Music & Audio",
      count: "8K+",
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: BarChart3,
      name: "Business",
      count: "20K+",
      color: "from-amber-500 to-yellow-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Megaphone,
      name: "Marketing",
      count: "16K+",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Camera,
      name: "Photography",
      count: "10K+",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-500/10",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Explore Categories
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Browse through our most popular service categories and find the perfect match for your needs.
            </p>
          </div>
          <Link to="/categories">
            <Button variant="ghost" className="group">
              View All Categories
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/explore?category=${encodeURIComponent(category.name)}`}
              className="group glass-card-hover rounded-2xl p-6 opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
            >
              <div className={`h-12 w-12 rounded-xl ${category.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <category.icon className={`h-6 w-6 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`} style={{ color: `rgb(var(--${category.color.split('-')[1]}))` }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.count} services
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
