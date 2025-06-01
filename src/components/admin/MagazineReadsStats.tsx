
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, TrendingUp, Book } from 'lucide-react';
import { useAllMagazineReads } from '@/hooks/useMagazineReads';

const MagazineReadsStats = () => {
  const { reads, loading } = useAllMagazineReads();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Dergi Okuma İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalReads = reads.reduce((sum, read) => sum + read.read_count, 0);
  const averageReads = reads.length > 0 ? Math.round(totalReads / reads.length) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {totalReads}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Toplam Okuma</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {reads.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Okunmuş Dergi</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {averageReads}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Ortalama Okuma</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Dergi Bazında Okuma Sayıları
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reads.length === 0 ? (
            <div className="text-center py-8">
              <Book className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Henüz okuma verisi bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reads.map((read) => (
                <div key={read.magazine_id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {read.magazine_issues?.title || 'Bilinmeyen Dergi'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Sayı {read.magazine_issues?.issue_number || 'N/A'}
                    </div>
                    {read.last_read_at && (
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        Son okunma: {new Date(read.last_read_at).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`
                        ${read.read_count > 50 ? 'border-green-300 text-green-600 dark:text-green-400' : 
                          read.read_count > 20 ? 'border-yellow-300 text-yellow-600 dark:text-yellow-400' : 
                          'border-gray-300 text-gray-600 dark:text-gray-400'}
                      `}
                    >
                      👁️ {read.read_count}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MagazineReadsStats;
