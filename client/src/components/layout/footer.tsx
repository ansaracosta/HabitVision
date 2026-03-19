import { HelpCircle, Settings, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Footer() {
  const { toast } = useToast();
  
  const handleIconClick = (feature: string) => {
    const featureTranslations: Record<string, string> = {
      'Help': 'Ajuda',
      'Settings': 'Configurações',
      'Account': 'Conta'
    };
    
    const translatedFeature = featureTranslations[feature] || feature;
    
    toast({
      title: `Recurso de ${translatedFeature}`,
      description: `O recurso de ${translatedFeature.toLowerCase()} estará disponível em breve!`
    });
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} HabiTracker. Todos os direitos reservados.</p>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-6">
              <button
                onClick={() => handleIconClick('Help')}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Ajuda</span>
                <HelpCircle className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleIconClick('Settings')}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Configurações</span>
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleIconClick('Account')}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Conta</span>
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
