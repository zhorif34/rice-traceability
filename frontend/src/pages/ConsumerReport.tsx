import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConsumerReportSection from "@/components/landing/ConsumerReportSection";

const ConsumerReport = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <ConsumerReportSection />
    </div>
    <Footer />
  </div>
);

export default ConsumerReport;
