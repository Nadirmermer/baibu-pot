
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, MoveUp, MoveDown } from 'lucide-react';
import { useCreateFormField, useFormFields } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

interface FormField {
  id?: string;
  field_type: string;
  field_label: string;
  field_name: string;
  required: boolean;
  options?: string[];
  sort_order: number;
}

interface FormBuilderProps {
  formId: string;
  formType: 'event_registration' | 'survey';
  onSave?: () => void;
}

const FormBuilder = ({ formId, formType, onSave }: FormBuilderProps) => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [newField, setNewField] = useState<FormField>({
    field_type: 'text',
    field_label: '',
    field_name: '',
    required: false,
    options: [],
    sort_order: 0,
  });
  const [options, setOptions] = useState('');

  const { data: existingFields } = useFormFields(formId, formType);
  const createFormField = useCreateFormField();

  React.useEffect(() => {
    if (existingFields) {
      setFields(existingFields.map(field => ({
        id: field.id,
        field_type: field.field_type,
        field_label: field.field_label,
        field_name: field.field_name,
        required: field.required || false,
        options: field.options || [],
        sort_order: field.sort_order || 0,
      })));
    }
  }, [existingFields]);

  const addField = () => {
    if (!newField.field_label || !newField.field_name) {
      toast.error('Lütfen alan adı ve değişken adını doldurun');
      return;
    }

    const fieldToAdd = {
      ...newField,
      sort_order: fields.length,
      options: ['select', 'radio', 'checkbox'].includes(newField.field_type) 
        ? options.split('\n').filter(opt => opt.trim()) 
        : undefined,
    };

    setFields([...fields, fieldToAdd]);
    setNewField({
      field_type: 'text',
      field_label: '',
      field_name: '',
      required: false,
      options: [],
      sort_order: 0,
    });
    setOptions('');
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields.map((field, i) => ({ ...field, sort_order: i })));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFields(newFields.map((field, i) => ({ ...field, sort_order: i })));
    }
  };

  const saveForm = async () => {
    try {
      for (const field of fields) {
        if (!field.id) {
          await createFormField.mutateAsync({
            form_id: formId,
            form_type: formType,
            field_type: field.field_type,
            field_label: field.field_label,
            field_name: field.field_name,
            required: field.required,
            options: field.options,
            sort_order: field.sort_order,
          });
        }
      }
      toast.success('Form başarıyla kaydedildi');
      onSave?.();
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Form kaydedilirken hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Alan Ekle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="field_type">Alan Türü</Label>
              <Select value={newField.field_type} onValueChange={(value) => setNewField(prev => ({ ...prev, field_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Metin</SelectItem>
                  <SelectItem value="email">E-posta</SelectItem>
                  <SelectItem value="number">Sayı</SelectItem>
                  <SelectItem value="textarea">Uzun Metin</SelectItem>
                  <SelectItem value="select">Seçim Listesi</SelectItem>
                  <SelectItem value="radio">Tekli Seçim</SelectItem>
                  <SelectItem value="checkbox">Çoklu Seçim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="field_label">Alan Adı</Label>
              <Input
                id="field_label"
                value={newField.field_label}
                onChange={(e) => setNewField(prev => ({ ...prev, field_label: e.target.value }))}
                placeholder="Ad Soyad"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="field_name">Değişken Adı</Label>
            <Input
              id="field_name"
              value={newField.field_name}
              onChange={(e) => setNewField(prev => ({ ...prev, field_name: e.target.value }))}
              placeholder="ad_soyad"
            />
          </div>

          {['select', 'radio', 'checkbox'].includes(newField.field_type) && (
            <div>
              <Label htmlFor="options">Seçenekler (Her satıra bir seçenek)</Label>
              <textarea
                id="options"
                className="w-full p-2 border rounded"
                rows={3}
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Seçenek 1&#10;Seçenek 2&#10;Seçenek 3"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={newField.required}
              onCheckedChange={(checked) => setNewField(prev => ({ ...prev, required: checked }))}
            />
            <Label htmlFor="required">Zorunlu Alan</Label>
          </div>

          <Button onClick={addField} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Alan Ekle
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Alanları ({fields.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Henüz alan eklenmemiş</p>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{field.field_label}</div>
                    <div className="text-sm text-muted-foreground">
                      {field.field_type} • {field.field_name} {field.required && '• Zorunlu'}
                    </div>
                    {field.options && field.options.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Seçenekler: {field.options.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, 'down')}
                      disabled={index === fields.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {fields.length > 0 && (
            <Button onClick={saveForm} className="w-full mt-4" disabled={createFormField.isPending}>
              {createFormField.isPending ? 'Kaydediliyor...' : 'Formu Kaydet'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormBuilder;
