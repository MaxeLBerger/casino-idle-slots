import { forwardRef, ImgHTMLAttributes } from 'react';
import { getAssetPath, cn } from '@/lib/utils';

interface AssetImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Asset path starting with /assets/ or assets/ */
  src: string;
  /** Fallback to show if image fails to load */
  fallback?: string;
}

/**
 * AssetImage - A wrapper for images that automatically handles
 * the correct asset path for both development and production.
 * 
 * Usage:
 * <AssetImage src="/assets/ui_items/ui_coin.png" alt="Coin" />
 * 
 * This component will automatically prepend the correct base path
 * in production (/CasinoIdleSlots/) while working normally in development.
 */
export const AssetImage = forwardRef<HTMLImageElement, AssetImageProps>(
  ({ src, alt, className, fallback, onError, ...props }, ref) => {
    const resolvedSrc = getAssetPath(src);
    
    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (fallback) {
        (e.target as HTMLImageElement).src = getAssetPath(fallback);
      }
      onError?.(e);
    };

    return (
      <img
        ref={ref}
        src={resolvedSrc}
        alt={alt || ''}
        className={cn(className)}
        onError={handleError}
        {...props}
      />
    );
  }
);

AssetImage.displayName = 'AssetImage';

export default AssetImage;