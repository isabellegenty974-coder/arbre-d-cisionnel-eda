import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NavigationBar({ canGoBack = true, title = "Arbre Décisionnel EDA" }) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        {canGoBack ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour
          </Button>
        ) : (
          <div />
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="w-16" />
      </div>
    </div>
  );
}