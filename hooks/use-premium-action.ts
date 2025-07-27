import { useState } from 'react';
import { useAuth } from './auth-store';

export const usePremiumAction = () => {
  const { canPerformAction, requiresPremium } = useAuth();
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [currentFeature, setCurrentFeature] = useState('');

  const executeAction = (action: () => void, featureName: string) => {
    if (canPerformAction()) {
      action();
    } else {
      setCurrentFeature(featureName);
      setShowPremiumGate(true);
    }
  };

  const closePremiumGate = () => {
    setShowPremiumGate(false);
    setCurrentFeature('');
  };

  return {
    executeAction,
    showPremiumGate,
    currentFeature,
    closePremiumGate,
    requiresPremium: requiresPremium(),
  };
};