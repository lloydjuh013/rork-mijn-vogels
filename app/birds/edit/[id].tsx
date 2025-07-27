import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bird } from '@/types/bird';
import { useBirdStore } from '@/hooks/bird-store';
import BirdForm from '@/components/BirdForm';

export default function EditBirdScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getBirdById, updateBird } = useBirdStore();

  const bird = getBirdById(id);

  if (!bird) {
    router.back();
    return null;
  }

  const handleSubmit = (updatedBird: Bird) => {
    updateBird(updatedBird);
    router.back();
  };

  return <BirdForm initialBird={bird} onSubmit={handleSubmit} />;
}