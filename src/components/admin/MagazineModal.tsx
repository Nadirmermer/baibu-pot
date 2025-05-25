
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Dergi Düzenle' : 'Yeni Dergi Sayısı Ekle'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="cover_image">Kapak Görseli URL</Label>
            <Input
              id="cover_image"
              value={formData.cover_image}
              onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div>
            <Label htmlFor="pdf_file">PDF Dosyası URL</Label>
            <Input
              id="pdf_file"
              value={formData.pdf_file}
              onChange={(e) => setFormData(prev => ({ ...prev, pdf_file: e.target.value }))}
              placeholder="https://example.com/magazine.pdf"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
            />
            <Label htmlFor="published">Yayınla</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit">
              {initialData ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MagazineModal;
