import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Colors from '@/constants/colors';
import Button from './Button';

type EmptyStateProps = {
  title: string;
  message?: string;
  description?: string;
  icon: React.ReactNode;
  actionLabel?: string;
  actionText?: string;
  onAction?: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  description,
  icon,
  actionLabel,
  actionText,
  onAction,
}) => {
  return (
    <View style={styles.container} testID="empty-state">
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message || description}</Text>
      {(actionLabel || actionText) && onAction && (
        <View style={styles.buttonContainer}>
          <Button 
            title={actionLabel || actionText || ''} 
            onPress={onAction} 
            type="primary" 
            testID="empty-state-action"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 50,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '80%',
    maxWidth: 300,
  },
});

export default EmptyState;