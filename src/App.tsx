
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import Haberler from '@/pages/Haberler';
import Dergi from '@/pages/Dergi';
import Etkinlikler from '@/pages/Etkinlikler';
import Anketler from '@/pages/Anketler';
import Sponsorlar from '@/pages/Sponsorlar';
import Ekipler from '@/pages/Ekipler';
import AkademikBelgeler from '@/pages/AkademikBelgeler';
import Stajlar from '@/pages/Stajlar';
import SSS from '@/pages/SSS';
import Iletisim from '@/pages/Iletisim';
import PdfFlipbookDemo from '@/pages/PdfFlipbookDemo';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/haberler" element={<Haberler />} />
          <Route path="/dergi" element={<Dergi />} />
          <Route path="/etkinlikler" element={<Etkinlikler />} />
          <Route path="/anketler" element={<Anketler />} />
          <Route path="/sponsorlar" element={<Sponsorlar />} />
          <Route path="/ekipler" element={<Ekipler />} />
          <Route path="/akademik-belgeler" element={<AkademikBelgeler />} />
          <Route path="/stajlar" element={<Stajlar />} />
          <Route path="/sss" element={<SSS />} />
          <Route path="/iletisim" element={<Iletisim />} />
          <Route path="/pdf-demo" element={<PdfFlipbookDemo />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
