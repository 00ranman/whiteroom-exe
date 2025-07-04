import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width, height } = Dimensions.get('window');

export default function WhiteRoomScreen() {
  const [matrixRain] = useState(new Animated.Value(0));
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const animateMatrixRain = () => {
      Animated.loop(
        Animated.timing(matrixRain, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    };
    animateMatrixRain();
  }, []);

  const handleInitialize = () => {
    setIsInitialized(true);
  };

  const handleEnterGame = () => {
    // Navigate to game session
    console.log('Entering WhiteRoom...');
  };

  if (!isInitialized) {
    return (
      <ThemedView style={styles.container}>
        <Animated.View 
          style={[
            styles.matrixBackground,
            {
              transform: [{
                translateY: matrixRain.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-height, height]
                })
              }]
            }
          ]}
        />
        
        <ThemedView style={styles.centerContainer}>
          <ThemedText style={styles.title}>WhiteRoom.exe</ThemedText>
          <ThemedText style={styles.subtitle}>The Recursive RPG</ThemedText>
          
          <ThemedText style={styles.description}>
            An AI-native roleplaying matrix where reality is uploaded, not assumed.
          </ThemedText>
          
          <TouchableOpacity style={styles.initButton} onPress={handleInitialize}>
            <ThemedText style={styles.buttonText}>INITIALIZE MATRIX</ThemedText>
          </TouchableOpacity>
          
          <ThemedText style={styles.warning}>
            ⚠️ Nothing exists until spoken. You are not entering a fantasy. You are generating it.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.matrixText}>SYSTEM INITIALIZED</ThemedText>
        <ThemedText style={styles.statusText}>Reality Framework: ACTIVE</ThemedText>
        <ThemedText style={styles.statusText}>Narrative Engine: ONLINE</ThemedText>
        <ThemedText style={styles.statusText}>Meta-Commands: ENABLED</ThemedText>
        
        <TouchableOpacity style={styles.enterButton} onPress={handleEnterGame}>
          <ThemedText style={styles.buttonText}>ENTER WHITE ROOM</ThemedText>
        </TouchableOpacity>
        
        <ThemedText style={styles.quote}>
          "In WhiteRoom, narrative obeys entropy. You may build any world. But if you lie, the system will remember."
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixBackground: {
    position: 'absolute',
    width: width,
    height: height * 2,
    backgroundColor: 'transparent',
    borderColor: '#00ff00',
    borderWidth: 1,
    opacity: 0.1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00ff00',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'monospace',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'monospace',
  },
  description: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    fontFamily: 'monospace',
  },
  initButton: {
    backgroundColor: 'transparent',
    borderColor: '#00ff00',
    borderWidth: 2,
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginBottom: 30,
  },
  enterButton: {
    backgroundColor: 'transparent',
    borderColor: '#0080ff',
    borderWidth: 2,
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginBottom: 30,
  },
  buttonText: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  warning: {
    fontSize: 12,
    color: '#ff0040',
    textAlign: 'center',
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  matrixText: {
    fontSize: 24,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 20,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  quote: {
    fontSize: 12,
    color: '#8040ff',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'monospace',
    marginTop: 20,
    lineHeight: 18,
  },
});