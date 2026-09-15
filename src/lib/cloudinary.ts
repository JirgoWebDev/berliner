import { v2 as cloudinary } from 'cloudinary';

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

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
      console.warn('Cloudinary upload failed, falling back to Base64:', err);
    }
  }

  // Fallback: Convert to Base64 Data URL so image upload works seamlessly without external services
  const mimeType = file.type || 'image/jpeg';
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}
