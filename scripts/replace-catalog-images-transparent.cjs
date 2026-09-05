const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Client } = require(path.join(__dirname, '../node_modules/.pnpm/pg@8.20.0/node_modules/pg'));
require('dotenv').config();

const SOURCE_DIR = '/home/ale/Descargas/removebackgrounds-images-1788469440278';
const PUBLIC_MEDIA_DIR = path.join(__dirname, '../public/media');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kbzfhqmagzmtlgtolioa.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'media';

async function uploadFile(filename, buffer, mimeType) {
  const cleanFilename = path.basename(filename);
  const endpoint = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${cleanFilename}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': mimeType,
      'x-upsert': 'true',
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`❌ Upload failed for ${cleanFilename}: ${res.status} ${text}`);
    return false;
  }
  console.log(`✓ Supabase uploaded: ${cleanFilename} (${buffer.length} bytes)`);
  return true;
}

async function run() {
  const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();
  console.log('✓ Connected to PostgreSQL');

  for (let i = 1; i <= 8; i++) {
    const srcFile = path.join(SOURCE_DIR, `articulo${i}_no_bg.png`);
    if (!fs.existsSync(srcFile)) {
      console.warn(`File not found: ${srcFile}`);
      continue;
    }

    console.log(`\n========================================`);
    console.log(`Processing articulo ${i}...`);

    // 1. Trim transparent padding
    const trimmedBuffer = await sharp(srcFile).trim().toBuffer();

    // 2. Add proportional breathing room (padding 40px)
    const paddedMaster = await sharp(trimmedBuffer)
      .extend({
        top: 40,
        bottom: 40,
        left: 40,
        right: 40,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ quality: 100 })
      .toBuffer();

    const masterMeta = await sharp(paddedMaster).metadata();
    const masterFilename = `articulo${i}.png`;
    const masterLocalPath = path.join(PUBLIC_MEDIA_DIR, masterFilename);
    fs.writeFileSync(masterLocalPath, paddedMaster);

    // 3. Generate responsive WebP variants with full alpha transparency
    const thumbnailBuffer = await sharp(paddedMaster)
      .resize(400, 500, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 92 })
      .toBuffer();
    const thumbFilename = `articulo${i}-400x500.webp`;
    fs.writeFileSync(path.join(PUBLIC_MEDIA_DIR, thumbFilename), thumbnailBuffer);

    const cardBuffer = await sharp(paddedMaster)
      .resize(800, 1000, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 92 })
      .toBuffer();
    const cardFilename = `articulo${i}-800x1000.webp`;
    fs.writeFileSync(path.join(PUBLIC_MEDIA_DIR, cardFilename), cardBuffer);

    const heroBuffer = await sharp(paddedMaster)
      .resize(1920, 1080, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 92 })
      .toBuffer();
    const heroFilename = `articulo${i}-1920x1080.webp`;
    fs.writeFileSync(path.join(PUBLIC_MEDIA_DIR, heroFilename), heroBuffer);

    const ogBuffer = await sharp(paddedMaster)
      .resize(1200, 630, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 92 })
      .toBuffer();
    const ogFilename = `articulo${i}-1200x630.webp`;
    fs.writeFileSync(path.join(PUBLIC_MEDIA_DIR, ogFilename), ogBuffer);

    // Also update public/media/articulo{i}.jpeg with the transparent WebP/PNG so legacy links work
    fs.writeFileSync(path.join(PUBLIC_MEDIA_DIR, `articulo${i}.jpeg`), cardBuffer);

    // 4. Upload to Supabase Storage
    await uploadFile(masterFilename, paddedMaster, 'image/png');
    await uploadFile(thumbFilename, thumbnailBuffer, 'image/webp');
    await uploadFile(cardFilename, cardBuffer, 'image/webp');
    await uploadFile(heroFilename, heroBuffer, 'image/webp');
    await uploadFile(ogFilename, ogBuffer, 'image/webp');
    await uploadFile(`articulo${i}.jpeg`, cardBuffer, 'image/webp');

    // 5. Update PostgreSQL Media row (id: 40 + i)
    const mediaId = 40 + i;
    const query = `
      UPDATE media
      SET
        filename = $1,
        mime_type = 'image/png',
        filesize = $2,
        width = $3,
        height = $4,
        url = $5,
        sizes_thumbnail_filename = $6,
        sizes_thumbnail_mime_type = 'image/webp',
        sizes_thumbnail_filesize = $7,
        sizes_thumbnail_width = 400,
        sizes_thumbnail_height = 500,
        sizes_thumbnail_url = $8,
        sizes_card_filename = $9,
        sizes_card_mime_type = 'image/webp',
        sizes_card_filesize = $10,
        sizes_card_width = 800,
        sizes_card_height = 1000,
        sizes_card_url = $11,
        sizes_hero_filename = $12,
        sizes_hero_mime_type = 'image/webp',
        sizes_hero_filesize = $13,
        sizes_hero_width = 1920,
        sizes_hero_height = 1080,
        sizes_hero_url = $14,
        sizes_og_filename = $15,
        sizes_og_mime_type = 'image/webp',
        sizes_og_filesize = $16,
        sizes_og_width = 1200,
        sizes_og_height = 630,
        sizes_og_url = $17,
        updated_at = NOW()
      WHERE id = $18;
    `;

    const values = [
      masterFilename,
      paddedMaster.length,
      masterMeta.width,
      masterMeta.height,
      `/api/media/file/${masterFilename}`,
      thumbFilename,
      thumbnailBuffer.length,
      `/api/media/file/${thumbFilename}`,
      cardFilename,
      cardBuffer.length,
      `/api/media/file/${cardFilename}`,
      heroFilename,
      heroBuffer.length,
      `/api/media/file/${heroFilename}`,
      ogFilename,
      ogBuffer.length,
      `/api/media/file/${ogFilename}`,
      mediaId,
    ];

    const updateRes = await pgClient.query(query, values);
    console.log(`✓ Updated DB media row #${mediaId} (${updateRes.rowCount} row)`);
  }

  await pgClient.end();
  console.log('\n🎉 Sincronización de imágenes transparentes completada exitosamente!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
