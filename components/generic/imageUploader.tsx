'use client';
import { LLM_FEATURES_ENABLED } from '@/lib/features';
import { uploadImage } from '@/lib/storage/client';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ChangeEvent, FC, ReactNode, useRef, useState } from 'react';
import Icon from './icon/icon';
import LoadingSpinner from './loadingSpinner';

interface ImageUploaderProps {
  setIcon: (icon: string) => void;
  icon?: string;
  path?: string;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  context?: object;
  localOnly?: boolean;
}

const ImageUploader: FC<ImageUploaderProps> = ({
  setIcon,
  icon,
  path,
  disabled = false,
  className,
  children,
  context = null,
  localOnly = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const llmDisabled = localOnly || !LLM_FEATURES_ENABLED;

  const readLocalImage = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === 'string'
          ? resolve(reader.result)
          : reject(new Error('Could not read image file'));
      reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    try {
      const file = e.target.files ? e.target.files[0] : null;
      if (file) {
        if (localOnly) {
          const url = await readLocalImage(file);
          setIcon(url);
          return;
        }
        const url = await uploadImage(file, path);
        setIcon(url);
      }
    } catch (error) {
      console.error('Image upload failed', error);
    } finally {
      setIsLoading(false);
    }
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
    <div className={cn('relative inline-block', className)}>
      <input
        type="file"
        accept="image/*"
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
        <div className="relative h-32 w-32 overflow-hidden rounded-full">
          <Image
            src={icon || '/blank_user.png'}
            alt="Upload Image"
            fill
            sizes="128px"
            unoptimized={icon?.startsWith('blob:') || icon?.startsWith('data:')}
            className={cn('h-full w-full object-cover', {
              'cursor-pointer': !disabled,
            })}
          />
          {children ? (
            <div className="absolute inset-0 flex items-center justify-between opacity-0 transition-opacity duration-200 hover:opacity-100">
              <div className="bg-opacity-40 hover:bg-opacity-20 flex h-full w-full items-center justify-center rounded-full bg-neutral-900">
                {children}
              </div>
            </div>
          ) : (
            !disabled && (
              <div className="absolute inset-0 flex items-center justify-between opacity-0 transition-opacity duration-200 hover:opacity-100">
                <div
                  className={cn(
                    'bg-opacity-40 hover:bg-opacity-20 flex h-full items-center justify-center bg-neutral-900 transition-opacity',
                    localOnly ? 'w-full rounded-full' : 'w-1/2 rounded-l-full',
                  )}
                  onClick={() => !disabled && fileInputRef.current?.click()}
                  title={localOnly ? 'Upload local portrait' : 'Upload image'}
                >
                  <Icon icon="upload" />
                </div>
                {!localOnly && (
                  <div
                    className={cn(
                      'bg-opacity-40 hover:bg-opacity-20 flex h-full w-1/2 items-center justify-center rounded-r-full bg-neutral-900 transition-opacity',
                      llmDisabled &&
                        'hover:bg-opacity-40 cursor-not-allowed opacity-40',
                    )}
                    onClick={() => {
                      if (llmDisabled || disabled) return;
                      void onGenerateImage();
                    }}
                    title={
                      llmDisabled
                        ? 'LLM features are temporarily disabled'
                        : 'Generate portrait'
                    }
                  >
                    <Icon
                      icon="sparkles"
                      className={cn(llmDisabled && 'text-stone-400')}
                    />
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
