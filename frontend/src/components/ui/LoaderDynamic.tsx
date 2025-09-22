import { LoaderWedding } from './LoaderWedding';
import { LoaderKids } from './LoaderKids';

interface LoaderDynamicProps {
  category: 'weddings' | 'kids' | 'corporate';
  className?: string;
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export function LoaderDynamic({
  category,
  className = "",
  size = 'medium',
  message
}: LoaderDynamicProps) {
  const commonProps = { className, size, message };

  switch (category) {
    case 'weddings':
      return <LoaderWedding {...commonProps} />;

    case 'kids':
      return <LoaderKids {...commonProps} />;

    case 'corporate':
      // TODO: Crear LoaderCorporate cuando sea necesario
      // Por ahora usa LoaderWedding como fallback
      return <LoaderWedding {...commonProps} />;

    default:
      // Fallback a LoaderWedding para categorías desconocidas
      return <LoaderWedding {...commonProps} />;
  }
}

export default LoaderDynamic;