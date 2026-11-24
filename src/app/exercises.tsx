import { Button, Text, View } from "react-native";
import { StyleSheet, Animated } from "react-native";
import React from "react";

export default function ExerciseScreen() {
  const animation = React.useRef(new Animated.Value(1)).current;

  const startAnimation = () => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1.4,
        duration: 4000,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercises</Text>
      <Text style={styles.paragraph}>
        choose an exercise below to help you relax and improve your mood.
      </Text>
      <Animated.View
        style={[
          styles.breathingCircle,
          { transform: [{ scale: animation }] },
        ]}>
        <Text style={styles.breathingText}>Breathe</Text>
      </Animated.View>
      <View style={styles.buttonRow}>
        <Button title="Breathing Exercise" onPress={startAnimation} />
        <Button title="exercise 2" onPress={() => {}} />
        <Button title="exercise 3" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,   
    },
    paragraph: {
        fontSize: 18,
        color: "#898989",
        textAlign: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 40,
        fontWeight: "bold",
        color: "#898989",
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: "column",
    },
    breathingCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#B8D8F0",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    breathingText: {
        color: "#333333",
        fontSize: 18,
    },
});