import { ChangeEvent, useRef } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  setIcon: React.Dispatch<React.SetStateAction<string>>;
  icon?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ setIcon, icon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      await handleUpload(file);
    }
  };
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESETS ||
        'fate_core_charachters',
    );
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );
      const data = await response.json();
      if (data.url) setIcon(data.url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  return (
    <>
      <input
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <Image
        src={icon ? icon : '/blank_user.png'}
        alt={'Upload Image'}
        width={128}
        height={128}
        onClick={() => {
          fileInputRef.current?.click();
        }}
      />
    </>
  );
};

export default ImageUploader;
