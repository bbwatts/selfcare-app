import { Button, Text, View } from "react-native";
import { StyleSheet } from "react-native";

export default function ExerciseScreen() {
  
  const BreathingExercise = () => {
  }

    return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>Hello, React Native!</Text>
      <Button title="Breathing Exercise" onPress={BreathingExercise} />
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
    },
});