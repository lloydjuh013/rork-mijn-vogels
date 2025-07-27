import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Bird } from '@/types/bird';
import Colors from '@/constants/colors';
import { Calendar, MapPin, Heart } from 'lucide-react-native';

type BirdCardProps = {
  bird: Bird;
};

const BirdCard: React.FC<BirdCardProps> = ({ bird }) => {
  const router = useRouter();
  
  const handlePress = () => {
    router.push(`/birds/${bird.id}`);
  };

  const getGenderColor = () => {
    switch (bird.gender) {
      case 'male':
        return Colors.male;
      case 'female':
        return Colors.female;
      default:
        return Colors.unknown;
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actief';
      case 'deceased':
        return 'Overleden';
      case 'sold':
        return 'Verkocht';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      testID={`bird-card-${bird.id}`}
    >
      <View style={[styles.genderIndicator, { backgroundColor: getGenderColor() }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.ringNumber}>{bird.ringNumber}</Text>
          <Text style={styles.status}>{getStatusText(bird.status)}</Text>
        </View>
        
        <Text style={styles.species}>{bird.species}</Text>
        {bird.subspecies && (
          <Text style={styles.subspecies}>{bird.subspecies}</Text>
        )}
        
        {bird.colorMutation && (
          <Text style={styles.colorMutation}>{bird.colorMutation}</Text>
        )}
        
        <View style={styles.infoRow}>
          <Calendar size={16} color={Colors.textLight} />
          <Text style={styles.infoText}>{formatDate(bird.birthDate)}</Text>
        </View>
        
        {bird.aviaryId && (
          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.textLight} />
            <Text style={styles.infoText}>Kooi ID: {bird.aviaryId}</Text>
          </View>
        )}
      </View>
      
      {bird.imageUri ? (
        <Image source={{ uri: bird.imageUri }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Heart size={24} color={Colors.textLighter} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  genderIndicator: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ringNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  status: {
    fontSize: 12,
    color: Colors.textLight,
    textTransform: 'capitalize',
  },
  species: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subspecies: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  colorMutation: {
    fontSize: 14,
    color: Colors.accent,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  image: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: 100,
    height: '100%',
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BirdCard;