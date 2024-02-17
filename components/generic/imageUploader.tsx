'use client';
import LoadingSpinner from './loadingSpinner';
import { handleUpload } from '@/lib/cloudinary';
import { cn } from '@/lib/helpers';
import { ChangeEvent, useRef, useState } from 'react';
import Image from 'next/image';
import { SparklesIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/solid';

interface ImageUploaderProps {
  setIcon: (icon: string) => void;
  icon?: string;
  path?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  context?: object;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  setIcon,
  icon,
  path,
  disabled = false,
  className,
  children,
  context = null,
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

  const onGenerateImage = async () => {
    console.log('Generating image');
    if (isLoading || !context) return;
    console.log(context);
    setIsLoading(true);
    const response = await fetch('/api/createImage', {
      method: 'POST',
      body: JSON.stringify({ sheet: context }),
    });
    const data = await response.json();
    console.log(data);
    setIcon(data);
    setIsLoading(false);
  };

  return (
    <div className="relative inline-block">
      <input
        type="file"
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
        <div
          className={`relative h-32 w-32 ${className}`}
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
        >
          <Image
            src={icon || '/blank_user.png'}
            alt="Upload Image"
            height={128}
            width={128}
            className={cn('rounded-full object-cover', {
              'cursor-pointer': !disabled,
            })}
          />
          {children ? (
            <div className="absolute inset-0 flex items-center justify-between opacity-0 transition-opacity duration-200 hover:opacity-100">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-black bg-opacity-40 hover:bg-opacity-20">
                {children}
              </div>
            </div>
          ) : (
            !disabled && (
              <div className="absolute inset-0 flex items-center justify-between opacity-0 transition-opacity duration-200 hover:opacity-100">
                <div
                  className="flex h-full w-1/2 items-center justify-center rounded-l-full bg-black bg-opacity-40 transition-opacity hover:bg-opacity-20"
                  onClick={() => !disabled && fileInputRef.current?.click()}
                >
                  <ArrowUpOnSquareIcon className="h-6 w-6" />
                </div>
                <div
                  className="flex h-full w-1/2 items-center justify-center rounded-r-full bg-black bg-opacity-40 transition-opacity hover:bg-opacity-20"
                  onClick={() => !disabled && onGenerateImage()}
                >
                  <SparklesIcon className="h-6 w-6" />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
