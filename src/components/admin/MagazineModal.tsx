
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MagazineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (magazineData: any) => void;
  initialData?: any;
}

const MagazineModal = ({ isOpen, onClose, onSave, initialData }: MagazineModalProps) => {
  const [formData, setFormData] = useState({
    issue_number: initialData?.issue_number || '',
    title: initialData?.title || '',
    theme: initialData?.theme || '',
    description: initialData?.description || '',
    cover_image: initialData?.cover_image || '',
    pdf_file: initialData?.pdf_file || '',
    publication_date: initialData?.publication_date || '',
    slug: initialData?.slug || '',
    published: initialData?.published || false,
  });
  
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');

  const uploadFile = async (file: File, path: string) => {
    try {
      setUploadStatus(`${file.type.includes('pdf') ? 'PDF' : 'Kapak görseli'} yükleniyor...`);
      
      // First, try to create the bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage.createBucket('magazines', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'image/*']
      });
      
      // Ignore error if bucket already exists
      if (bucketError && !bucketError.message.includes('already exists')) {
        console.log('Bucket creation info:', bucketError.message);
      }

      // Upload the file
      const { data, error } = await supabase.storage
        .from('magazines')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('magazines')
        .getPublicUrl(path);
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    setError('');
    setUploadStatus('Hazırlanıyor...');
    
    try {
      let finalFormData = { ...formData };
      let progress = 0;
      
      // PDF dosyası yükle
      if (selectedPdfFile) {
        setUploadProgress(25);
        const pdfPath = `pdf/${Date.now()}_${selectedPdfFile.name}`;
        const pdfUrl = await uploadFile(selectedPdfFile, pdfPath);
        finalFormData.pdf_file = pdfUrl;
        progress = 50;
        setUploadProgress(progress);
      }
      
      // Kapak görseli yükle
      if (selectedCoverFile) {
        setUploadProgress(75);
        const coverPath = `covers/${Date.now()}_${selectedCoverFile.name}`;
        const coverUrl = await uploadFile(selectedCoverFile, coverPath);
        finalFormData.cover_image = coverUrl;
        progress = 90;
        setUploadProgress(progress);
      }
      
      setUploadStatus('Dergi kaydediliyor...');
      setUploadProgress(95);
      
      await onSave(finalFormData);
      
      setUploadProgress(100);
      setUploadStatus('Başarıyla kaydedildi!');
      
      toast.success('Dergi başarıyla kaydedildi!');
      onClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Dosya yükleme sırasında hata oluştu');
      toast.error('Hata: ' + (error.message || 'Dosya yükleme sırasında hata oluştu'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedPdfFile(file);
      setError('');
    } else {
      setError('Lütfen sadece PDF dosyası seçin.');
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedCoverFile(file);
      setError('');
    } else {
      setError('Lütfen sadece görsel dosyası seçin.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Dergi Düzenle' : 'Yeni Dergi Sayısı Ekle'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issue_number">Sayı Numarası</Label>
              <Input
                id="issue_number"
                type="number"
                value={formData.issue_number}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_number: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="publication_date">Yayın Tarihi</Label>
              <Input
                id="publication_date"
                type="date"
                value={formData.publication_date}
                onChange={(e) => setFormData(prev => ({ ...prev, publication_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="theme">Tema</Label>
            <Input
              id="theme"
              value={formData.theme}
              onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="cover_image">Kapak Görseli</Label>
            <div className="space-y-2">
              <Input
                id="cover_image"
                value={formData.cover_image}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                placeholder="https://example.com/cover.jpg veya dosya yükleyin"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  className="hidden"
                  id="cover-file-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('cover-file-input')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Kapak Yükle
                </Button>
                {selectedCoverFile && (
                  <span className="text-sm text-green-600">
                    {selectedCoverFile.name} seçildi
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="pdf_file">PDF Dosyası</Label>
            <div className="space-y-2">
              <Input
                id="pdf_file"
                value={formData.pdf_file}
                onChange={(e) => setFormData(prev => ({ ...prev, pdf_file: e.target.value }))}
                placeholder="https://example.com/magazine.pdf veya dosya yükleyin"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfFileChange}
                  className="hidden"
                  id="pdf-file-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('pdf-file-input')?.click()}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF Yükle
                </Button>
                {selectedPdfFile && (
                  <span className="text-sm text-green-600">
                    {selectedPdfFile.name} seçildi
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
            />
            <Label htmlFor="published">Yayınla</Label>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{uploadStatus}</span>
                <span>%{uploadProgress}</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              İptal
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Yükleniyor...' : (initialData ? 'Güncelle' : 'Kaydet')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MagazineModal;
