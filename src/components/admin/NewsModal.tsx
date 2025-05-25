
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newsData: any) => void;
  initialData?: any;
}

const NewsModal = ({ isOpen, onClose, onSave, initialData }: NewsModalProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    category: initialData?.category || 'genel',
    featured_image: initialData?.featured_image || '',
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
            {initialData ? 'Haber Düzenle' : 'Yeni Haber Ekle'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="excerpt">Özet</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="content">İçerik</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="genel">Genel</SelectItem>
                <SelectItem value="duyuru">Duyuru</SelectItem>
                <SelectItem value="etkinlik">Etkinlik</SelectItem>
                <SelectItem value="dergi">Dergi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="featured_image">Öne Çıkan Görsel URL</Label>
            <Input
              id="featured_image"
              value={formData.featured_image}
              onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
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

export default NewsModal;
