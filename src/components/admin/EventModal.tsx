
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
  initialData?: any;
}

const EventModal = ({ isOpen, onClose, onSave, initialData }: EventModalProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    event_date: initialData?.event_date || '',
    end_date: initialData?.end_date || '',
    location: initialData?.location || '',
    event_type: initialData?.event_type || 'seminer',
    max_participants: initialData?.max_participants || '',
    registration_required: initialData?.registration_required || false,
    registration_link: initialData?.registration_link || '',
    featured_image: initialData?.featured_image || '',
    slug: initialData?.slug || '',
    status: initialData?.status || 'upcoming',
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
            {initialData ? 'Etkinlik Düzenle' : 'Yeni Etkinlik Ekle'}
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
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date">Başlangıç Tarihi</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">Bitiş Tarihi</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Konum</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_type">Etkinlik Türü</Label>
              <Select value={formData.event_type} onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atolye">Atölye</SelectItem>
                  <SelectItem value="konferans">Konferans</SelectItem>
                  <SelectItem value="sosyal">Sosyal</SelectItem>
                  <SelectItem value="egitim">Eğitim</SelectItem>
                  <SelectItem value="seminer">Seminer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Durum</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Yaklaşan</SelectItem>
                  <SelectItem value="ongoing">Devam Eden</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="max_participants">Maksimum Katılımcı</Label>
            <Input
              id="max_participants"
              type="number"
              value={formData.max_participants}
              onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="registration_required"
              checked={formData.registration_required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, registration_required: checked }))}
            />
            <Label htmlFor="registration_required">Kayıt Gerekli</Label>
          </div>

          {formData.registration_required && (
            <div>
              <Label htmlFor="registration_link">Kayıt Linki</Label>
              <Input
                id="registration_link"
                value={formData.registration_link}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_link: e.target.value }))}
                placeholder="https://example.com/register"
              />
            </div>
          )}

          <div>
            <Label htmlFor="featured_image">Öne Çıkan Görsel URL</Label>
            <Input
              id="featured_image"
              value={formData.featured_image}
              onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
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

export default EventModal;
