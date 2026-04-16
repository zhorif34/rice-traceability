import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, UserPlus } from "lucide-react";

const HeroSection = () => (
  <section className="relative min-h-[90vh] flex items-center overflow-hidden">
    <div className="absolute inset-0">
      <img src="/images/hero-rice.jpg" alt="Sawah padi" className="w-full h-full object-cover" width={1920} height={1080} />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/85 to-black/50" />
    </div>
    <div className="relative container mx-auto px-4 py-32">
      <div className="max-w-2xl animate-fade-up">
        <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-white text-sm font-medium">Keterlacakan Berbasis Blockchain</span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
          Dari Sawah ke Meja,{" "}
          <span className="text-yellow-300">Terlacak Sepenuhnya</span>
        </h1>
        <p className="text-white text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
          Menjamin kualitas beras dan kepercayaan melalui pencatatan blockchain yang tidak dapat diubah.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="hero" size="lg" className="bg-green-600 text-white hover:bg-green-700" asChild><Link to="/traceability"><Search className="w-5 h-5" />Telusuri Beras</Link></Button>
          <Button variant="heroOutline" size="lg" className="border-white text-white hover:bg-white hover:text-foreground" asChild><Link to="/register"><UserPlus className="w-5 h-5" />Gabung Jaringan</Link></Button>
        </div>
      </div>
    </div>
  </section>
);
export default HeroSection;
