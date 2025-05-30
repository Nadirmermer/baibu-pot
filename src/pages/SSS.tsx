
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, ChevronDown, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Link } from 'react-router-dom';

const SSS = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: "Genel Sorular",
      questions: [
        {
          question: "BAİBÜ Psikoloji Öğrencileri Topluluğu nedir?",
          answer: "Bolu Abant İzzet Baysal Üniversitesi Psikoloji Bölümü öğrencilerinin oluşturduğu akademik ve sosyal bir topluluktur. Psikoloji alanında eğitim, araştırma ve sosyal etkinlikler düzenleyen aktif bir öğrenci topluluğudur."
        },
        {
          question: "Topluluğa nasıl üye olabilirim?",
          answer: "Psikoloji Bölümü öğrencisi olmak koşuluyla topluluğumuza üye olabilirsiniz. Üyelik başvurusu için iletişim sayfamızdan bizimle iletişime geçebilir veya etkinliklerimize katılarak tanışabilirsiniz."
        },
        {
          question: "Topluluk hangi etkinlikleri düzenliyor?",
          answer: "Seminerler, konferanslar, atölyeler, sosyal etkinlikler, kitap kulübü buluşmaları, akademik araştırma projeleri ve psikoloji günleri gibi çeşitli etkinlikler düzenliyoruz."
        }
      ]
    },
    {
      title: "Etkinlikler",
      questions: [
        {
          question: "Etkinliklere nasıl kayıt olabilirim?",
          answer: "Etkinlikler sayfamızdan güncel etkinliklerimizi görebilir ve 'Kayıt Ol' butonuna tıklayarak kayıt formunu doldurabilirsiniz. Bazı etkinlikler için ön kayıt gerekebilir."
        },
        {
          question: "Etkinlikler ücretli mi?",
          answer: "Çoğu etkinliğimiz ücretsizdir. Özel atölyeler veya dış konuşmacıların yer aldığı etkinlikler için sembolik bir katılım ücreti alınabilir. Ücret bilgileri etkinlik detaylarında belirtilir."
        },
        {
          question: "Etkinlik iptal olursa ne oluyor?",
          answer: "Etkinlik iptal durumunda kayıtlı katılımcılar e-posta ve web sitesi üzerinden bilgilendirilir. Ücretli etkinlikler için ücret iadesi yapılır."
        }
      ]
    },
    {
      title: "Dergi",
      questions: [
        {
          question: "Psikolojiİbu dergisine nasıl makale gönderebilirim?",
          answer: "Dergi sayfamızda yayın ilkeleri ve makale gönderim kılavuzu bulunmaktadır. Makalelerinizi belirtilen formatta hazırlayıp dergi editörlüğüne e-posta ile gönderebilirsiniz."
        },
        {
          question: "Dergi ne sıklıkla yayınlanıyor?",
          answer: "Psikolojiİbu dergisi yılda 2 sayı olarak (Bahar ve Güz dönemleri) yayınlanmaktadır. Özel sayılar da çıkarılabilir."
        },
        {
          question: "Dergiye katkıda bulunmak için psikoloji öğrencisi olmak şart mı?",
          answer: "Öncelik psikoloji öğrencilerine verilmekle birlikte, psikoloji alanıyla ilgili kaliteli çalışmalar diğer disiplinlerden de kabul edilebilir."
        }
      ]
    },
    {
      title: "Stajlar",
      questions: [
        {
          question: "Staj fırsatları nereden takip edebilirim?",
          answer: "Stajlar sayfamızda güncel staj ilanları paylaşılmaktadır. Ayrıca sosyal medya hesaplarımızdan da duyurular yapılır."
        },
        {
          question: "Staj başvurusu için yardım alabilir miyim?",
          answer: "Evet, CV hazırlama, mülakat teknikleri ve staj sürecine dair rehberlik hizmetleri sunuyoruz. İletişim sayfamızdan randevu alabilirsiniz."
        },
        {
          question: "Zorunlu staj için nasıl destek alabilirim?",
          answer: "Zorunlu staj sürecinde gerekli evrakların hazırlanması, staj yerinin bulunması ve değerlendirme sürecinde destek sağlıyoruz."
        }
      ]
    },
    {
      title: "Üyelik ve Roller",
      questions: [
        {
          question: "Toplulukta aktif rol almak için ne yapmalıyım?",
          answer: "Etkinliklere düzenli katılım gösterdikten sonra, ilgilendiğiniz komite (etkinlik, dergi, sosyal medya, vs.) için başvuruda bulunabilirsiniz."
        },
        {
          question: "Yönetim kuruluna nasıl başvuru yapabilirim?",
          answer: "Yönetim kurulu seçimleri her akademik yıl sonunda yapılır. Adaylık süreci ve koşulları seçim döneminde duyurulur."
        },
        {
          question: "Mezun olduktan sonra da toplulukla bağım devam eder mi?",
          answer: "Evet, mezun üyelerimizle iletişimimiz devam eder. Alumni ağımız sayesinde deneyim paylaşımı ve mentorluk faaliyetleri sürdürülür."
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Sıkça Sorulan Sorular
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Topluluk hakkında merak ettiğiniz soruların yanıtlarını burada bulabilirsiniz. 
              Aradığınızı bulamadıysanız bizimle iletişime geçin.
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Soru ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                    {category.title}
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left hover:text-cyan-600 dark:hover:text-cyan-400">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-slate-400">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Aradığınız soru bulunamadı
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Farklı kelimeler deneyebilir veya bizimle iletişime geçebilirsiniz.
              </p>
              <Button asChild>
                <Link to="/iletisim" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  İletişime Geç
                </Link>
              </Button>
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-12 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Sorunuzun yanıtını bulamadınız mı?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Size yardımcı olmaktan mutluluk duyarız. Sorularınızı bizimle paylaşın.
            </p>
            <Button asChild size="lg">
              <Link to="/iletisim" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Soru Sor
              </Link>
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default SSS;
