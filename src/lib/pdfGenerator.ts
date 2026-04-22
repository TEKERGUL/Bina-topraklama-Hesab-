import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { CalculationResult } from '../types';

// Helper to ensure color is always a triplet
const c = (triplet: number[]): [number, number, number] => [triplet[0] || 0, triplet[1] || 0, triplet[2] || 0];

// Turkish Character Normalizer to maintain ultra-crisp English fallback fonts
const tr = (text: string): string => {
  if (!text) return text;
  return text.replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
             .replace(/Ü/g, 'U').replace(/ü/g, 'u')
             .replace(/Ş/g, 'S').replace(/ş/g, 's')
             .replace(/İ/g, 'I').replace(/ı/g, 'i')
             .replace(/Ö/g, 'O').replace(/ö/g, 'o')
             .replace(/Ç/g, 'C').replace(/ç/g, 'c');
};

/**
 * Üst düzey kurumsal mühendislik raporu oluşturucu.
 * IEEE 80 ve TS EN 62305 standartlarına uygun formatta çıktı üretir.
 */
export async function generatePDFReport(results: CalculationResult & { rho: number }, buildingInfo: { type: string, area: number, perimeter: number }) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const timestamp = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const reportNo = `TR-REPORT-${Math.floor(100000 + Math.random() * 900000)}`;

  // Kurumsal Renk Paleti
  const colors = {
    navy: [15, 23, 42],
    blue: [37, 99, 235],
    slate: [71, 85, 105],
    lightGray: [241, 245, 249],
    success: [22, 163, 74],
    danger: [220, 38, 38],
    border: [203, 213, 225]
  };

  // Helper: Her sayfaya kurumsal antet ve sayfa altı bilgisi ekler
  const addPageHeaderFooter = (pageDoc: jsPDF, pageNum: number, totalPages: number) => {
    // Watermark
    pageDoc.setTextColor(230, 235, 241);
    pageDoc.setFontSize(60);
    // Rotating around the center
    pageDoc.text('TERRA-CALC PRO', pageWidth / 2, pageHeight / 2 + 15, { align: 'center', angle: 45 });
    
    // Üst Çizgi ve Antet
    pageDoc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    pageDoc.setLineWidth(0.3);
    pageDoc.line(15, 15, pageWidth - 15, 15);
    
    pageDoc.setFont('helvetica', 'bold');
    pageDoc.setFontSize(9);
    pageDoc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
    pageDoc.text(tr('TERRA-CALC(TM) ENGINEERING SOLUTIONS'), 15, 12);
    
    pageDoc.setFont('helvetica', 'normal');
    pageDoc.setFontSize(8);
    pageDoc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
    pageDoc.text(tr(`PROJE: ${buildingInfo.type.toUpperCase()}`), pageWidth / 2, 12, { align: 'center' });
    pageDoc.text(tr(`RAPOR NO: ${reportNo}`), pageWidth - 15, 12, { align: 'right' });

    // Sayfa Altı (Footer)
    pageDoc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
    pageDoc.setFontSize(7);
    pageDoc.text(tr(`Sayfa ${pageNum} / ${totalPages}`), pageWidth / 2, pageHeight - 10, { align: 'center' });
    pageDoc.text(tr(`Olusturuldu: ${timestamp}`), 15, pageHeight - 10);
    pageDoc.text(tr('Bu belge, TERRA-CALC tarafindan olusturulmus resmi bir teknik rapordur.'), pageWidth - 15, pageHeight - 10, { align: 'right' });
  };

  // --- SAYFA 1: PROFESYONEL KAPAK ---
  // Arka Plan Tasarımı
  doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.rect(0, 0, pageWidth, 90, 'F');
  
  // Logo placeholder
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.8);
  doc.circle(pageWidth / 2, 40, 12, 'S');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  // Using T instead of Omega to ensure robust rendering
  doc.setFont('times', 'bold');
  doc.text('I', pageWidth / 2, 43, { align: 'center' });
  doc.setFont('helvetica', 'bold');

  // Ana Başlıklar
  doc.setFontSize(26);
  doc.text(tr('TOPRAKLAMA SISTEMI'), pageWidth / 2, 115, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(colors.blue[0], colors.blue[1], colors.blue[2]);
  doc.text(tr('TEKNIK ANALIZ VE HESAP RAPORU'), pageWidth / 2, 128, { align: 'center' });
  
  doc.setDrawColor(colors.blue[0], colors.blue[1], colors.blue[2]);
  doc.setLineWidth(1.5);
  doc.line(60, 135, pageWidth - 60, 135);

  // Proje Detayları Tablosu (Kapakta)
  const coverTableData = [
    [tr('TESIS ADI'), tr(buildingInfo.type.toUpperCase())],
    [tr('ANALIZ TIPI'), tr('Elemanter ve Yayilma Direnci Hesabi')],
    [tr('STANDARTLAR'), tr('IEEE 80 / TS EN 62305 / ETY')],
    [tr('TOPLAM ALAN'), `${buildingInfo.area.toFixed(2)} m2`],
    [tr('TOPLAM CEVRE'), `${buildingInfo.perimeter.toFixed(2)} m`],
    [tr('RAPOR NO'), reportNo]
  ];

  autoTable(doc, {
    startY: 155,
    body: coverTableData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2, textColor: c(colors.navy) },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 }, 1: { cellWidth: 100 } },
    margin: { left: 55 }
  });

  // CAD Planı (Kapak Altı - Yüksek Çözünürlüklü)
  const konvaCanvas = document.querySelector('.konvajs-content canvas') as HTMLCanvasElement;
  if (konvaCanvas) {
    try {
      // Çizimin arkaplanı şeffaf geldiği için, sahte bir kanvas açıp arkaplana koyu tema basıyoruz
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = konvaCanvas.width;
      tempCanvas.height = konvaCanvas.height;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0B0D12'; // PRO Dark background
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Grid pattern (isteğe bağlı ama CAD hissi verir)
        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 1;
        for(let i = 0; i < tempCanvas.width; i+=40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, tempCanvas.height); ctx.stroke(); }
        for(let i = 0; i < tempCanvas.height; i+=40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(tempCanvas.width, i); ctx.stroke(); }

        ctx.drawImage(konvaCanvas, 0, 0);
        const imgData = tempCanvas.toDataURL('image/png');
        
        doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        doc.setLineWidth(0.1);
        doc.rect(20, 220, pageWidth - 40, 60);
        
        // Ortalamak için basit bir scale
        doc.addImage(imgData, 'PNG', 21, 221, pageWidth - 42, 58);
        doc.setFontSize(8);
        doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
        doc.text(tr('EK-1: SISTEM YERLESIM PLANI (CAD Snapshot)'), pageWidth / 2, 285, { align: 'center' });
      }
    } catch (e) {
      console.warn('CAD capturing failed for cover:', e);
    }
  }

  // --- SAYFA 2: TEKNİK ANALİZ VE FORMÜLLER ---
  doc.addPage();
  const totalPages = 3;
  addPageHeaderFooter(doc, 2, totalPages);
  
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(tr('1. TEKNIK ANALIZ VE HESAPLAMA METODOLOJISI'), 15, 30);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(tr('Sistem analizi, topragin homojen kabul edildigi IEEE 80 formullerine dayanmaktadir.'), 15, 36);

  // 1.1 Formül Bloğu (Matematiksel Görünüm)
  let y = 45;
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.rect(15, y, pageWidth - 30, 40, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.text(tr('1.1. TEMEL YAYILMA DIRENCI (R_temel)'), 20, y + 8);
  
  // -- ADVANCED VECTOR FORMULA DRAWING: TEMEL --
  let fy = y + 20;
  doc.setFont('times', 'italic'); doc.setFontSize(12);
  doc.text('R', 60, fy);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.text('temel', 64, fy + 2);
  doc.setFontSize(12); doc.text('=', 73, fy);

  // Term 1
  doc.setFont('times', 'italic'); doc.setFontSize(12);
  doc.text('p', 90, fy - 5);
  doc.setLineWidth(0.3); doc.line(80, fy - 2, 102, fy - 2); // fraction line
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text('4 x', 80, fy + 4);
  // Radical Symbol for sqrt
  doc.setLineWidth(0.2);
  doc.line(88, fy + 2, 89, fy + 4); doc.line(89, fy + 4, 91, fy - 1); doc.line(91, fy - 1, 100, fy - 1);
  doc.text('(A / 3.14)', 91, fy + 4);

  doc.setFontSize(12); doc.text('+', 107, fy);

  // Term 2
  doc.setFont('times', 'italic'); doc.setFontSize(12);
  doc.text('p', 120, fy - 5);
  doc.line(116, fy - 2, 126, fy - 2); // fraction line
  doc.text('L', 120, fy + 4);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.text(tr('p: Toprak Ozgul Direnci (ohm.m), A: Tesis Alani (m2), L: Toplam Iletken Boyu (m)'), pageWidth / 2, y + 34, { align: 'center' });

  // 1.2 Formül Bloğu (Çubuklar)
  y += 50;
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.rect(15, y, pageWidth - 30, 40, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(tr('1.2. DIKEY CUBUK YAYILMA DIRENCI (R_cubuk)'), 20, y + 8);
  
  // -- ADVANCED VECTOR FORMULA DRAWING: CUBUK --
  fy = y + 20;
  doc.setFont('times', 'italic'); doc.setFontSize(12);
  doc.text('R', 65, fy);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.text('cubuk', 69, fy + 2);
  doc.setFontSize(12); doc.text('=', 78, fy);

  // Term 1
  doc.setFont('times', 'italic'); doc.setFontSize(12);
  doc.text('p', 92, fy - 5);
  doc.setLineWidth(0.3); doc.line(84, fy - 2, 102, fy - 2); // fraction
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text('2 x 3.14 x l', 84, fy + 4);

  doc.text('.', 104, fy - 2);
  doc.text('ln', 108, fy);
  doc.setFontSize(14); doc.text('(', 112, fy + 1);

  // Term 2
  doc.setFontSize(10);
  doc.text('4 x l', 115, fy - 4);
  doc.line(114, fy - 1, 123, fy - 1);
  doc.text('d', 117, fy + 4);
  doc.setFontSize(14); doc.text(')', 124, fy + 1);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.text(tr('l: Cubuk Boyu (m), d: Cubuk Capi (m)'), pageWidth / 2, y + 34, { align: 'center' });

  // Analiz Sonuçları Tablosu
  y += 55;
  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(tr('1.3. HESAPLANAN DURENC DEGERLERI'), 15, y);

  autoTable(doc, {
    startY: y + 5,
    head: [[tr('Aciklama'), tr('Sembol'), tr('Deger')]],
    body: [
      [tr('Toprak Ozgul Direnci'), 'p', `${results.rho} ohm.m`],
      [tr('Temel Topraklama Direnci'), 'R_base', `${results.baseResistance} ohm`],
      [tr('Dikey Cubuk Direnci (Esdeger)'), 'R_rod', `${results.ringResistance} ohm`],
      [tr('Toplam Sistem Direnci '), 'R_total', `${results.totalResistance} ohm`]
    ],
    theme: 'striped',
    headStyles: { fillColor: c(colors.navy) },
    margin: { left: 15, right: 15 }
  });

  // Final Durum Kartı
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setDrawColor(results.isSafe ? colors.success[0] : colors.danger[0]);
  doc.setLineWidth(1);
  doc.setFillColor(255, 255, 255);
  doc.rect(15, finalY, pageWidth - 30, 30, 'FD');

  doc.setTextColor(results.isSafe ? colors.success[0] : colors.danger[0]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(tr(results.isSafe ? 'SISTEM ANALIZI: UYGUNDUR' : 'SISTEM ANALIZI: RISKLI / UYGUN DEGIL'), pageWidth / 2, finalY + 12, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(tr(`Hesaplanan toplam direnc (${results.totalResistance} ohm), mevzuat limitlerinin altindadir.`), pageWidth / 2, finalY + 22, { align: 'center' });

  // --- SAYFA 3: METRAJ VE ONAY ---
  doc.addPage();
  addPageHeaderFooter(doc, 3, totalPages);

  doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(tr('2. MALZEME METRAJ LISTESI (BOQ)'), 15, 30);

  autoTable(doc, {
    startY: 40,
    head: [['Item', tr('Malzeme Tanimi ve Teknik Ozellikler'), tr('Miktar'), tr('Birim')]],
    body: results.equipment.map((item, idx) => [
      idx + 1,
      { content: tr(item.name + '\n' + item.description), styles: { fontSize: 8 } },
      item.quantity,
      tr(item.unit)
    ]),
    theme: 'grid',
    headStyles: { fillColor: c(colors.slate) },
    columnStyles: {
      0: { cellWidth: 10 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 20 }
    }
  });

  // Teknik Onay Bölümü
  const signY = (doc as any).lastAutoTable.finalY + 40;
  
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.2);
  doc.line(15, signY - 5, pageWidth - 15, signY - 5);
  
  doc.setFontSize(10);
  doc.text(tr('HAZIRLAYAN'), 40, signY);
  doc.text(tr('TEKNIK KONTROL VE ONAY'), pageWidth - 85, signY);
  
  doc.setFontSize(8);
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.text(tr('Dijital Imza / Muhendis Kasesi'), 35, signY + 30);
  doc.text(tr('Yetkili Birim Onayi'), pageWidth - 75, signY + 30);
  
  try {
    if ((doc as any).setLineDash) {
      (doc as any).setLineDash([1, 1], 0);
    }
  } catch (e) {}
  
  doc.line(25, signY + 25, 75, signY + 25);
  doc.line(pageWidth - 95, signY + 25, pageWidth - 25, signY + 25);

  // Sorumluluk Reddi
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  const disclaimer = tr('Sorumluluk Reddi: Bu rapor yazilim tarafindan olusturulan teorik bir hesaptir. Saha uygulamalarindan once topraklama gecis direnclerinin akredite olcum cihazlari ile dogrulanmasi zorunludur.');
  doc.text(doc.splitTextToSize(disclaimer, pageWidth - 40), 20, pageHeight - 25);

  doc.save(`Topraklama_Teknik_Raporu_${reportNo.replace(/-/g, '_')}.pdf`);
}
