import LoadingSpinner from './loadingSpinner';
import { ChangeEvent, useRef, useState } from 'react';
import Image from 'next/image';
interface ImageUploaderProps {
  setIcon: React.Dispatch<React.SetStateAction<string>>;
  icon?: string;
  path?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  setIcon,
  icon,
  path,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
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
      if (data.url) setIcon(data.url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setIsLoading(false);
  };
  return (
    <>
      <input
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      {isLoading ? (
        <div className="h-32 w-32 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <Image
          src={icon ? icon : '/blank_user.png'}
          alt={'Upload Image'}
          width={128}
          height={128}
          onClick={() => {
            fileInputRef.current?.click();
          }}
        />
      )}
    </>
  );
};

export default ImageUploader;
