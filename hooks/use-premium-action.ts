import { useAuth } from './auth-store';

// In free version, all actions are allowed
export const usePremiumAction = () => {
  const { canPerformAction } = useAuth();

  const executeAction = (action: () => void, featureName: string) => {
    // All actions are allowed in free version
    action();
  };

  return {
    executeAction,
    showPremiumGate: false,
    currentFeature: '',
    closePremiumGate: () => {},
    requiresPremium: false,
  };
};