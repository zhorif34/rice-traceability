const Footer = () => (
  <footer className="bg-foreground text-background py-12">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-green-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4"><img src="/images/logo-ambapari.png" alt="Ambapari" className="h-7 w-7 object-contain brightness-0 invert" /><span className="font-display text-lg font-bold text-foreground">Ambapari</span></div>
          <p className="text-foreground/80 text-sm leading-relaxed">Keterlacakan komoditas beras berbasis blockchain untuk rantai pasok yang transparan.</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-foreground">Platform</h4>
          <ul className="space-y-2 text-sm text-foreground/80"><li>Keterlacakan</li><li>Rantai Pasok</li><li>Kepatuhan SNI</li><li>Verifikasi QR</li></ul>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-foreground">Pemangku Kepentingan</h4>
          <ul className="space-y-2 text-sm text-foreground/80"><li>Petani</li><li>Pengepul</li><li>RMU</li><li>Distributor & Pengecer</li></ul>
        </div>
      </div>
      <div className="border-t border-background/10 mt-8 pt-6 text-center text-sm text-background/40">© 2026 Ambapari. Hak cipta dilindungi.</div>
    </div>
  </footer>
);
export default Footer;
