'use client';

/**
 * Compatibility helpers that now target the unified storage API.
 * The backing provider can be Garage or Cloudinary depending on env config.
 */

export const handleUpload = async (file: File, path?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (path) formData.append('path', path);

  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Upload failed');
  }

  const data = await response.json();
  return data.url as string;
};

export const handleUploadFromUrl = async (imageUrl: string, path?: string) => {
  const response = await fetch('/api/storage/upload-from-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: imageUrl, path }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Upload failed');
  }

  const data = await response.json();
  return data.url as string;
};
