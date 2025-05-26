
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AcademicDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (documentData: any) => void;
  initialData?: any;
}

const AcademicDocumentModal = ({ isOpen, onClose, onSave, initialData }: AcademicDocumentModalProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'ders_notlari',
    file_url: initialData?.file_url || '',
    file_type: initialData?.file_type || '',
    file_size: initialData?.file_size || '',
    tags: initialData?.tags ? initialData.tags.join(', ') : '',
    author: initialData?.author || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    onSave({
      ...formData,
      tags: tagsArray,
      file_size: formData.file_size ? parseInt(formData.file_size) : null,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Belge Düzenle' : 'Yeni Belge Ekle'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Belge Başlığı</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ders_notlari">Ders Notları</SelectItem>
                <SelectItem value="arastirma">Araştırma</SelectItem>
                <SelectItem value="tez">Tez</SelectItem>
                <SelectItem value="makale">Makale</SelectItem>
                <SelectItem value="sunum">Sunum</SelectItem>
                <SelectItem value="diger">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file_url">Dosya URL</Label>
            <Input
              id="file_url"
              value={formData.file_url}
              onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
              placeholder="https://example.com/document.pdf"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="file_type">Dosya Türü</Label>
              <Input
                id="file_type"
                value={formData.file_type}
                onChange={(e) => setFormData(prev => ({ ...prev, file_type: e.target.value }))}
                placeholder="PDF, DOC, PPT, vb."
                required
              />
            </div>
            <div>
              <Label htmlFor="file_size">Dosya Boyutu (bytes)</Label>
              <Input
                id="file_size"
                type="number"
                value={formData.file_size}
                onChange={(e) => setFormData(prev => ({ ...prev, file_size: e.target.value }))}
                placeholder="1048576"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="author">Yazar</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Belge yazarı"
            />
          </div>

          <div>
            <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="psikoloji, araştırma, yöntem"
            />
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

export default AcademicDocumentModal;
