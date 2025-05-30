
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useSupabaseData';

const EventsSection = () => {
  const { data: events = [], isLoading } = useEvents();
  
  // Gelecek etkinlikleri filtrele ve ilk 3'ünü al
  const upcomingEvents = events
    .filter(event => event.status === 'upcoming' && new Date(event.event_date) > new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 3);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'atolye':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'konferans':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'sosyal':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'egitim':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'seminer':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'atolye': 'Atölye',
      'konferans': 'Konferans',
      'sosyal': 'Sosyal',
      'egitim': 'Eğitim',
      'seminer': 'Seminer'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Etkinlikler yükleniyor...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Gelecek Etkinlik Takvimimiz
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Psikoloji alanında düzenlediğimiz atölyeler, konferanslar ve sosyal etkinliklere katılın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getTypeColor(event.event_type)}>
                    {getTypeLabel(event.event_type)}
                  </Badge>
                  {event.max_participants && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {event.max_participants} kişi
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
                  {event.title}
                </h3>
                
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center">
                    <span className="font-medium w-16">Tarih:</span>
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-16">Saat:</span>
                    <span>{formatTime(event.event_date)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-start">
                      <span className="font-medium w-16 mt-0.5">Yer:</span>
                      <span className="flex-1">{event.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="px-6 pb-6">
                {event.registration_required ? (
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white"
                    asChild
                  >
                    <Link to={`/etkinlikler/${event.slug}`}>
                      Kayıt Ol
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link to={`/etkinlikler/${event.slug}`}>
                      Detayları Gör
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {upcomingEvents.length === 0 && (
          <div className="text-center mb-12">
            <p className="text-slate-600 dark:text-slate-400">
              Şu anda yaklaşan etkinlik bulunmuyor.
            </p>
          </div>
        )}

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link to="/etkinlikler">
              Tüm Etkinlikler
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
