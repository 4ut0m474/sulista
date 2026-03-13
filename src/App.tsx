import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FontSizeProvider } from "@/contexts/FontSizeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
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
import GroupBuy from "./pages/GroupBuy";

import SubLocationsList from "./pages/SubLocationsList";
import SubLocationDetail from "./pages/SubLocationDetail";
import LitoraneaChat from "./pages/LitoraneaChat";
import Wallet from "./pages/Wallet";
import NearbyOffers from "./pages/NearbyOffers";

import ScrollToTop from "./components/ScrollToTop";
import PinGate from "./components/PinGate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <ThemeProvider>
      <FontSizeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <PinGate>
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
                <Route path="/city/:state/:city/group-buy" element={<GroupBuy />} />
                <Route path="/city/:state/:city/commerce" element={<LocalCommerce />} />
                <Route path="/city/:state/:city/merchant" element={<MerchantPanel />} />
                
                <Route path="/city/:state/:city/locations" element={<SubLocationsList />} />
                <Route path="/city/:state/:city/local/:subLocation" element={<SubLocationDetail />} />
                <Route path="/city/:state/:city/litoranea" element={<LitoraneaChat />} />
                <Route path="/city/:state/:city/wallet" element={<Wallet />} />
                <Route path="/city/:state/:city/nearby" element={<NearbyOffers />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </PinGate>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </FontSizeProvider>
    </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);


export default App;
