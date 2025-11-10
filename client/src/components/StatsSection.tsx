import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  label: string;
  suffix?: string;
}

const stats: Stat[] = [
  { value: 1247, label: "Licitaciones Activas", suffix: "" },
  { value: 3850, label: "Proveedores Registrados", suffix: "+" },
  { value: 15420, label: "Transacciones Completadas", suffix: "" },
  { value: 2.4, label: "Millones en Ahorro", suffix: "M" },
];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-primary">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-sm md:text-base font-medium text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
