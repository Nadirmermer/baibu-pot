import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Users, Clock, BarChart3 } from 'lucide-react';
import { useSurveys } from '@/hooks/useSupabaseData';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';

const Anketler = () => {
  const { data: surveys = [], isLoading, error } = useSurveys();

  const activeSurveys = surveys.filter(survey => survey.active);
  const completedSurveys = surveys.filter(survey => !survey.active);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer background="slate">
        <LoadingPage 
          title="Anketler Yükleniyor"
          message="Geri bildirim formlarını hazırlıyoruz..."
          icon={BarChart3}
        />
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer background="slate">
        <ErrorState 
          title="Anketler Yüklenemedi"
          message="Anketleri yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          onRetry={() => window.location.reload()}
          variant="network"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer background="slate">
      {/* Hero Section */}
      <PageHero
        title="Anketler ve Geri Bildirimler"
        description="Görüşleriniz bizim için çok değerli! Anketlerimize katılarak topluluğumuzun gelişimine katkı sağlayın ve sesinizi duyurun."
        icon={BarChart3}
        gradient="emerald"
      >
        {surveys.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {activeSurveys.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Aktif Anket</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {completedSurveys.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Tamamlanan</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {surveys.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Toplam Anket</div>
            </div>
          </div>
        )}
      </PageHero>

      {/* Active Surveys */}
      {activeSurveys.length > 0 && (
        <section className="py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Aktif Anketler
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Şu anda katılım bekleyen anketlerimiz. Görüşlerinizi paylaşmayı unutmayın!
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {activeSurveys.map((survey) => (
              <Card 
                key={survey.id} 
                className="card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-l-4 border-l-emerald-500"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 mb-3">
                        ✨ Aktif
                      </Badge>
                      <CardTitle className="text-xl text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                        {survey.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {survey.description && (
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      {survey.description}
                    </p>
                  )}
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4 text-emerald-500" />
                      <span>Son katılım: {formatDate(survey.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {getDaysRemaining(survey.end_date)} gün kaldı
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full group-hover:shadow-lg transition-all duration-200"
                    onClick={() => window.open(survey.survey_link, '_blank')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Ankete Katıl
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Completed Surveys */}
      {completedSurveys.length > 0 && (
        <section className="py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Tamamlanan Anketler
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Geçmiş anketlerimizin sonuçlarını inceleyebilirsiniz.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {completedSurveys.map((survey) => (
              <Card 
                key={survey.id} 
                className="card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              >
                <CardHeader>
                  <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300 mb-3 w-fit">
                    📊 Tamamlandı
                  </Badge>
                  <CardTitle className="text-lg text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200">
                    {survey.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {survey.description && (
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                      {survey.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(survey.start_date)} - {formatDate(survey.end_date)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:shadow-lg transition-all duration-200"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Sonuçları Görüntüle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {surveys.length === 0 && (
        <EmptyState
          icon={BarChart3}
          title="Henüz Anket Bulunmuyor"
          description="Yeni anketler eklendiğinde burada görünecek. Geri bildirimleriniz için takipte kalın!"
          actionLabel="Ana Sayfaya Dön"
          onAction={() => window.location.href = '/'}
        />
      )}

      {/* Call to Action */}
      {surveys.length > 0 && (
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Anket Önerisi
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Hangi konularda anket yapmamızı istiyorsunuz? Önerilerinizi bizimle paylaşın.
            </p>
            <Button size="lg" variant="outline" className="group">
              <BarChart3 className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
              Anket Konusu Öner
            </Button>
          </div>
        </section>
      )}
    </PageContainer>
  );
};

export default Anketler;
