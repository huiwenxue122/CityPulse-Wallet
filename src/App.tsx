import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Offers from "./pages/Offers.tsx";
import OfferDetail from "./pages/OfferDetail.tsx";
import Redeem from "./pages/Redeem.tsx";
import Activity from "./pages/Activity.tsx";
import Profile from "./pages/Profile.tsx";
import PaymentMethods from "./pages/PaymentMethods.tsx";
import Merchant from "./pages/Merchant.tsx";
import MerchantGoal from "./pages/MerchantGoal.tsx";
import MerchantReview from "./pages/MerchantReview.tsx";
import Welcome from "./pages/Welcome.tsx";
import NotFound from "./pages/NotFound.tsx";
import { LocaleProvider } from "./context/LocaleContext";
import { ActivityProvider } from "./context/ActivityContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LocaleProvider>
        <ActivityProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/customer" element={<Navigate to="/home" replace />} />
              <Route path="/" element={<Welcome />} />
              <Route path="/home" element={<Index />} />
              <Route path="/discover" element={<Offers />} />
              <Route path="/offers" element={<Navigate to="/discover" replace />} />
              <Route path="/offer/:id" element={<OfferDetail />} />
              <Route path="/redeem/:id" element={<Redeem />} />
              <Route path="/passes" element={<Activity />} />
              <Route path="/activity" element={<Navigate to="/passes" replace />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/payment-methods" element={<PaymentMethods />} />
              <Route path="/merchant" element={<Merchant />} />
              <Route path="/merchant/goal" element={<MerchantGoal />} />
              <Route path="/merchant/review" element={<MerchantReview />} />
              <Route path="/merchant/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ActivityProvider>
      </LocaleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
