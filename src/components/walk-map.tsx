import { StyleSheet, View } from "react-native";
import MapView, {Marker} from "react-native-maps";

export default function WalkMap({ latitude, longitude }: { latitude?: number; longitude?: number }) {
  if (latitude === undefined || longitude === undefined) {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      />
      <Marker coordinate={{latitude: latitude, longitude: longitude}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "80%",
    minHeight: 240,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
