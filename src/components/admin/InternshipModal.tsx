
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface InternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (internshipData: any) => void;
  initialData?: any;
}

const InternshipModal = ({ isOpen, onClose, onSave, initialData }: InternshipModalProps) => {
  const [formData, setFormData] = useState({
    company_name: initialData?.company_name || '',
    position: initialData?.position || '',
    location: initialData?.location || '',
    description: initialData?.description || '',
    requirements: initialData?.requirements || '',
    application_deadline: initialData?.application_deadline || '',
    contact_info: initialData?.contact_info || '',
    application_link: initialData?.application_link || '',
    internship_type: initialData?.internship_type || 'zorunlu',
    salary_info: initialData?.salary_info || '',
    duration_months: initialData?.duration_months || '',
    active: initialData?.active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      duration_months: formData.duration_months ? parseInt(formData.duration_months) : null,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Staj Düzenle' : 'Yeni Staj Ekle'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="company_name">Şirket Adı</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="position">Pozisyon</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Lokasyon</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
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
              required
            />
          </div>

          <div>
            <Label htmlFor="requirements">Gereksinimler</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="internship_type">Staj Türü</Label>
              <Select value={formData.internship_type} onValueChange={(value) => setFormData(prev => ({ ...prev, internship_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zorunlu">Zorunlu</SelectItem>
                  <SelectItem value="gönüllü">Gönüllü</SelectItem>
                  <SelectItem value="yaz">Yaz</SelectItem>
                  <SelectItem value="donem">Dönem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration_months">Süre (Ay)</Label>
              <Input
                id="duration_months"
                type="number"
                value={formData.duration_months}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_months: e.target.value }))}
                placeholder="6"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="salary_info">Maaş Bilgisi</Label>
            <Input
              id="salary_info"
              value={formData.salary_info}
              onChange={(e) => setFormData(prev => ({ ...prev, salary_info: e.target.value }))}
              placeholder="Aylık 5000 TL"
            />
          </div>

          <div>
            <Label htmlFor="application_deadline">Başvuru Son Tarihi</Label>
            <Input
              id="application_deadline"
              type="date"
              value={formData.application_deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="contact_info">İletişim Bilgisi</Label>
            <Textarea
              id="contact_info"
              value={formData.contact_info}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
              rows={2}
              placeholder="E-posta, telefon vb."
            />
          </div>

          <div>
            <Label htmlFor="application_link">Başvuru Linki</Label>
            <Input
              id="application_link"
              value={formData.application_link}
              onChange={(e) => setFormData(prev => ({ ...prev, application_link: e.target.value }))}
              placeholder="https://company.com/apply"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
            <Label htmlFor="active">Aktif</Label>
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

export default InternshipModal;
