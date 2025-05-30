import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNews } from '@/hooks/useSupabaseData';

const NewsSection = () => {
  const { data: news = [], isLoading } = useNews(true);
  
  // Sadece öne çıkan 3 haberi göster
  const featuredNews = news.filter(item => item.featured).slice(0, 3);
  
  // Eğer öne çıkan haber yoksa, son 3 haberi al
  const displayNews = featuredNews.length > 0 ? featuredNews : news.slice(0, 3);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'etkinlik':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'dergi':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case 'duyuru':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'etkinlik': 'Etkinlik',
      'dergi': 'Dergi',
      'duyuru': 'Duyuru',
      'genel': 'Genel'
    };
    return labels[category] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Haberler yükleniyor...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white dark:bg-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Öne Çıkan Haberler ve Duyurular
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Topluluk faaliyetleri, akademik gelişmeler ve önemli duyurulardan haberdar olun.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayNews.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-slate-900">
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-t-lg overflow-hidden">
                {item.featured_image ? (
                  <img 
                    src={item.featured_image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-300 dark:bg-slate-600 rounded-lg mx-auto mb-2"></div>
                      <span className="text-sm">Görsel</span>
                    </div>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getCategoryColor(item.category)}>
                    {getCategoryLabel(item.category)}
                  </Badge>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {item.published_at ? formatDate(item.published_at) : formatDate(item.created_at)}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
                  {item.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {item.excerpt}
                </p>
              </CardContent>
              
              <CardFooter className="px-6 pb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 group-hover:border-cyan-200 dark:group-hover:border-cyan-800"
                  asChild
                >
                  <Link to={`/haberler/${item.slug}`}>
                    Devamını Oku
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link to="/haberler">
              Tüm Haberler ve Duyurular
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
