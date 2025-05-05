import React, { FC, useState } from 'react';
import Label from 'components/atoms/Label';
import Spinner from 'components/atoms/Spinner/Spinner';
import { EmptyLogoIcon, PictureIcon, UserIcon } from 'components/atoms/Icons/Icons';
// import { isImage } from 'utils/app.utils';
// import toastNotifications from 'utils/toastNotifications.utils';
// import { useIntl } from 'react-intl';

export enum AvatarSize {
  Small,
  Medium,
  Large,
}

export interface AvatarProps {
    image?: File | null;
    src?: string;
    onImageChange?: (file: File | null) => void;
    onImageError?: () => void;
    isCacheDisabled?: boolean;
    usersAvatar?: boolean;
    isEditable?: boolean;
    avatarSize?: AvatarSize;
    id?: string;
}

const Avatar: FC<AvatarProps> = ({
    id,
    image, 
    src,
    onImageChange = () => {}, 
    onImageError = () => {},
    isCacheDisabled = false,
    usersAvatar = false,
    isEditable = true,
    avatarSize = AvatarSize.Large,
    ...props 
}) => {
    // const { formatMessage } = useIntl();
    const inputId = id || crypto.randomUUID();
    const [selectedImage, setSelectedImage] = useState<File | null>(image || null);
    const imageUrl = selectedImage 
        ? URL.createObjectURL(selectedImage) 
        : isCacheDisabled 
            ? `${src}?lastmod=${Date.now()}` 
            : src;

    const [imageExists, setImageExists] = useState<boolean>(true);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;

      // if (!isImage(file)) {
      //   toastNotifications.error(formatMessage({ id: 'image.type.validation.error'}));
      //   return;
      // }

      setSelectedImage(file);
      onImageChange?.(file);
    };
    
    const isImageVisible = (!!imageUrl && imageExists) || !!selectedImage;
    const [isLoading, setIsLoading] = useState<boolean>(isImageVisible);
    const getAvatarSize = (avatarSize: AvatarSize) => {
      switch (avatarSize) {
        case AvatarSize.Small:
          return 'w-[30px] h-[30px]';
        case AvatarSize.Medium:
          return 'w-[60px] h-[60px]';
        case AvatarSize.Large:
          return 'w-[125px] h-[125px]';
      }
    };

    return (
      <div
        className={`${getAvatarSize(avatarSize)} flex flex-col items-center border-gradient-primary !rounded-full before:!rounded-full p-0`}
        {...props}
      >
        <div className={`relative ${getAvatarSize(avatarSize)} rounded-full overflow-hidden`}>
          {isImageVisible ? (
            <img
              src={imageUrl}
              alt=''
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                console.log('users_avatar', usersAvatar);
                // if (usersAvatar) {
                //   console.log('usersAvatar', usersAvatar);

                //   currentTarget.src = '/empty_profile_image.webp';
                //   console.log('isLoading', isLoading);
                // }
                onImageError();
                setImageExists(false);
                setIsLoading(false);
              }}
              onLoad={() => setIsLoading(false)}
              onLoadStart={() => setIsLoading(true)}
              className={`flex items-center justify-center object-cover w-full h-full text-light-primary ${isLoading ? 'invisible' : ''}`}
            />
          ) : (
            <div className='flex items-center justify-center w-full h-full'>
              {usersAvatar ? (
                <UserIcon
                  className={`${avatarSize === AvatarSize.Large && 'size-16'} ${avatarSize === AvatarSize.Medium && 'size-8'} ${avatarSize === AvatarSize.Small && 'size-4'} text-white`}
                />
              ) : (
                // <UserIcon
                //   className={`${avatarSize === AvatarSize.Large && 'size-16'} ${avatarSize === AvatarSize.Medium && 'size-8'} ${avatarSize === AvatarSize.Small && 'size-4'} text-white`}
                // />
                <PictureIcon
                  className={`${avatarSize === AvatarSize.Large && 'size-16'} ${avatarSize === AvatarSize.Medium && 'size-8'} ${avatarSize === AvatarSize.Small && 'size-4'} text-white`}
                />
              )}
            </div>
          )}

          {isLoading && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Spinner centerScreen={false} />
            </div>
          )}

          {isEditable && (
            <>
              <Label
                htmlFor={`avatar_upload_${inputId}`}
                className={`absolute inset-0 flex items-center justify-center ${imageExists ? 'm-0' : 'm-0.5'} transition-opacity duration-300 bg-black bg-opacity-50 rounded-full opacity-0 cursor-pointer hover:opacity-100`}
              >
                {/* <span className='text-sm text-white'>
                  {selectedImage || imageExists
                    ? formatMessage({ id: 'change.photo' })
                    : formatMessage({ id: 'add.photo' })}
                </span> */}
                <span className='text-sm text-white select-none'>
                  {selectedImage || imageExists ? 'Change photo' : 'Add photo'}
                </span>
              </Label>
              <input
                id={`avatar_upload_${inputId}`}
                type='file'
                accept='image/*'
                hidden
                onChange={handleImageChange}
              />
            </>
          )}
        </div>
      </div>
    );
};

export default Avatar;
