import { useRef } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableAvatarProps {
  src?: string | null;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  onFileSelect?: (file: File) => void;
  className?: string;
  editable?: boolean;
}

const sizeClasses = {
  sm: "w-14 h-14 text-base",
  md: "w-20 h-20 text-xl",
  lg: "w-24 h-24 text-2xl",
};

const pencilSizeClasses = {
  sm: "w-5 h-5 p-0.5",
  md: "w-6 h-6 p-1",
  lg: "w-7 h-7 p-1",
};

const pencilIconSizes = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

const EditableAvatar = ({
  src,
  fallback = "?",
  size = "md",
  onFileSelect,
  className,
  editable = true,
}: EditableAvatarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFileSelect?.(file);
    }
    // Reset input so re-selecting the same file works
    e.target.value = "";
  };

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold overflow-hidden",
          sizeClasses[size]
        )}
      >
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span>{fallback}</span>
        )}
      </div>

      {editable && onFileSelect && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "absolute top-0 left-0 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:bg-primary-hover transition-colors z-10",
              pencilSizeClasses[size]
            )}
            title="Alterar foto"
          >
            <Pencil className={pencilIconSizes[size]} />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </>
      )}
    </div>
  );
};

export default EditableAvatar;
