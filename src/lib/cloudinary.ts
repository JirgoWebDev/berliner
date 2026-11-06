import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 1. If Cloudinary credentials are set, upload there
  if (hasCloudinary) {
    try {
      const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'moda-berliner' },
          (error, result) => {
            if (error) return reject(error);
            if (!result?.secure_url) return reject(new Error('Cloudinary secure_url missing'));
            resolve(result.secure_url);
          }
        );
        uploadStream.end(buffer);
      });
      return cloudinaryUrl;
    } catch (err) {
      console.warn('Cloudinary upload failed, checking next storage option:', err);
    }
  }

  // 2. If Vercel Blob is configured (BLOB_READ_WRITE_TOKEN)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const rawExt = path.extname(file.name || '');
      const ext = rawExt || (file.type ? `.${file.type.split('/')[1]}` : '.jpg');
      const cleanBaseName = path.basename(file.name || 'image', rawExt).replace(/[^a-zA-Z0-9-_]/g, '_');
      const filename = `berliner/${cleanBaseName}-${Date.now()}${ext}`;
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: file.type || 'image/jpeg',
      });
      return blob.url;
    } catch (err) {
      console.warn('Vercel Blob upload failed, falling back to local file storage:', err);
    }
  }

  // 3. Save directly to public/uploads directory (ideal for local development)
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const rawExt = path.extname(file.name || '');
    const ext = rawExt || (file.type ? `.${file.type.split('/')[1]}` : '.jpg');
    const cleanBaseName = path.basename(file.name || 'image', rawExt).replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${cleanBaseName}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.warn('Local file write failed (likely serverless environment), falling back to Base64:', err);
  }

  // 4. Fallback: Convert to Base64 Data URL if file system is read-only
  const mimeType = file.type || 'image/jpeg';
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}
