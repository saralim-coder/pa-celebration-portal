import { Outlet, Link, useLocation } from "react-router-dom";
import { Camera, MessageSquare, Image, Home, Monitor } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/upload", label: "Upload", icon: Camera },
  { path: "/gallery", label: "Gallery", icon: Image },
  { path: "/slideshow", label: "Slideshow", icon: Monitor },
];

export default function Layout() {
  const location = useLocation();
  const isSlideshow = location.pathname === "/slideshow";

  if (isSlideshow) return <Outlet />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="https://media.base44.com/images/public/69dc9e0e6de364fb1172a03d/a0dff1aa1_IMG_2852.png" alt="People's Association Logo" className="w-10 h-10 object-contain" />
            <h1 className="font-serif text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            PA  Promotion & Long Service Awards 2026
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-medium transition-all duration-200 ${
                  location.pathname === path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 z-50">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                location.pathname === path
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-sans font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile bottom spacing */}
      <div className="md:hidden h-20" />
    </div>
  );
}