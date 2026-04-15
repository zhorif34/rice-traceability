import { Sprout, Truck, Factory, Building2, Warehouse, ShoppingBag, ArrowRight } from "lucide-react";

const steps = [
  { icon: Sprout, label: "Petani", sub: "Farmer" },
  { icon: Truck, label: "Pengepul", sub: "Collector" },
  { icon: Factory, label: "RMU", sub: "Penggilingan" },
  { icon: Building2, label: "Distributor", sub: "Distribusi" },
  { icon: Warehouse, label: "Bulog", sub: "Gudang" },
  { icon: ShoppingBag, label: "Pengecer", sub: "Titik Penjualan" },
];

const SupplyChainSection = () => (
  <section className="py-24">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16 animate-fade-up">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Alur <span className="text-gradient">Rantai Pasok</span></h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Setiap tahap dicatat di blockchain, menciptakan jejak yang lengkap.</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 lg:gap-4 animate-fade-up">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                <s.icon className="w-7 h-7 md:w-8 md:h-8 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            </div>
            {i < steps.length - 1 && <ArrowRight className="w-5 h-5 text-primary/40 hidden lg:block" />}
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default SupplyChainSection;
