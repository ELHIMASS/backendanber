const express = require('express');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Transporter configuration (SMTP options will be loaded from .env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Products data (same as frontend)
const products = [
  {
    id: 1,
    slug: 'sauvage',
    name: 'Dior Sauvage',
    collection: 'Orient',
    category: 'orient',
    sub: 'Eau de Parfum · Intense',
    desc: 'Une signature brute et lumineuse, avec des notes fraîches de bergamote et un cœur ambré boisé qui durent toute la journée.',
    notes: ['Bergamote', 'Poivre Sichuan', 'Ambroxan', 'Fève Tonka', 'Cèdre'],
    sizes: ['30ml', '50ml', '100ml'],
    prices: { '30ml': 92, '50ml': 145, '100ml': 210 },
    badge: 'Best-seller',
    rating: '4.9/5',
    image: 'assets/Sauvage/N1.jpg',
    images: ['assets/Sauvage/N1.jpg', 'assets/Sauvage/N2.jpg', 'assets/Sauvage/N3.png'],
  },
  {
    id: 2,
    slug: 'stronger-with-you',
    name: 'Armani Stronger With You',
    collection: 'Boisé',
    category: 'boise',
    sub: 'Eau de Toilette',
    desc: 'Un accord chaleureux de vanille et de cardamome autour d’un cœur d’épices et de cacao, pour un parfum sensuel et moderne.',
    notes: ['Amandes', 'Cardamome', 'Cèdre', 'Vanille', 'Néroli'],
    sizes: ['30ml', '50ml', '100ml'],
    prices: { '30ml': 69, '50ml': 98, '100ml': 130 },
    badge: 'Signature',
    rating: '4.7/5',
    image: 'assets/withyou/N1.jpg',
    images: ['assets/withyou/N1.jpg', 'assets/withyou/N2.jpg', 'assets/withyou/N3.jpg', 'assets/withyou/N4.jpg'],
  },
  {
    id: 3,
    slug: 'bleu-de-chanel',
    name: 'Bleu de Chanel',
    collection: 'Exclusif',
    category: 'exclusif',
    sub: 'Eau de Parfum',
    desc: 'Un parfum riche et élégant, mêlant des accords aromatiques de citron, gingembre et bois pour une présence sophistiquée.',
    notes: ['Citron', 'Poivre Rose', 'Cèdre', 'Encens', 'Santal'],
    sizes: ['50ml', '100ml'],
    prices: { '50ml': 120, '100ml': 165 },
    badge: 'Édition',
    rating: '4.8/5',
    image: 'assets/bleu/N1.jpg',
    images: ['assets/bleu/N4.png', 'assets/bleu/N2.jpg', 'assets/bleu/N3.JPG', 'assets/bleu/N1.jpg'],
  },
  {
    id: 4,
    slug: 'yves',
    name: 'Yves Saint Laurent',
    collection: 'Prestige',
    category: 'exclusif',
    sub: 'Eau de Parfum',
    desc: 'Une essence de sophistication et de luxe, unissant des accords floraux délicats à une base boisée riche pour une fragrance intemporelle.',
    notes: ['Vanille', 'Iris', 'Santal', 'Musc', 'Cèdre'],
    sizes: ['50ml', '100ml'],
    prices: { '50ml': 145, '100ml': 210 },
    badge: 'Prestige',
    rating: '4.9/5',
    image: 'assets/Yves/N1.jpg',
    images: ['assets/Yves/N1.jpg', 'assets/Yves/N2.jpg', 'assets/Yves/N3.jpg', 'assets/Yves/N4.jpg'],
  },
  {
    id: 5,
    slug: 'bois-de-santal',
    name: 'Bois de Santal',
    collection: 'Boisé',
    category: 'boise',
    sub: 'Eau de Parfum',
    desc: 'Un souffle boisé crémeux enrichi par des notes de santal, de vanille et de tabac blond pour une signature chaleureuse.',
    notes: ['Santal', 'Vétiver', 'Noix de Coco', 'Vanille', 'Tabac'],
    sizes: ['50ml', '100ml'],
    prices: { '50ml': 135, '100ml': 198 },
    badge: null,
    rating: '4.7/5',
    image: 'assets/bois-de-santal/bois-de-santal.jpg',
    images: ['assets/bois-de-santal/N1.jpg', 'assets/bois-de-santal/N2.jpg', 'assets/bois-de-santal/N3.jpg'],
  },
  {
    id: 6,
    slug: 'nuit-de-jasmin',
    name: 'Nuit de Jasmin',
    collection: 'Floral',
    category: 'floral',
    sub: 'Eau de Parfum',
    desc: 'Une envolée nocturne de jasmin et tubéreuse, adoucie par un fond musqué qui fait de cette fragrance un accord profond et captivant.',
    notes: ['Jasmin', 'Tubéreuse', 'Musc', 'Iris', 'Vanille'],
    sizes: ['30ml', '50ml', '100ml'],
    prices: { '30ml': 78, '50ml': 122, '100ml': 178 },
    badge: null,
    rating: '4.8/5',
    image: 'assets/nuit-de-jasmin/nuit-de-jasmin.jpg',
    images: ['assets/nuit-de-jasmin/N1.jpg', 'assets/nuit-de-jasmin/N2.jpg', 'assets/nuit-de-jasmin/N3.jpg'],
  },
  {
    id: 7,
    slug: 'rose-satin',
    name: 'Rose Satin',
    collection: 'Floral',
    category: 'floral',
    sub: 'Eau de Parfum',
    desc: 'La rose se révèle avec élégance sur un fond doux et poudré de jasmin, d’iris et de musc, pour un parfum féminin et moderne.',
    notes: ['Rose', 'Jasmin', 'Iris', 'Musc', 'Ambre'],
    sizes: ['30ml', '50ml', '75ml'],
    prices: { '30ml': 74, '50ml': 115, '75ml': 150 },
    badge: 'Nouveau',
    rating: '4.8/5',
    image: 'assets/rose-satin/rose-satin.jpg',
    images: ['assets/rose-satin/N1.jpg', 'assets/rose-satin/N2.jpg', 'assets/rose-satin/N3.jpg'],
  },
];

// Helper pour générer le PDF
function createInvoice(formData, cartItemsSelected, productsList, totalAmount) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 0, size: 'A4' }); // Suppression des marges globales pour dessiner les fonds colorés
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const goldColor = '#b89758';
      const textColor = '#333333';
      const invoiceNumber = 'FA-' + Date.now().toString().slice(-6);

      // Fond de l'en-tête (Beige clair)
      doc.rect(0, 0, doc.page.width, 140).fill('#fcfbf9');

      // En-tête (Logo)
      const logoPath = path.join(__dirname, '..', 'assets', 'logo', 'logo.png');
      try {
        doc.image(logoPath, 50, 30, { width: 80 });
      } catch (e) {
        // Logo introuvable
      }
      
      // Titre Facture
      doc.fillColor(goldColor)
         .font('Helvetica-Bold')
         .fontSize(32)
         .text('FACTURE', 0, 40, { align: 'right', width: doc.page.width - 50 })
         .fillColor('#888888')
         .font('Helvetica')
         .fontSize(10)
         .text(`Référence : ${invoiceNumber}`, 0, 80, { align: 'right', width: doc.page.width - 50 })
         .text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 0, 95, { align: 'right', width: doc.page.width - 50 });

      // Info Maison Anber (Gauche)
      const infoY = 180;
      doc.fillColor(goldColor)
         .font('Helvetica-Bold')
         .fontSize(16)
         .text('MAISON ANBER', 50, infoY)
         .fillColor(textColor)
         .font('Helvetica')
         .fontSize(11)
         .text('Boutique Officielle', 50, infoY + 25)
         .text('Créateur de Parfums', 50, infoY + 40)
         .text('contact@elhimass.fr', 50, infoY + 55);

      // Facturé à : (Droite)
      doc.rect(doc.page.width - 270, infoY - 15, 220, 100).fillAndStroke('#ffffff', '#eeeeee');
      
      doc.fillColor(goldColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('FACTURÉ À', doc.page.width - 250, infoY )
         .fillColor(textColor)
         .font('Helvetica-Bold')
         .fontSize(12)
         .text(`${formData.firstName} ${formData.lastName}`.toUpperCase(), doc.page.width - 250, infoY + 20)
         .font('Helvetica')
         .fontSize(10)
         .text(formData.address, doc.page.width - 250, infoY + 38)
         .text(`${formData.postalCode} ${formData.city}`, doc.page.width - 250, infoY + 52)
         .text(`Tél : ${formData.phone}`, doc.page.width - 250, infoY + 66);

      // Ligne de séparation
      doc.moveTo(50, 330).lineTo(doc.page.width - 50, 330).lineWidth(1).strokeColor('#eeeeee').stroke();

      // Tableau (En-tête) coloré
      const tableTop = 360;
      doc.rect(50, tableTop - 10, doc.page.width - 100, 30).fill(goldColor);
      
      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('DESCRIPTION', 60, tableTop)
         .text('CONT.', 270, tableTop)
         .text('QTÉ', 350, tableTop, { width: 50, align: 'center' })
         .text('PRIX UNIT.', 400, tableTop, { width: 70, align: 'right' })
         .text('TOTAL', 480, tableTop, { width: 60, align: 'right' });

      let y = tableTop + 35;
      doc.font('Helvetica');

      cartItemsSelected.forEach((item, index) => {
        const product = productsList.find(p => p.id === item.id);
        if (product) {
          const unitPrice = product.prices[item.size];
          const itemTotal = unitPrice * item.quantity;

          // Fond grisé altérnatif
          if (index % 2 !== 0) {
             doc.rect(50, y - 8, doc.page.width - 100, 25).fill('#f9f9f9');
          }

          doc.fillColor(textColor)
             .text(product.name, 60, y)
             .text(item.size, 270, y)
             .text(item.quantity.toString(), 350, y, { width: 50, align: 'center' })
             .text(`${unitPrice} €`, 400, y, { width: 70, align: 'right' })
             .font('Helvetica-Bold')
             .text(`${itemTotal} €`, 480, y, { width: 60, align: 'right' })
             .font('Helvetica');
          
          y += 25;
        }
      });

      doc.moveTo(50, y + 10).lineTo(doc.page.width - 50, y + 10).lineWidth(2).strokeColor('#eeeeee').stroke();

      // Total Calculation Box
      y += 30;
      doc.rect(doc.page.width - 250, y - 10, 200, 45).fill('#fcfbf9');
      
      doc.fillColor(textColor)
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('TOTAL À PAYER', doc.page.width - 230, y + 5)
         .fillColor(goldColor)
         .fontSize(16)
         .text(`${totalAmount} €`, 400, y + 3, { width: 130, align: 'right' });

      // Pied de page
      doc.fillColor('#999999')
         .fontSize(10)
         .font('Helvetica-Oblique')
         .text('La Maison Anber vous remercie de votre confiance. En cas de question, contactez notre service client.', 0, 780, { align: 'center', width: doc.page.width });
         
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Anber Backend is running' });
});

