import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
  label?: string;
  onClick?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ className, label = 'Back', onClick }) => {
  const { goBack } = useNavigation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      goBack();
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleClick} 
      className={cn("bg-white/5 text-white hover:bg-white/10 gap-2", className)}
    >
      <ArrowLeft size={16} />
      {label}
    </Button>
  );
};
