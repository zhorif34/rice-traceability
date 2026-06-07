import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Traceability from "./pages/Traceability.tsx";
import NotFound from "./pages/NotFound.tsx";
import FarmerDashboard from "./pages/dashboard/FarmerDashboard.tsx";
import CollectorDashboard from "./pages/dashboard/CollectorDashboard.tsx";
import RmuDashboard from "./pages/dashboard/RmuDashboard.tsx";
import DistributorDashboard from "./pages/dashboard/DistributorDashboard.tsx";
import BulogDashboard from "./pages/dashboard/BulogDashboard.tsx";
import RetailerDashboard from "./pages/dashboard/RetailerDashboard.tsx";
import AdminDashboard from "./pages/dashboard/AdminDashboard.tsx";
import ReportCenter from "./pages/dashboard/ReportCenter.tsx";
import AdminReportCenter from "./pages/dashboard/AdminReportCenter.tsx";
import AdminUserData from "./pages/dashboard/AdminUserData.tsx";
import ConsumerReport from "./pages/ConsumerReport.tsx";

const App = () => (
  <TooltipProvider>
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/traceability" element={<Traceability />} />
        <Route path="/dashboard/petani" element={<FarmerDashboard />} />
        <Route path="/dashboard/pengepul" element={<CollectorDashboard />} />
        <Route path="/dashboard/rmu" element={<RmuDashboard />} />
        <Route path="/dashboard/distributor" element={<DistributorDashboard />} />
        <Route path="/dashboard/bulog" element={<BulogDashboard />} />
        <Route path="/dashboard/retailer" element={<RetailerDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/admin/aduan" element={<AdminReportCenter />} />
        <Route path="/dashboard/admin/pengguna" element={<AdminUserData />} />
        <Route path="/dashboard/aduan" element={<ReportCenter />} />
        <Route path="/aduan-konsumen" element={<ConsumerReport />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
