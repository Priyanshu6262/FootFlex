const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Product = require('../../models/Product');
const Knowledge = require('../../models/Knowledge');
const { generateEmbedding } = require('./embeddings');

async function runIngestion() {
  console.log('--- Starting FootFlex RAG Data Ingestion ---');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/footflex';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for ingestion.');

  // Clear existing Knowledge documents to re-index cleanly
  await Knowledge.deleteMany({});
  console.log('Cleared existing Knowledge documents.');

  let ingestedCount = 0;

  // 1. Ingest Static Policy Documents
  const policiesDir = path.join(__dirname, 'policies');
  if (fs.existsSync(policiesDir)) {
    const files = fs.readdirSync(policiesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const filePath = path.join(policiesDir, file);
        const policyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log(`Ingesting policy: ${policyData.title}...`);

        const textToEmbed = `Policy Title: ${policyData.title}\nCategory: ${policyData.category || 'Policy'}\nDetails: ${policyData.content}`;
        const embedding = await generateEmbedding(textToEmbed);

        await Knowledge.create({
          docType: 'policy',
          title: policyData.title,
          category: policyData.category || 'Policy',
          content: policyData.content,
          metadata: { file },
          embedding
        });

        ingestedCount++;

        // Ingest individual FAQs for high-precision RAG question matching
        if (Array.isArray(policyData.faqs) && policyData.faqs.length > 0) {
          for (const faq of policyData.faqs) {
            const faqContent = `Question: ${faq.question}\nAnswer: ${faq.answer}\n(Policy Context: ${policyData.title})`;
            const faqEmbedding = await generateEmbedding(`Question: ${faq.question} ${faq.answer}`);

            await Knowledge.create({
              docType: 'policy',
              title: `${policyData.title} - Q: ${faq.question}`,
              category: policyData.category || 'Policy FAQ',
              content: faqContent,
              metadata: { file, isFaq: true, question: faq.question },
              embedding: faqEmbedding
            });

            ingestedCount++;
          }
        }
      } catch (err) {
        console.error(`Failed to ingest policy file ${file}:`, err.message);
      }
    }
  }

  // 2. Ingest FootFlex Products from DB
  const products = await Product.find().lean();
  console.log(`Found ${products.length} products to index in Knowledge store.`);

  for (const product of products) {
    try {
      console.log(`Ingesting product: ${product.name}...`);

      const inventoryStr = product.inventory && product.inventory.length > 0
        ? product.inventory.map(i => `Size ${i.size}, Color ${i.color} (${i.quantity} in stock)`).join('; ')
        : 'Out of stock';

      const content = `Product Name: ${product.name}
Category: ${product.category}
Gender: ${product.gender}
Price: ₹${product.price} (Discount: ${product.discount || 0}%)
Coupon: ${product.coupon || 'None'}
Available Inventory & Sizes: ${inventoryStr}
Image URL: ${product.imageUrl}`;

      const embedding = await generateEmbedding(`${product.name} ${product.category} ${product.gender} ${content}`);

      await Knowledge.create({
        docType: 'product',
        refId: String(product._id),
        title: product.name,
        category: product.category,
        gender: product.gender,
        price: product.price,
        content,
        metadata: {
          productId: String(product._id),
          imageUrl: product.imageUrl,
          discount: product.discount,
          coupon: product.coupon,
          inventory: product.inventory
        },
        embedding
      });

      ingestedCount++;
    } catch (err) {
      console.error(`Failed to ingest product ${product.name}:`, err.message);
    }
  }

  console.log(`Ingestion completed successfully! Total indexed documents: ${ingestedCount}`);
  await mongoose.disconnect();
  process.exit(0);
}

runIngestion().catch(err => {
  console.error('Ingestion Fatal Error:', err);
  process.exit(1);
});
