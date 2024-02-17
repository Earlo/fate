export const handleUpload = async (file: File, path?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'upload_preset',
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESETS || 'fate_core_characters',
  );
  if (path) {
    formData.append('folder', path);
  }
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

export const handleUploadFromUrl = async (imageUrl: string, path?: string) => {
  const formData = new FormData();
  formData.append('file', imageUrl);
  formData.append(
    'upload_preset',
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESETS || 'fate_core_characters',
  );
  if (path) {
    formData.append('folder', path);
  }
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
