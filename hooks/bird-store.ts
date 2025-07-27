import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Bird, HealthRecord, Couple, Nest, Egg, Aviary, User } from '@/types/bird';

// Storage keys
const BIRDS_STORAGE_KEY = 'mijn_vogels_birds';
const HEALTH_RECORDS_STORAGE_KEY = 'mijn_vogels_health_records';
const COUPLES_STORAGE_KEY = 'mijn_vogels_couples';
const NESTS_STORAGE_KEY = 'mijn_vogels_nests';
const EGGS_STORAGE_KEY = 'mijn_vogels_eggs';
const AVIARIES_STORAGE_KEY = 'mijn_vogels_aviaries';
const USER_STORAGE_KEY = 'mijn_vogels_user';
const AUTH_TOKEN_KEY = 'mijn_vogels_auth_token';

// Helper functions for storage
const getStoredData = async <T>(key: string): Promise<T[]> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return [];
  }
};

const storeData = async <T>(key: string, data: T[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
  }
};

// Create the context hook
export const [BirdStoreProvider, useBirdStore] = createContextHook(() => {
  const queryClient = useQueryClient();

  // Birds
  const birdsQuery = useQuery({
    queryKey: ['birds'],
    queryFn: async () => {
      return getStoredData<Bird>(BIRDS_STORAGE_KEY);
    }
  });

  const saveBirdsMutation = useMutation({
    mutationFn: async (birds: Bird[]) => {
      await storeData(BIRDS_STORAGE_KEY, birds);
      return birds;
    },
    onSuccess: (birds) => {
      queryClient.setQueryData(['birds'], birds);
    }
  });

  // Health Records
  const healthRecordsQuery = useQuery({
    queryKey: ['healthRecords'],
    queryFn: async () => {
      return getStoredData<HealthRecord>(HEALTH_RECORDS_STORAGE_KEY);
    }
  });

  const saveHealthRecordsMutation = useMutation({
    mutationFn: async (records: HealthRecord[]) => {
      await storeData(HEALTH_RECORDS_STORAGE_KEY, records);
      return records;
    },
    onSuccess: (records) => {
      queryClient.setQueryData(['healthRecords'], records);
    }
  });

  // Couples
  const couplesQuery = useQuery({
    queryKey: ['couples'],
    queryFn: async () => {
      return getStoredData<Couple>(COUPLES_STORAGE_KEY);
    }
  });

  const saveCouplesMutation = useMutation({
    mutationFn: async (couples: Couple[]) => {
      await storeData(COUPLES_STORAGE_KEY, couples);
      return couples;
    },
    onSuccess: (couples) => {
      queryClient.setQueryData(['couples'], couples);
    }
  });

  // Nests
  const nestsQuery = useQuery({
    queryKey: ['nests'],
    queryFn: async () => {
      return getStoredData<Nest>(NESTS_STORAGE_KEY);
    }
  });

  const saveNestsMutation = useMutation({
    mutationFn: async (nests: Nest[]) => {
      await storeData(NESTS_STORAGE_KEY, nests);
      return nests;
    },
    onSuccess: (nests) => {
      queryClient.setQueryData(['nests'], nests);
    }
  });

  // Eggs
  const eggsQuery = useQuery({
    queryKey: ['eggs'],
    queryFn: async () => {
      return getStoredData<Egg>(EGGS_STORAGE_KEY);
    }
  });

  const saveEggsMutation = useMutation({
    mutationFn: async (eggs: Egg[]) => {
      await storeData(EGGS_STORAGE_KEY, eggs);
      return eggs;
    },
    onSuccess: (eggs) => {
      queryClient.setQueryData(['eggs'], eggs);
    }
  });

  // Aviaries
  const aviariesQuery = useQuery({
    queryKey: ['aviaries'],
    queryFn: async () => {
      return getStoredData<Aviary>(AVIARIES_STORAGE_KEY);
    }
  });

  const saveAviariesMutation = useMutation({
    mutationFn: async (aviaries: Aviary[]) => {
      await storeData(AVIARIES_STORAGE_KEY, aviaries);
      return aviaries;
    },
    onSuccess: (aviaries) => {
      queryClient.setQueryData(['aviaries'], aviaries);
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