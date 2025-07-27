import React from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Bird, Users, Egg, Home as HomeIcon, Crown, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useBirdStore } from '@/hooks/bird-store';
import { useAuth } from '@/hooks/auth-store';
import { usePremiumAction } from '@/hooks/use-premium-action';
import StatCard from '@/components/StatCard';
import PremiumGate from '@/components/PremiumGate';

export default function DashboardScreen() {
  const router = useRouter();
  const { getStatistics } = useBirdStore();
  const { user, subscriptionStatus, daysLeftInTrial } = useAuth();
  const { executeAction, showPremiumGate, currentFeature, closePremiumGate } = usePremiumAction();
  const [refreshing, setRefreshing] = React.useState(false);

  const stats = getStatistics();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app with a server, we would fetch fresh data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>MyBird</Text>
          <Text style={styles.subtitle}>Welkom terug, {user?.name}</Text>
        </View>
        
        {/* Subscription Status */}
        <View style={styles.subscriptionCard}>
          {subscriptionStatus === 'trial' && (
            <View style={[styles.statusBadge, { backgroundColor: Colors.success + '20' }]}>
              <Crown size={16} color={Colors.success} />
              <Text style={[styles.statusText, { color: Colors.success }]}>
                Proefperiode: {daysLeftInTrial} dagen over
              </Text>
            </View>
          )}
          
          {subscriptionStatus === 'active' && (
            <View style={[styles.statusBadge, { backgroundColor: Colors.primary + '20' }]}>
              <Crown size={16} color={Colors.primary} />
              <Text style={[styles.statusText, { color: Colors.primary }]}>
                Premium Actief
              </Text>
            </View>
          )}
          
          {subscriptionStatus === 'expired' && (
            <TouchableOpacity 
              style={[styles.statusBadge, { backgroundColor: Colors.warning + '20' }]}
              onPress={() => executeAction(() => {}, 'Premium Upgrade')}
            >
              <Crown size={16} color={Colors.warning} />
              <Text style={[styles.statusText, { color: Colors.warning }]}>
                Proefperiode verlopen - Upgrade nu
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>



      <Text style={styles.sectionTitle}>Overzicht</Text>
      
      <View style={styles.statsContainer}>
        <StatCard 
          title="Actieve Vogels" 
          value={stats.activeBirds} 
          icon={<Bird size={24} color={Colors.primary} />}
          onPress={() => router.push('/(tabs)/birds')}
          color={Colors.primary}
        />
        
        <StatCard 
          title="Actieve Koppels" 
          value={stats.activeCouples} 
          icon={<Users size={24} color={Colors.secondary} />}
          onPress={() => router.push('/(tabs)/couples')}
          color={Colors.secondary}
        />
        
        <StatCard 
          title="Actieve Nesten" 
          value={stats.activeNests} 
          icon={<Egg size={24} color={Colors.accent} />}
          onPress={() => {
            executeAction(() => {
              if (stats.activeNests > 0) {
                router.push('/nests');
              } else {
                alert('Geen actieve nesten gevonden');
              }
            }, 'Nesten Beheer');
          }}
          color={Colors.accent}
        />
        
        <StatCard 
          title="Kooien" 
          value={stats.totalAviaries} 
          icon={<HomeIcon size={24} color={Colors.info} />}
          onPress={() => router.push('/(tabs)/aviaries')}
          color={Colors.info}
        />
      </View>

      <Text style={styles.sectionTitle}>Statistieken</Text>
      
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Totaal Vogels:</Text>
          <Text style={styles.infoValue}>{stats.totalBirds}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Totaal Koppels:</Text>
          <Text style={styles.infoValue}>{stats.totalCouples}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Totaal Nesten:</Text>
          <Text style={styles.infoValue}>{stats.totalNests}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Totaal Eieren:</Text>
          <Text style={styles.infoValue}>{stats.totalEggs}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Uitgekomen Eieren:</Text>
          <Text style={styles.infoValue}>{stats.hatchedEggs}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Succespercentage:</Text>
          <Text style={styles.infoValue}>
            {stats.totalEggs > 0 
              ? `${Math.round((stats.hatchedEggs / stats.totalEggs) * 100)}%` 
              : 'N.v.t.'}
          </Text>
        </View>
      </View>
      
      <PremiumGate 
        visible={showPremiumGate}
        onClose={closePremiumGate}
        feature={currentFeature}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  subscriptionCard: {
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  statsContainer: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});