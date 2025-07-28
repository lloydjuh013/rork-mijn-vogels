import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Bird, HealthRecord, Couple, Nest, Egg, Aviary, User } from '@/types/bird';
import { useAuth } from '@/hooks/auth-store';
import { supabase } from '@/utils/supabase';

// Helper functions for Supabase operations
const getBirds = async (userId: string): Promise<Bird[]> => {
  const { data, error } = await supabase
    .from('birds')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching birds:', error);
    throw error;
  }

  return (data || []).map(bird => ({
    id: bird.id,
    name: bird.name,
    species: bird.species,
    gender: bird.gender,
    birthDate: bird.birth_date ? new Date(bird.birth_date) : undefined,
    ringNumber: bird.ring_number || undefined,
    color: bird.color || undefined,
    notes: bird.notes || undefined,
    imageUrl: bird.image_url || undefined,
    status: 'active' as const,
    aviaryId: undefined, // Will be handled by aviary relationships
    fatherId: undefined, // Will be handled by breeding records
    motherId: undefined, // Will be handled by breeding records
    createdAt: new Date(bird.created_at),
  }));
};

const getCouples = async (userId: string): Promise<Couple[]> => {
  const { data, error } = await supabase
    .from('couples')
    .select(`
      *,
      male_bird:birds!couples_male_bird_id_fkey(id, name),
      female_bird:birds!couples_female_bird_id_fkey(id, name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching couples:', error);
    throw error;
  }

  return (data || []).map(couple => ({
    id: couple.id,
    maleId: couple.male_bird_id,
    femaleId: couple.female_bird_id,
    season: new Date(couple.pair_date).getFullYear().toString(),
    active: couple.status === 'active',
    notes: couple.notes || undefined,
    createdAt: new Date(couple.created_at),
  }));
};

const getAviaries = async (userId: string): Promise<Aviary[]> => {
  const { data, error } = await supabase
    .from('aviaries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching aviaries:', error);
    throw error;
  }

  return (data || []).map(aviary => ({
    id: aviary.id,
    name: aviary.name,
    description: aviary.description || undefined,
    capacity: aviary.capacity,
    location: aviary.location || undefined,
    createdAt: new Date(aviary.created_at),
  }));
};

const getNests = async (userId: string): Promise<Nest[]> => {
  const { data, error } = await supabase
    .from('nests')
    .select(`
      *,
      couple:couples(id, male_bird_id, female_bird_id),
      aviary:aviaries(id, name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching nests:', error);
    throw error;
  }

  return (data || []).map(nest => ({
    id: nest.id,
    coupleId: nest.couple_id,
    aviaryId: nest.aviary_id || undefined,
    startDate: new Date(nest.start_date),
    expectedHatchDate: nest.expected_hatch_date ? new Date(nest.expected_hatch_date) : undefined,
    actualHatchDate: nest.actual_hatch_date ? new Date(nest.actual_hatch_date) : undefined,
    eggCount: nest.egg_count,
    hatchedCount: nest.hatched_count,
    active: nest.status !== 'completed' && nest.status !== 'abandoned',
    notes: nest.notes || undefined,
    createdAt: new Date(nest.created_at),
  }));
};

// Create the context hook
export const [BirdStoreProvider, useBirdStore] = createContextHook(() => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Don't load data if no user is authenticated
  const userId = user?.id;

  // Birds
  const birdsQuery = useQuery({
    queryKey: ['birds', userId],
    queryFn: async () => {
      if (!userId) return [];
      return getBirds(userId);
    },
    enabled: !!userId
  });

  const addBirdMutation = useMutation({
    mutationFn: async (bird: Omit<Bird, 'id' | 'createdAt'>) => {
      if (!userId) throw new Error('No user authenticated');
      
      const { data, error } = await supabase
        .from('birds')
        .insert({
          user_id: userId,
          name: bird.name,
          species: bird.species,
          gender: bird.gender,
          birth_date: bird.birthDate?.toISOString().split('T')[0] || null,
          ring_number: bird.ringNumber || null,
          color: bird.color || null,
          notes: bird.notes || null,
          image_url: bird.imageUrl || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birds', userId] });
    }
  });

  const updateBirdMutation = useMutation({
    mutationFn: async (bird: Bird) => {
      if (!userId) throw new Error('No user authenticated');
      
      const { data, error } = await supabase
        .from('birds')
        .update({
          name: bird.name,
          species: bird.species,
          gender: bird.gender,
          birth_date: bird.birthDate?.toISOString().split('T')[0] || null,
          ring_number: bird.ringNumber || null,
          color: bird.color || null,
          notes: bird.notes || null,
          image_url: bird.imageUrl || null,
        })
        .eq('id', bird.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birds', userId] });
    }
  });

  const deleteBirdMutation = useMutation({
    mutationFn: async (birdId: string) => {
      if (!userId) throw new Error('No user authenticated');
      
      const { error } = await supabase
        .from('birds')
        .delete()
        .eq('id', birdId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birds', userId] });
    }
  });

  // Health Records (simplified for now - can be expanded later)
  const healthRecordsQuery = useQuery({
    queryKey: ['healthRecords', userId],
    queryFn: async () => {
      if (!userId) return [];
      // For now, return empty array - health records can be added later
      return [] as HealthRecord[];
    },
    enabled: !!userId
  });

  // Couples
  const couplesQuery = useQuery({
    queryKey: ['couples', userId],
    queryFn: async () => {
      if (!userId) return [];
      return getCouples(userId);
    },
    enabled: !!userId
  });

  const addCoupleMutation = useMutation({
    mutationFn: async (couple: Omit<Couple, 'id' | 'createdAt'>) => {
      if (!userId) throw new Error('No user authenticated');
      
      const { data, error } = await supabase
        .from('couples')
        .insert({
          user_id: userId,
          male_bird_id: couple.maleId,
          female_bird_id: couple.femaleId,
          pair_date: new Date().toISOString().split('T')[0], // Use current date for pair date
          status: couple.active ? 'active' : 'inactive',
          notes: couple.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couples', userId] });
    }
  });

  const updateCoupleMutation = useMutation({
    mutationFn: async (couple: Couple) => {
      if (!userId) throw new Error('No user authenticated');
      
      const { data, error } = await supabase
        .from('couples')
        .update({
          male_bird_id: couple.maleId,
          female_bird_id: couple.femaleId,
          pair_date: new Date().toISOString().split('T')[0], // Use current date for pair date
          status: couple.active ? 'active' : 'inactive',
          notes: couple.notes || null,
        })
        .eq('id', couple.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couples', userId] });
    }
  });

  const deleteCoupleMutation = useMutation({
    mutationFn: async (coupleId: string) => {
      if (!userId) throw new Error('No user authenticated');
      
      const { error } = await supabase
        .from('couples')
        .delete()
        .eq('id', coupleId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couples', userId] });
    }
  });

  // Nests
  const nestsQuery = useQuery({
    queryKey: ['nests', userId],
    queryFn: async () => {
      if (!userId) return [];
      return getNests(userId);
    },
    enabled: !!userId
  });

  const addNestMutation = useMutation({
    mutationFn: async (nest: Omit<Nest, 'id' | 'createdAt'>) => {
      if (!userId) throw new Error('No user authenticated');
      
      const { data, error } = await supabase
        .from('nests')
        .insert({
          user_id: userId,
          couple_id: nest.coupleId,
          aviary_id: nest.aviaryId || null,
          start_date: nest.startDate.toISOString().split('T')[0],
          expected_hatch_date: nest.expectedHatchDate?.toISOString().split('T')[0] || null,
          actual_hatch_date: nest.actualHatchDate?.toISOString().split('T')[0] || null,
          egg_count: nest.eggCount,
          hatched_count: nest.hatchedCount,
          status: nest.active ? 'preparing' : 'completed',
          notes: nest.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nests', userId] });
    }
  });

  const updateNestMutation = useMutation({
    mutationFn: async (nest: Nest) => {
      if (!userId) throw new Error('No user authenticated');
      
      const { data, error } = await supabase
        .from('nests')
        .update({
          couple_id: nest.coupleId,
          aviary_id: nest.aviaryId || null,
          start_date: nest.startDate.toISOString().split('T')[0],
          expected_hatch_date: nest.expectedHatchDate?.toISOString().split('T')[0] || null,
          actual_hatch_date: nest.actualHatchDate?.toISOString().split('T')[0] || null,
          egg_count: nest.eggCount,
          hatched_count: nest.hatchedCount,
          status: nest.active ? 'preparing' : 'completed',
          notes: nest.notes || null,
        })
        .eq('id', nest.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nests', userId] });
    }
  });

  const deleteNestMutation = useMutation({
    mutationFn: async (nestId: string) => {
      if (!userId) throw new Error('No user authenticated');
      
      const { error } = await supabase
        .from('nests')
        .delete()
        .eq('id', nestId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nests', userId] });
    }
  });

  // Eggs (simplified for now - can be expanded later)
  const eggsQuery = useQuery({
    queryKey: ['eggs', userId],
    queryFn: async () => {
      if (!userId) return [];
      // For now, return empty array - eggs can be added later
      return [] as Egg[];
    },
    enabled: !!userId
  });

  // Aviaries
  const aviariesQuery = useQuery({
    queryKey: ['aviaries', userId],
    queryFn: async () => {
      if (!userId) return [];
      return getAviaries(userId);
    },
    enabled: !!userId
  });

  const addAviaryMutation = useMutation({
    mutationFn: async (aviary: Omit<Aviary, 'id' | 'createdAt'>) => {
      if (!userId) throw new Error('No user authenticated');
      
      const { data, error } = await supabase
        .from('aviaries')
        .insert({
          user_id: userId,
          name: aviary.name,
          description: aviary.description || null,
          capacity: aviary.capacity,
          location: aviary.location || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aviaries', userId] });
    }
  });

  const updateAviaryMutation = useMutation({
    mutationFn: async (aviary: Aviary) => {
      if (!userId) throw new Error('No user authenticated');
      
      const { data, error } = await supabase
        .from('aviaries')
        .update({
          name: aviary.name,
          description: aviary.description || null,
          capacity: aviary.capacity,
          location: aviary.location || null,
        })
        .eq('id', aviary.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aviaries', userId] });
    }
  });

  const deleteAviaryMutation = useMutation({
    mutationFn: async (aviaryId: string) => {
      if (!userId) throw new Error('No user authenticated');
      
      const { error } = await supabase
        .from('aviaries')
        .delete()
        .eq('id', aviaryId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aviaries', userId] });
    }
  });

  // CRUD operations for birds
  const addBird = (bird: Omit<Bird, 'id' | 'createdAt'>) => {
    addBirdMutation.mutate(bird);
  };

  const updateBird = (bird: Bird) => {
    updateBirdMutation.mutate(bird);
  };

  const deleteBird = (id: string) => {
    deleteBirdMutation.mutate(id);
  };

  // CRUD operations for health records (simplified)
  const addHealthRecord = (record: HealthRecord) => {
    // TODO: Implement when health records table is added
    console.log('Health records not yet implemented with Supabase');
  };

  const updateHealthRecord = (record: HealthRecord) => {
    // TODO: Implement when health records table is added
    console.log('Health records not yet implemented with Supabase');
  };

  const deleteHealthRecord = (id: string) => {
    // TODO: Implement when health records table is added
    console.log('Health records not yet implemented with Supabase');
  };

  // CRUD operations for couples
  const addCouple = (couple: Omit<Couple, 'id' | 'createdAt'>) => {
    addCoupleMutation.mutate(couple);
  };

  const updateCouple = (couple: Couple) => {
    updateCoupleMutation.mutate(couple);
  };

  const deleteCouple = (id: string) => {
    deleteCoupleMutation.mutate(id);
  };

  // CRUD operations for nests
  const addNest = (nest: Omit<Nest, 'id' | 'createdAt'>) => {
    addNestMutation.mutate(nest);
  };

  const updateNest = (nest: Nest) => {
    updateNestMutation.mutate(nest);
  };

  const deleteNest = (id: string) => {
    deleteNestMutation.mutate(id);
  };

  // CRUD operations for eggs (simplified)
  const addEgg = (egg: Egg) => {
    // TODO: Implement when eggs table is added
    console.log('Eggs not yet implemented with Supabase');
  };

  const updateEgg = (egg: Egg) => {
    // TODO: Implement when eggs table is added
    console.log('Eggs not yet implemented with Supabase');
  };

  const deleteEgg = (id: string) => {
    // TODO: Implement when eggs table is added
    console.log('Eggs not yet implemented with Supabase');
  };

  // CRUD operations for aviaries
  const addAviary = (aviary: Omit<Aviary, 'id' | 'createdAt'>) => {
    addAviaryMutation.mutate(aviary);
  };

  const updateAviary = (aviary: Aviary) => {
    updateAviaryMutation.mutate(aviary);
  };

  const deleteAviary = (id: string) => {
    deleteAviaryMutation.mutate(id);
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