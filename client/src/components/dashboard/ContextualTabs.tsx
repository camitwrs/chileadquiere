import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";

export interface Tab {
  id: string;
  label: string;
  href: string;
}

interface ContextualTabsProps {
  tabs: Tab[];
}

export default function ContextualTabs({ tabs }: ContextualTabsProps) {
  const [location, setLocation] = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Check if tabs overflow and need scrolling
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [tabs]);

  const isActive = (href: string) => {
    return location === href || location.startsWith(href + "/");
  };

  return (
    <div className="relative border-b border-border bg-background">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1 px-6 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <button
              key={tab.id}
              onClick={() => setLocation(tab.href)}
              className={cn(
                "relative h-12 px-4 text-sm font-medium transition-all whitespace-nowrap",
                "hover:text-foreground hover:bg-accent/50",
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll indicator for mobile/tablet */}
      {showScrollIndicator && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none flex items-center justify-end pr-2">
          <span className="text-xs text-muted-foreground">...</span>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
