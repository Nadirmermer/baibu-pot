
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Book, Download, Eye, Search, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useMagazineIssues } from '@/hooks/useSupabaseData';
import LazyImage from '@/components/LazyImage';

const Dergi = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: magazines = [], isLoading, error } = useMagazineIssues(true);

  const mockPdfDemo = {
    id: 'pdf-demo',
    title: 'PDF Flipbook Demo Dergisi',
    issue_number: 99,
    publication_date: '2024-06-01',
    cover_image: '/pdf-demo-cover.jpg',
    description: 'Gerçek PDF dosyasını flipbook olarak deneyimleyin!',
    pdf_file: '/ornek.pdf',
    featured: false,
    published: true,
    theme: 'Demo',
    slug: 'pdf-demo',
    created_by: null,
    created_at: '',
    updated_at: ''
  };

  const allMagazines = [mockPdfDemo, ...magazines];

  const filteredIssues = allMagazines.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (issue.theme && issue.theme.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Dergi sayıları yükleniyor...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <Book className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Hata Oluştu
              </h3>
              <p className="text-red-500 mb-4">Dergi sayıları yüklenirken bir hata oluştu.</p>
              <Button onClick={() => window.location.reload()}>
                Tekrar Dene
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Psikolojiİbu Dergi Arşivi
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              BAİBÜ Psikoloji Öğrencileri Topluluğu'nun akademik dergisi "Psikolojiİbu"nun 
              tüm sayılarına buradan ulaşabilirsiniz. Psikoloji alanındaki güncel konular, 
              araştırmalar ve makaleler ile bilginizi genişletin.
            </p>
          </div>

          {/* Search Section */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Dergi sayılarında ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Statistics */}
          {magazines.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {magazines.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Toplam Sayı</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {new Date().getFullYear() - 2020 + 1}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Yıl</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    1.2k+
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Okuyucu</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* All Issues Grid */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Tüm Sayılar ({filteredIssues.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIssues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                      {issue.cover_image ? (
                        <LazyImage
                          src={issue.cover_image}
                          alt={issue.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fallback={
                            <Book className="h-12 w-12 text-slate-400" />
                          }
                        />
                      ) : (
                        <Book className="h-12 w-12 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300">
                        Sayı {issue.issue_number}
                      </Badge>
                      {issue.id === 'pdf-demo' && (
                        <Badge variant="outline" className="border-amber-300 text-amber-600 dark:text-amber-400">
                          Demo
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{issue.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(issue.publication_date)}</span>
                    </div>
                    {issue.theme && (
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs">
                          {issue.theme}
                        </Badge>
                      </div>
                    )}
                    {issue.description && (
                      <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 text-sm">
                        {issue.description}
                      </p>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button 
                        asChild
                        variant="outline" 
                        className="w-full flex items-center gap-2"
                      >
                        <Link to={`/dergi/${issue.slug}`}>
                          <Eye className="h-4 w-4" />
                          Detayları Gör
                        </Link>
                      </Button>
                      {issue.pdf_file && (
                        <Button variant="outline" className="w-full flex items-center gap-2" asChild>
                          <a href={issue.pdf_file} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                            PDF İndir
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredIssues.length === 0 && (
            <div className="text-center py-12">
              <Book className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                {searchTerm ? 'Aradığınız dergi sayısı bulunamadı' : 'Henüz dergi sayısı yok'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm ? 'Lütfen farklı arama terimleri deneyin.' : 'Yakında yeni sayılar eklenecek.'}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="mt-4"
                >
                  Tüm Sayıları Göster
                </Button>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Dergi;
