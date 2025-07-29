import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useLazyImage } from "@/hooks/usePerformance";
import { ImageOff } from "lucide-react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide" | number;
  priority?: boolean; // For above-the-fold images
}

/**
 * Lazy loading image component with intersection observer
 * Optimizes performance by only loading images when they enter the viewport
 */
export const LazyImage = forwardRef<HTMLImageElement, LazyImageProps>(
  (
    {
      src,
      alt,
      placeholder,
      fallback,
      className,
      containerClassName,
      aspectRatio,
      priority = false,
      ...props
    },
    ref
  ) => {
    const [hasError, setHasError] = useState(false);
    const { elementRef, imageSrc, isLoaded, isError } = useLazyImage(
      src,
      placeholder
    );

    const handleError = () => {
      setHasError(true);
    };

    const aspectRatioClass = {
      square: "aspect-square",
      video: "aspect-video",
      portrait: "aspect-[3/4]",
      wide: "aspect-[16/9]",
    };

    const getAspectRatioStyle = () => {
      if (typeof aspectRatio === "number") {
        return { aspectRatio: aspectRatio.toString() };
      }
      return {};
    };

    // For priority images (above the fold), load immediately
    const shouldLoadImmediately = priority;
    const displaySrc = shouldLoadImmediately ? src : imageSrc;

    return (
      <div
        ref={elementRef as React.RefObject<HTMLDivElement>}
        className={cn(
          "relative overflow-hidden bg-gray-100",
          typeof aspectRatio === "string" && aspectRatioClass[aspectRatio],
          containerClassName
        )}
        style={getAspectRatioStyle()}
      >
        {/* Error fallback */}
        {(hasError || isError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            {fallback || (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <ImageOff className="h-8 w-8 mb-2" />
                <span className="text-sm">Failed to load image</span>
              </div>
            )}
          </div>
        )}

        {/* Loading placeholder */}
        {!isLoaded && !hasError && !isError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
          </div>
        )}

        {/* Actual image */}
        {displaySrc && !hasError && !isError && (
          <img
            ref={ref}
            src={displaySrc}
            alt={alt}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              isLoaded || shouldLoadImmediately ? "opacity-100" : "opacity-0",
              className
            )}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            {...props}
          />
        )}

        {/* Overlay for loading state */}
        {!isLoaded && displaySrc && !hasError && !isError && (
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        )}
      </div>
    );
  }
);

LazyImage.displayName = "LazyImage";

/**
 * Avatar component with lazy loading
 */
interface LazyAvatarProps extends Omit<LazyImageProps, "aspectRatio"> {
  size?: "sm" | "md" | "lg" | "xl";
  fallbackText?: string;
}

export const LazyAvatar = ({
  size = "md",
  fallbackText,
  className,
  ...props
}: LazyAvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const fallback = fallbackText ? (
    <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
      {fallbackText.charAt(0).toUpperCase()}
    </div>
  ) : undefined;

  return (
    <LazyImage
      {...props}
      fallback={fallback}
      containerClassName={cn(
        "rounded-full",
        sizeClasses[size],
        props.containerClassName
      )}
      className={cn("rounded-full", className)}
    />
  );
};

/**
 * Hero image component optimized for above-the-fold content
 */
export const HeroImage = (props: LazyImageProps) => (
  <LazyImage
    {...props}
    priority={true}
    aspectRatio="wide"
    className={cn("object-cover", props.className)}
  />
);

/**
 * Card image component with consistent aspect ratio
 */
export const CardImage = (props: LazyImageProps) => (
  <LazyImage
    {...props}
    aspectRatio="video"
    className={cn("object-cover", props.className)}
  />
);