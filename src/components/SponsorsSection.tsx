
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { useSponsors } from '@/hooks/useSupabaseData';

const SponsorsSection = () => {
  const { data: sponsors = [], isLoading } = useSponsors(true);
  
  // Aktif sponsorları al ve ana sponsorları öne çıkar
  const activeSponsors = sponsors
    .filter(sponsor => sponsor.active)
    .sort((a, b) => {
      // Ana sponsorlar önce, sonra sort_order'a göre
      if (a.sponsor_type === 'ana' && b.sponsor_type !== 'ana') return -1;
      if (b.sponsor_type === 'ana' && a.sponsor_type !== 'ana') return 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    })
    .slice(0, 6); // İlk 6 sponsoru göster

  if (isLoading) {
    return (
      <section className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Sponsor bilgileri yükleniyor...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Değerli Destekçilerimiz
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Topluluk faaliyetlerimizi destekleyen kurum ve kuruluşlara teşekkür ederiz.
          </p>
        </div>

        {/* Sponsor logoları */}
        {activeSponsors.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            {activeSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center group cursor-pointer"
                onClick={() => sponsor.website && window.open(sponsor.website, '_blank')}
              >
                {sponsor.logo ? (
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name}
                    className="max-w-full max-h-12 object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-24 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center group-hover:bg-slate-300 dark:group-hover:bg-slate-600 transition-colors duration-200">
                    <Building2 className="h-6 w-6 text-slate-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mb-12">
            <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Henüz sponsor bulunmuyor.
            </p>
          </div>
        )}

        {/* Sponsor ol çağrısı */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Topluluk Faaliyetlerimize Destek Olmak İster Misiniz?
          </h3>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Psikoloji eğitimi ve araştırmalarına katkıda bulunarak, geleceğin psikologlarının 
            yetişmesine destek olabilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/sponsorlar">
                Sponsorluk Bilgileri
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Link to="/iletisim">
                İletişime Geç
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
