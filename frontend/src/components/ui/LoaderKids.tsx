import { FaBirthdayCake } from "react-icons/fa";
import { motion } from "framer-motion";

interface LoaderKidsProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export function LoaderKids({
  className = "",
  size = 'medium',
  message = "Cargando tu invitación..."
}: LoaderKidsProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'text-4xl';
      case 'large': return 'text-8xl';
      default: return 'text-6xl';
    }
  };

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center z-50 ${className}`}>
      <motion.div
        className="flex flex-col items-center"
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.4, type: "spring" }}
      >
        <FaBirthdayCake
          className={`text-pink-500 animate-bounce-soft ${getSizeClasses()}`}
        />
        {message && (
          <p className="mt-4 text-purple-600 font-medium text-lg animate-pulse">
            {message}
          </p>
        )}
      </motion.div>

      <style jsx>{`
        @keyframes bounce-soft {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          25% {
            transform: translateY(-10px) scale(1.05);
            opacity: 0.9;
          }
          50% {
            transform: translateY(-20px) scale(1.1);
            opacity: 0.8;
          }
          75% {
            transform: translateY(-10px) scale(1.05);
            opacity: 0.9;
          }
        }

        .animate-bounce-soft {
          animation: bounce-soft 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default LoaderKids;