// Get products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Submit Order Route
app.post('/api/submit-order', async (req, res) => {
  try {
    const { formData, cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Le panier est vide' });
    }
    
    if (!formData || !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address) {
      return res.status(400).json({ error: 'Informations de contact manquantes' });
    }

    let totalAmount = 0;
    let itemsHtml = '';
    const attachments = [];

    // Ajouter le logo
    attachments.push({
      filename: 'logo.png',
      path: path.join(__dirname, '..', 'assets', 'logo', 'logo.png'),
      cid: 'logo_anber'
    });
    
    cartItems.forEach((item, index) => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        const itemTotal = product.prices[item.size] * item.quantity;
        totalAmount += itemTotal;
        
        let imageUrl = product.image;
        if(imageUrl.startsWith('./')) {
           imageUrl = imageUrl.substring(2);
        }

        const cid = `img_${index}`;
        attachments.push({
          filename: `product_${index}.jpg`,
          path: path.join(__dirname, '..', imageUrl),
          cid: cid
        });
        
        itemsHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; width: 100px;">
              <img src="cid:${cid}" alt="${product.name}" style="width: 80px; height: auto; border-radius: 4px; object-fit: cover; border: 1px solid #eee;" />
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
              <strong style="color: #b89758; font-size: 16px;">${product.name}</strong><br/>
              <span>Code Produit: ${product.id}</span><br>
              <span style="color: #666;">Contenance: ${item.size}</span>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">x ${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;"><strong>${itemTotal} €</strong></td>
          </tr>
        `;
      }
    });

    const mailOptions = {
      from: `"Boutique Anber" <${process.env.SMTP_USER}>`,
      to: 'contact@elhimass.fr',
      subject: `Nouvelle Commande de ${formData.firstName} ${formData.lastName}`,
      attachments: attachments,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #eee;">
          <div style="text-align: center; margin-bottom: 15px;">
             <img src="cid:logo_anber" alt="Anber" style="max-height: 80px; margin: 0 auto; border-radius: 5px;" />
          </div>
          <h2 style="color: #080808; text-align: center; border-bottom: 2px solid #b89758; padding-bottom: 10px;">Nouvelle Commande</h2>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; margin-top: 20px; border: 1px solid #eee;">
            <div style="padding-bottom: 10px; border-bottom: 1px solid #eee; margin-bottom: 15px;">
                <h3 style="color: #b89758; margin: 0; font-size: 18px;">Coordonnées du client</h3>
            </div>
            <p style="margin: 8px 0;"><strong>Nom :</strong> ${formData.firstName} ${formData.lastName}</p>
            <p style="margin: 8px 0;"><strong>Email :</strong> <a href="mailto:${formData.email}" style="color: #b89758;">${formData.email}</a></p>
            <p style="margin: 8px 0;"><strong>Téléphone :</strong> ${formData.phone}</p>
            <p style="margin: 8px 0;"><strong>Adresse :</strong> ${formData.address}, ${formData.postalCode} ${formData.city}</p>
            ${formData.message ? `<p style="margin: 8px 0;"><strong>Message/Instructions :</strong> <br/> <span style="color: #555;">${formData.message}</span></p>` : ''}
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; margin-top: 20px; border: 1px solid #eee;">
            <div style="padding-bottom: 10px; border-bottom: 1px solid #eee; margin-bottom: 15px;">
                <h3 style="color: #b89758; margin: 0; font-size: 18px;">Détails de la commande</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              ${itemsHtml}
              <tr>
                <td colspan="3" style="padding: 15px 10px; text-align: right; background-color: #fcfbf9;"><strong>Total à Payer:</strong></td>
                <td style="padding: 15px 10px; text-align: right; background-color: #fcfbf9;"><strong style="font-size: 18px; color: #b89758;">${totalAmount} €</strong></td>
              </tr>
            </table>
          </div>
          
          <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
            Cet email a été envoyé automatiquement depuis l'application e-commerce Anber.
          </p>
        </div>
      `
    };

    // Génération du PDF pour le client
    const invoiceBuffer = await createInvoice(formData, cartItems, products, totalAmount);

    const customerMailOptions = {
      from: `"Maison Anber" <${process.env.SMTP_USER}>`,
      to: formData.email,
      subject: `Confirmation de votre commande Anber - Merci ${formData.firstName} !`,
      attachments: [{
        filename: `Facture_Anber_${formData.lastName}.pdf`,
        content: invoiceBuffer
      }],
      html: `
        <div style="font-family: 'Times New Roman', Times, serif; color: #111; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 40px 30px; border: 1px solid #eee;">
          <h2 style="color: #080808; text-align: center; font-variant: small-caps; font-size: 30px; letter-spacing: 2px; margin-bottom: 30px;">Anber</h2>
          
          <p style="font-size: 16px; line-height: 1.8; color: #444;">
            Cher/Chère <strong>${formData.firstName}</strong>,<br><br>
            C'est avec un immense plaisir que nous vous confirmons la bonne réception de votre commande. Toute la Maison Anber vous remercie sincèrement pour la confiance que vous nous accordez.<br><br>
            Nos artisans préparent actuellement votre sélection olfactive avec la plus grande exigence. <strong>Notre service client de prestige va vous contacter très rapidement par téléphone</strong> (au ${formData.phone}) afin de finaliser les détails de votre livraison et répondre à toutes vos interrogations avec l'attention que vous méritez.<br><br>
            En attendant de parer votre peau de nos fragrances, nous restons à votre entière disposition.<br><br>
            À très bientôt,
          </p>
          
          <p style="font-size: 18px; color: #b89758; margin-top: 40px; font-style: italic;">
            L'équipe Anber
          </p>
        </div>
      `
    };

    if(process.env.SMTP_HOST && process.env.SMTP_USER && !process.env.SMTP_HOST.includes('smtp.example.com')) {
      await transporter.sendMail(mailOptions);
      await transporter.sendMail(customerMailOptions);
      console.log(`Commande et remerciements envoyés par email pour ${formData.firstName} ${formData.lastName}`);
    } else {
      console.warn("⚠️ AVERTISSEMENT : Les emails n'ont pas pu être envoyés");
    }

    res.json({ success: true, message: 'Votre commande a bien été enregistrée. Notre service client vous contactera très prochainement au ' + formData.phone + '.' });

  } catch (error) {
    console.error('Submit order error:', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la transmission de votre commande. Veuillez réessayer ou nous appeler directement.' });
  }
});

// Start server
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Anber Backend server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);

  // Check API configuration
  const smtpConfigured = process.env.SMTP_HOST && !process.env.SMTP_HOST.includes('smtp.example.com');
  
  if(smtpConfigured) {
    console.log('✅ Configuration SMTP pour l\'envoi de mail: Configuré');
  } else {
    console.log('❌ Configuration SMTP pour l\'envoi de mail: Non configuré (Les mails seront simulés dans la console)');
    console.log('⚠️ Veuillez configurer SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT dans backend/.env');
  }
});