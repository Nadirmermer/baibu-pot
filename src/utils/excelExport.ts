
export const exportToExcel = (data: any[], filename: string) => {
  // Basit CSV formatında export (Excel'de açılabilir)
  if (!data || data.length === 0) {
    alert('Dışa aktarılacak veri yok');
    return;
  }

  // Headers - ilk objenin key'lerini kullan
  const headers = Object.keys(data[0]);
  
  // CSV içeriği oluştur
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Değer string ise ve virgül içeriyorsa, tırnak içine al
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value || '';
    });
    csvContent += values.join(',') + '\n';
  });

  // UTF-8 BOM ekle (Türkçe karakterler için)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Download linki oluştur
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatFormResponsesForExcel = (responses: any[]) => {
  return responses.map(response => {
    const formattedResponse: any = {
      'Tarih': new Date(response.submitted_at).toLocaleDateString('tr-TR'),
      'Kullanıcı Adı': response.user_name || 'Anonim',
      'E-posta': response.user_email || ''
    };
    
    // Response data'daki her alanı ekle
    if (response.response_data) {
      Object.keys(response.response_data).forEach(key => {
        formattedResponse[key] = response.response_data[key];
      });
    }
    
    return formattedResponse;
  });
};
