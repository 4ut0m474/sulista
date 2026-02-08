import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import CityHome from "./pages/CityHome";
import DigitalMarket from "./pages/DigitalMarket";
import StallDetail from "./pages/StallDetail";
import Plans from "./pages/Plans";
import TreasureHunt from "./pages/TreasureHunt";
import Opinion from "./pages/Opinion";
import Promotions from "./pages/Promotions";
import Events from "./pages/Events";
import Trails from "./pages/Trails";
import LocalCommerce from "./pages/LocalCommerce";
import MerchantPanel from "./pages/MerchantPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/city/:state/:city" element={<CityHome />} />
          <Route path="/city/:state/:city/market" element={<DigitalMarket />} />
          <Route path="/city/:state/:city/market/:stallId" element={<StallDetail />} />
          <Route path="/city/:state/:city/plans" element={<Plans />} />
          <Route path="/city/:state/:city/treasure" element={<TreasureHunt />} />
          <Route path="/city/:state/:city/opinion" element={<Opinion />} />
          <Route path="/city/:state/:city/promotions" element={<Promotions />} />
          <Route path="/city/:state/:city/events" element={<Events />} />
          <Route path="/city/:state/:city/trails" element={<Trails />} />
          <Route path="/city/:state/:city/commerce" element={<LocalCommerce />} />
          <Route path="/city/:state/:city/merchant" element={<MerchantPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
