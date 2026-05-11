import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { type } = await req.json();

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentW = pageW - margin * 2;

    // Title page
    doc.setFillColor(245, 240, 235);
    doc.rect(0, 0, pageW, pageH, 'F');
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(160, 30, 30);
    doc.text('PA Promotion & Long Service Awards', pageW / 2, 80, { align: 'center' });
    doc.text('Presentation Ceremony 2026', pageW / 2, 92, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(100, 80, 60);
    doc.text(type === 'messages' ? 'Well Wishes & Messages' : 'Photos & Captions', pageW / 2, 110, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(150, 130, 110);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageW / 2, 125, { align: 'center' });

    if (type === 'messages' || type === 'all') {
      const messages = await base44.asServiceRole.entities.Message.list('-created_date');

      if (messages.length > 0) {
        doc.addPage();
        doc.setFillColor(245, 240, 235);
        doc.rect(0, 0, pageW, pageH, 'F');
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(160, 30, 30);
        doc.text('Messages & Well Wishes', pageW / 2, 30, { align: 'center' });

        let y = 50;

        for (const msg of messages) {
          const lines = doc.splitTextToSize(`"${msg.content}"`, contentW - 10);
          const blockH = lines.length * 7 + 24;

          if (y + blockH > pageH - margin) {
            doc.addPage();
            doc.setFillColor(245, 240, 235);
            doc.rect(0, 0, pageW, pageH, 'F');
            y = margin;
          }

          // Card background
          doc.setFillColor(255, 252, 248);
          doc.setDrawColor(200, 170, 140);
          doc.roundedRect(margin, y, contentW, blockH, 4, 4, 'FD');

          // Quote mark
          doc.setFont('times', 'italic');
          doc.setFontSize(11);
          doc.setTextColor(60, 40, 20);
          doc.text(lines, margin + 8, y + 12);

          // From / To
          doc.setFont('times', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(120, 90, 60);
          doc.text(`From: ${msg.uploader_name}   →   To: ${msg.recipient}`, margin + 8, y + blockH - 7);

          y += blockH + 8;
        }
      }
    }

    if (type === 'photos' || type === 'all') {
      const photos = await base44.asServiceRole.entities.Photo.list('-created_date');

      if (photos.length > 0) {
        doc.addPage();
        doc.setFillColor(245, 240, 235);
        doc.rect(0, 0, pageW, pageH, 'F');
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(160, 30, 30);
        doc.text('Photos', pageW / 2, 30, { align: 'center' });

        let y = 50;
        const imgH = 80;

        for (const photo of photos) {
          if (y + imgH + 30 > pageH - margin) {
            doc.addPage();
            doc.setFillColor(245, 240, 235);
            doc.rect(0, 0, pageW, pageH, 'F');
            y = margin;
          }

          try {
            const res = await fetch(photo.image_url);
            const buf = await res.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
            const ext = photo.image_url.split('?')[0].split('.').pop().toUpperCase();
            const fmt = ['JPG','JPEG','PNG','WEBP'].includes(ext) ? (ext === 'JPEG' ? 'JPEG' : ext) : 'JPEG';
            doc.addImage(`data:image/${fmt.toLowerCase()};base64,${base64}`, fmt === 'JPEG' ? 'JPEG' : fmt, margin, y, contentW, imgH, undefined, 'MEDIUM');
          } catch {
            doc.setFillColor(220, 210, 200);
            doc.rect(margin, y, contentW, imgH, 'F');
            doc.setFont('times', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(120, 100, 80);
            doc.text('[Image unavailable]', pageW / 2, y + imgH / 2, { align: 'center' });
          }

          y += imgH + 4;

          // Caption & attribution
          doc.setFont('times', 'italic');
          doc.setFontSize(10);
          doc.setTextColor(60, 40, 20);
          if (photo.caption) {
            doc.text(`"${photo.caption}"`, margin, y + 5);
            y += 8;
          }
          doc.setFont('times', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(120, 90, 60);
          doc.text(`From: ${photo.uploader_name}   →   To: ${photo.recipient}`, margin, y + 5);
          y += 18;
        }
      }
    }

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ceremony-2026-${type}.pdf"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});