/**
 * Script de migration : de `uploads/documents` vers GridFS.
 * Usage: node scripts/migrateToGridFS.js
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Document = require('../src/models/Document');
const gridfsService = require('../src/services/gridfsService');
const connectDB = require('../src/config/database');

async function migrate() {
  await connectDB();
  const uploadDir = path.join(__dirname, '../uploads/documents');
  if (!fs.existsSync(uploadDir)) {
    console.log('Aucun dossier uploads/documents trouve.');
    process.exit(0);
  }

  const files = fs.readdirSync(uploadDir);
  for (const fileName of files) {
    try {
      const filePath = path.join(uploadDir, fileName);
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) continue;

      const buffer = fs.readFileSync(filePath);
      const uploaded = await gridfsService.uploadBuffer({ buffer, filename: fileName, contentType: 'application/octet-stream' });

      // Update associated Document records that reference this filename
      const docs = await Document.find({ nomStocke: fileName });
      for (const doc of docs) {
        doc.gridFsId = uploaded._id;
        doc.url = `/api/v1/documents/stream/${uploaded._id}`;
        doc.chemin = null;
        await doc.save();
      }

      // remove file
      fs.unlinkSync(filePath);
      console.log(`Migrated ${fileName} -> ${uploaded._id}`);
    } catch (err) {
      console.error('Erreur migration', fileName, err);
    }
  }

  console.log('Migration termine.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
