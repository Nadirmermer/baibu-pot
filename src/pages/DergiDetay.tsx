import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Book, Download, Eye, Calendar, User, Users, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import LazyPdfReader from '@/components/LazyPdfReader';
import { useMagazineIssues } from '@/hooks/useSupabaseData';
import { useMagazineReads } from '@/hooks/useMagazineReads';

const DergiDetay = () => {
  const { id } = useParams<{ id: string }>();
  const [showReader, setShowReader] = useState(false);
  const { data: magazines = [], isLoading, error } = useMagazineIssues(false);
  
  // Mock PDF demo verisi
  const mockPdfDemo = {
    id: 'pdf-demo',
    title: 'PDF Flipbook Demo Dergisi',
    issue_number: 99,
    publication_date: '2024-06-01',
    cover_image: '/pdf-demo-cover.jpg',
    description: 'Gerçek PDF dosyasını flipbook olarak deneyimleyin!',
    pdf_file: '/ornek.pdf',
    slug: 'pdf-demo',
    theme: 'Demo',
    published: true,
    created_by: null,
    created_at: '',
    updated_at: ''
  };

  const allMagazines = [mockPdfDemo, ...magazines];
  const magazineDetail = allMagazines.find(mag => mag.slug === id || mag.id === id);
  
  const { readCount, incrementReadCount } = useMagazineReads(magazineDetail?.id || '');

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">Yükleniyor...</div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  if (error || !magazineDetail) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <Book className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Dergi bulunamadı
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Aradığınız dergi sayısı mevcut değil.
              </p>
              <Button asChild>
                <Link to="/dergi">Dergi Arşivine Dön</Link>
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long'
    });
  };

  const handleReadMagazine = () => {
    incrementReadCount();
    setShowReader(true);
  };

  // Tam ekran dergi okuyucu - PDF lazy loading ile
  if (showReader) {
    return (
      <LazyPdfReader 
        pdfUrl={magazineDetail.pdf_file}
        title={magazineDetail.title}
        onClose={() => setShowReader(false)}
      />
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/dergi" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dergi Arşivine Dön
              </Link>
            </Button>
          </div>

          {/* Magazine Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Cover Image */}
            <div className="lg:col-span-1">
              <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
                  {magazineDetail.cover_image ? (
                    <img 
                      src={magazineDetail.cover_image} 
                      alt={magazineDetail.title} 
                      className="object-cover w-full h-full" 
                      loading="lazy"
                    />
                  ) : (
                    <Book className="h-24 w-24 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Card>
            </div>

            {/* Magazine Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0 px-4 py-2">
                  Sayı {magazineDetail.issue_number}
                </Badge>
                {magazineDetail.id === 'pdf-demo' && (
                  <Badge variant="outline" className="border-amber-300 text-amber-600 dark:text-amber-400">
                    ⭐ Demo
                  </Badge>
                )}
                {readCount > 0 && (
                  <Badge variant="outline" className="border-blue-300 text-blue-600 dark:text-blue-400">
                    👁️ {readCount} okunma
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                {magazineDetail.title}
              </h1>

              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Calendar className="h-5 w-5" />
                <span className="text-lg">{formatDate(magazineDetail.publication_date)}</span>
              </div>

              {magazineDetail.theme && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Book className="h-5 w-5" />
                  <span className="text-lg">Tema: {magazineDetail.theme}</span>
                </div>
              )}

              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {magazineDetail.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={handleReadMagazine}
                  size="lg" 
                  className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={!magazineDetail.pdf_file}
                >
                  <Eye className="h-5 w-5" />
                  Dergiyi Tam Ekranda Oku
                </Button>
                {magazineDetail.pdf_file && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex items-center gap-3 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-3 text-lg font-semibold transition-all duration-300"
                    asChild
                  >
                    <a href={magazineDetail.pdf_file} target="_blank" rel="noopener noreferrer">
                      <Download className="h-5 w-5" />
                      PDF İndir
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-cyan-600" />
                  Yayın Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Sayı:</span> {magazineDetail.issue_number}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Tarih:</span> {formatDate(magazineDetail.publication_date)}
                  </p>
                  {magazineDetail.theme && (
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-medium">Tema:</span> {magazineDetail.theme}
                    </p>
                  )}
                  {readCount > 0 && (
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-medium">Okunma:</span> {readCount} kez
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-teal-600" />
                  Topluluk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300">
                  BAİBÜ Psikoloji Öğrencileri Topluluğu tarafından hazırlandı.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-red-600" />
                  Destek
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300">
                  Dergimizi beğendiyseniz lütfen arkadaşlarınızla paylaşın.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default DergiDetay;
