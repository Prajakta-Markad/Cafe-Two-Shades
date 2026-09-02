interface PhotoCardProps {
    src: string;
    alt: string;
  }
  
  export default function PhotoCard({
    src,
    alt,
  }: PhotoCardProps) {
    return (
      <div className="group overflow-hidden rounded-2xl">
        <img
            src={src}
            alt={alt}
            width="600"
            height="600"
            loading="lazy"
            className="
                aspect-square
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
            "
        />
      </div>
    );
  }