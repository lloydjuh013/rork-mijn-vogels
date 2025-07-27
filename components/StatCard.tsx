import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import { LucideIcon } from 'lucide-react-native';

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  onPress?: () => void;
  color?: string;
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  onPress, 
  color = Colors.primary 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, { borderLeftColor: color }]} 
      onPress={onPress}
      disabled={!onPress}
      testID={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  iconContainer: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: Colors.textLight,
  },
});

export default StatCard;