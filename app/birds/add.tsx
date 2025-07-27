import React from 'react';
import { useRouter } from 'expo-router';
import { Bird } from '@/types/bird';
import { useBirdStore } from '@/hooks/bird-store';
import BirdForm from '@/components/BirdForm';

export default function AddBirdScreen() {
  const router = useRouter();
  const { addBird } = useBirdStore();

  const handleSubmit = (bird: Bird) => {
    addBird(bird);
    router.back();
  };

  return <BirdForm onSubmit={handleSubmit} />;
}