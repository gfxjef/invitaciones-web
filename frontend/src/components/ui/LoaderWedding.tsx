import { IoIosHeart } from "react-icons/io";

interface LoaderWeddingProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export function LoaderWedding({
  className = "",
  size = 'medium',
  message
}: LoaderWeddingProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 40;
      case 'large': return 80;
      default: return 60;
    }
  };
  return (
    <div className={`fixed inset-0 bg-white flex items-center justify-center z-50 ${className}`}>
      <div className="flex flex-col items-center">
        <IoIosHeart
          className="text-red-500 animate-pulse-smooth"
          size={getSizeClasses()}
        />
        {message && (
          <p className="mt-4 text-gray-600 font-medium text-lg animate-pulse">
            {message}
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse-smooth {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }

        .animate-pulse-smooth {
          animation: pulse-smooth 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default LoaderWedding;