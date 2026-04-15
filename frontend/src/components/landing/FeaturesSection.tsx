import { Shield, QrCode, Eye, Link as LinkIcon } from "lucide-react";

const features = [
  { icon: Shield, title: "Keamanan Blockchain", desc: "Setiap transaksi dicatat pada buku besar terdistribusi yang tidak dapat diubah." },
  { icon: Eye, title: "Transparansi Penuh", desc: "Semua pemangku kepentingan dapat melihat perjalanan lengkap beras dari petani hingga konsumen." },
  { icon: QrCode, title: "Verifikasi QR", desc: "Pindai kode QR untuk memverifikasi asal beras, kualitas, dan kepatuhan SNI secara instan." },
  { icon: LinkIcon, title: "Rantai Pasok Terhubung", desc: "Petani, pengepul, RMU, distributor, dan pengecer terhubung dalam satu platform." },
];

const FeaturesSection = () => (
  <section className="py-24 bg-muted/50">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16 animate-fade-up">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Mengapa <span className="text-gradient">Ambapari</span>?</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Solusi blockchain modern untuk transparansi rantai pasok beras.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={f.title} className="bg-card rounded-xl p-6 border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-fade-up">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"><f.icon className="w-6 h-6 text-primary" /></div>
            <h3 className="font-semibold text-lg text-foreground mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default FeaturesSection;
