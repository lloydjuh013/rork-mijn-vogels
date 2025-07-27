import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Bird, HealthRecord, Couple, Nest, Egg, Aviary, User } from '@/types/bird';
import { useAuth } from '@/hooks/auth-store';

// Storage keys - now email-based
const getStorageKey = (email: string, type: string) => `mijn_vogels_${email}_${type}`;

// Helper functions for email-based storage
const getStoredData = async <T>(email: string, type: string): Promise<T[]> => {
  try {
    const key = getStorageKey(email, type);
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error retrieving ${type} for ${email}:`, error);
    return [];
  }
};

const storeData = async <T>(email: string, type: string, data: T[]): Promise<void> => {
  try {
    const key = getStorageKey(email, type);
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing ${type} for ${email}:`, error);
  }
};

// Create the context hook
export const [BirdStoreProvider, useBirdStore] = createContextHook(() => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Don't load data if no user is authenticated
  const userEmail = user?.email;

  // Birds
  const birdsQuery = useQuery({
    queryKey: ['birds', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return getStoredData<Bird>(userEmail, 'birds');
    },
    enabled: !!userEmail
  });

  const saveBirdsMutation = useMutation({
    mutationFn: async (birds: Bird[]) => {
      if (!userEmail) throw new Error('No user authenticated');
      await storeData(userEmail, 'birds', birds);
      return birds;
    },
    onSuccess: (birds) => {
      queryClient.setQueryData(['birds', userEmail], birds);
    }
  });

  // Health Records
  const healthRecordsQuery = useQuery({
    queryKey: ['healthRecords', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return getStoredData<HealthRecord>(userEmail, 'health_records');
    },
    enabled: !!userEmail
  });

  const saveHealthRecordsMutation = useMutation({
    mutationFn: async (records: HealthRecord[]) => {
      if (!userEmail) throw new Error('No user authenticated');
      await storeData(userEmail, 'health_records', records);
      return records;
    },
    onSuccess: (records) => {
      queryClient.setQueryData(['healthRecords', userEmail], records);
    }
  });

  // Couples
  const couplesQuery = useQuery({
    queryKey: ['couples', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return getStoredData<Couple>(userEmail, 'couples');
    },
    enabled: !!userEmail
  });

  const saveCouplesMutation = useMutation({
    mutationFn: async (couples: Couple[]) => {
      if (!userEmail) throw new Error('No user authenticated');
      await storeData(userEmail, 'couples', couples);
      return couples;
    },
    onSuccess: (couples) => {
      queryClient.setQueryData(['couples', userEmail], couples);
    }
  });

  // Nests
  const nestsQuery = useQuery({
    queryKey: ['nests', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return getStoredData<Nest>(userEmail, 'nests');
    },
    enabled: !!userEmail
  });

  const saveNestsMutation = useMutation({
    mutationFn: async (nests: Nest[]) => {
      if (!userEmail) throw new Error('No user authenticated');
      await storeData(userEmail, 'nests', nests);
      return nests;
    },
    onSuccess: (nests) => {
      queryClient.setQueryData(['nests', userEmail], nests);
    }
  });

  // Eggs
  const eggsQuery = useQuery({
    queryKey: ['eggs', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return getStoredData<Egg>(userEmail, 'eggs');
    },
    enabled: !!userEmail
  });

  const saveEggsMutation = useMutation({
    mutationFn: async (eggs: Egg[]) => {
      if (!userEmail) throw new Error('No user authenticated');
      await storeData(userEmail, 'eggs', eggs);
      return eggs;
    },
    onSuccess: (eggs) => {
      queryClient.setQueryData(['eggs', userEmail], eggs);
    }
  });

  // Aviaries
  const aviariesQuery = useQuery({
    queryKey: ['aviaries', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return getStoredData<Aviary>(userEmail, 'aviaries');
    },
    enabled: !!userEmail
  });

  const saveAviariesMutation = useMutation({
    mutationFn: async (aviaries: Aviary[]) => {
      if (!userEmail) throw new Error('No user authenticated');
      await storeData(userEmail, 'aviaries', aviaries);
      return aviaries;
    },
    onSuccess: (aviaries) => {
      queryClient.setQueryData(['aviaries', userEmail], aviaries);
    }
  });

  // CRUD operations for birds
  const addBird = (bird: Bird) => {
    const birds = [...(birdsQuery.data || []), bird];
    saveBirdsMutation.mutate(birds);
  };

  const updateBird = (updatedBird: Bird) => {
    const birds = (birdsQuery.data || []).map(bird => 
      bird.id === updatedBird.id ? updatedBird : bird
    );
    saveBirdsMutation.mutate(birds);
  };

  const deleteBird = (id: string) => {
    const birds = (birdsQuery.data || []).filter(bird => bird.id !== id);
    saveBirdsMutation.mutate(birds);
  };

  // CRUD operations for health records
  const addHealthRecord = (record: HealthRecord) => {
    const records = [...(healthRecordsQuery.data || []), record];
    saveHealthRecordsMutation.mutate(records);
  };

  const updateHealthRecord = (updatedRecord: HealthRecord) => {
    const records = (healthRecordsQuery.data || []).map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    );
    saveHealthRecordsMutation.mutate(records);
  };

  const deleteHealthRecord = (id: string) => {
    const records = (healthRecordsQuery.data || []).filter(record => record.id !== id);
    saveHealthRecordsMutation.mutate(records);
  };

  // CRUD operations for couples
  const addCouple = (couple: Couple) => {
    const couples = [...(couplesQuery.data || []), couple];
    saveCouplesMutation.mutate(couples);
  };

  const updateCouple = (updatedCouple: Couple) => {
    const couples = (couplesQuery.data || []).map(couple => 
      couple.id === updatedCouple.id ? updatedCouple : couple
    );
    saveCouplesMutation.mutate(couples);
  };

  const deleteCouple = (id: string) => {
    const couples = (couplesQuery.data || []).filter(couple => couple.id !== id);
    saveCouplesMutation.mutate(couples);
  };

  // CRUD operations for nests
  const addNest = (nest: Nest) => {
    const nests = [...(nestsQuery.data || []), nest];
    saveNestsMutation.mutate(nests);
  };

  const updateNest = (updatedNest: Nest) => {
    const nests = (nestsQuery.data || []).map(nest => 
      nest.id === updatedNest.id ? updatedNest : nest
    );
    saveNestsMutation.mutate(nests);
  };

  const deleteNest = (id: string) => {
    const nests = (nestsQuery.data || []).filter(nest => nest.id !== id);
    saveNestsMutation.mutate(nests);
  };

  // CRUD operations for eggs
  const addEgg = (egg: Egg) => {
    const eggs = [...(eggsQuery.data || []), egg];
    saveEggsMutation.mutate(eggs);
  };

  const updateEgg = (updatedEgg: Egg) => {
    const eggs = (eggsQuery.data || []).map(egg => 
      egg.id === updatedEgg.id ? updatedEgg : egg
    );
    saveEggsMutation.mutate(eggs);
  };

  const deleteEgg = (id: string) => {
    const eggs = (eggsQuery.data || []).filter(egg => egg.id !== id);
    saveEggsMutation.mutate(eggs);
  };

  // CRUD operations for aviaries
  const addAviary = (aviary: Aviary) => {
    const aviaries = [...(aviariesQuery.data || []), aviary];
    saveAviariesMutation.mutate(aviaries);
  };

  const updateAviary = (updatedAviary: Aviary) => {
    const aviaries = (aviariesQuery.data || []).map(aviary => 
      aviary.id === updatedAviary.id ? updatedAviary : aviary
    );
    saveAviariesMutation.mutate(aviaries);
  };

  const deleteAviary = (id: string) => {
    const aviaries = (aviariesQuery.data || []).filter(aviary => aviary.id !== id);
    saveAviariesMutation.mutate(aviaries);
  };

  // Statistics
  const getStatistics = () => {
    const birds = birdsQuery.data || [];
    const couples = couplesQuery.data || [];
    const nests = nestsQuery.data || [];
    const eggs = eggsQuery.data || [];
    const aviaries = aviariesQuery.data || [];

    return {
      totalBirds: birds.length,
      activeBirds: birds.filter(bird => bird.status === 'active').length,
      totalCouples: couples.length,
      activeCouples: couples.filter(couple => couple.active).length,
      totalNests: nests.length,
      activeNests: nests.filter(nest => nest.active).length,
      totalEggs: eggs.length,
      hatchedEggs: eggs.filter(egg => egg.status === 'hatched').length,
      totalAviaries: aviaries.length,
    };
  };

  // Get birds by aviary
  const getBirdsByAviary = (aviaryId: string) => {
    return (birdsQuery.data || []).filter(bird => bird.aviaryId === aviaryId);
  };

  // Get health records by bird
  const getHealthRecordsByBird = (birdId: string) => {
    return (healthRecordsQuery.data || [])
      .filter(record => record.birdId === birdId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get eggs by nest
  const getEggsByNest = (nestId: string) => {
    return (eggsQuery.data || [])
      .filter(egg => egg.nestId === nestId)
      .sort((a, b) => new Date(a.layDate).getTime() - new Date(b.layDate).getTime());
  };

  // Get nests by couple
  const getNestsByCouple = (coupleId: string) => {
    return (nestsQuery.data || [])
      .filter(nest => nest.coupleId === coupleId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  };

  // Get bird by ID
  const getBirdById = (id: string) => {
    return (birdsQuery.data || []).find(bird => bird.id === id);
  };

  // Get couple by ID
  const getCoupleById = (id: string) => {
    return (couplesQuery.data || []).find(couple => couple.id === id);
  };

  // Get aviary by ID
  const getAviaryById = (id: string) => {
    return (aviariesQuery.data || []).find(aviary => aviary.id === id);
  };

  // Get offspring of a couple
  const getOffspring = (coupleId: string) => {
    const nests = (nestsQuery.data || []).filter(nest => nest.coupleId === coupleId);
    const nestIds = nests.map(nest => nest.id);
    const eggs = (eggsQuery.data || []).filter(egg => nestIds.includes(egg.nestId) && egg.status === 'hatched');
    const birdIds = eggs.map(egg => egg.birdId).filter(id => id !== undefined) as string[];
    return (birdsQuery.data || []).filter(bird => birdIds.includes(bird.id));
  };

  // Get parents of a bird
  const getParents = (birdId: string) => {
    const bird = getBirdById(birdId);
    if (!bird) return { father: undefined, mother: undefined };
    
    const father = bird.fatherId ? getBirdById(bird.fatherId) : undefined;
    const mother = bird.motherId ? getBirdById(bird.motherId) : undefined;
    
    return { father, mother };
  };

  return {
    // Data
    birds: birdsQuery.data || [],
    healthRecords: healthRecordsQuery.data || [],
    couples: couplesQuery.data || [],
    nests: nestsQuery.data || [],
    eggs: eggsQuery.data || [],
    aviaries: aviariesQuery.data || [],
    
    // Loading states
    isLoading: 
      birdsQuery.isLoading || 
      healthRecordsQuery.isLoading || 
      couplesQuery.isLoading || 
      nestsQuery.isLoading || 
      eggsQuery.isLoading || 
      aviariesQuery.isLoading,
    
    // CRUD operations
    addBird,
    updateBird,
    deleteBird,
    addHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    addCouple,
    updateCouple,
    deleteCouple,
    addNest,
    updateNest,
    deleteNest,
    addEgg,
    updateEgg,
    deleteEgg,
    addAviary,
    updateAviary,
    deleteAviary,
    
    // Helper functions
    getStatistics,
    getBirdsByAviary,
    getHealthRecordsByBird,
    getEggsByNest,
    getNestsByCouple,
    getBirdById,
    getCoupleById,
    getAviaryById,
    getOffspring,
    getParents,
  };
});