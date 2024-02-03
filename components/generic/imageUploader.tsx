'use client';
import LoadingSpinner from './loadingSpinner';
import { handleUpload } from '@/lib/cloudinary';
import { cn } from '@/lib/helpers';
import { ChangeEvent, useRef, useState } from 'react';
import Image from 'next/image';
interface ImageUploaderProps {
  setIcon: (icon: string) => void;
  icon?: string;
  path?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  setIcon,
  icon,
  path,
  disabled = false,
  className,
  children,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const url = await handleUpload(file, path);
      setIcon(url);
    }
    setIsLoading(false);
  };
  return (
    <div className="flex">
      <input
        type="file"
        name="icon"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        disabled={disabled}
      />
      {isLoading ? (
        <div className="flex size-32 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <Image
          src={icon ? icon : '/blank_user.png'}
          alt={'Upload Image'}
          width={128}
          height={128}
          className={cn(
            'rounded-full',
            {
              'cursor-pointer transition-opacity duration-200 hover:opacity-80':
                !disabled,
            },
            className,
          )}
          onClick={() => {
            if (!disabled) {
              fileInputRef.current?.click();
            }
          }}
        />
      )}
      {children}
    </div>
  );
};

export default ImageUploader;
