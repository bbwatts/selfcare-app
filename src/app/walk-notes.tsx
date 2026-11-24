import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, FlatList } from "react-native";

type WalkNote = {
  text: string;
  createdAt: string;
  id: string;
  syncStatus: string;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredText: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "bold",
  },
  inputText: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
    width: "50%",
    color: "#898989",
  },
  statusmessage: {
    fontSize: 18,
    marginBottom: 10,
    color: "#898989",
  },
  button: {
    width: "30%",
    marginVertical: 10,
  },
  flatList: {
    width: "50%",
    marginTop: 20,
    flexGrow: 0,
  },
  flatListText: {
    color: "#898989",
  },
});

export default function WalkNotesScreen() {
const [note, setNote] = useState<WalkNote>({text: '', createdAt: '', id: '', syncStatus: ''});
  const [notes, setNotes] = useState<WalkNote[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadNotes = async () => {
      const savedNotes = await AsyncStorage.getItem('walkNotes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    };
    loadNotes();
  }, []);

  const saveNote = async () => {
    //uses trim to handle string better
    if (note.text.trim() === '') {
      setStatus('Please enter a note before saving.');
      return;
    }
    if (note.text.length > 200) {
      setStatus('Your note must be 200 characters or less.');
      return;
    }

    const newNote = { text: note.text.trim(), createdAt: new Date().toLocaleString(), id: Date.now().toString(), syncStatus: 'pending',};
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    await AsyncStorage.setItem('walkNotes', JSON.stringify(updatedNotes));
    setNote(newNote);
    setStatus('Note saved on this device.');
  };

  return (
    <View style={styles.container}>
        <Text style={styles.centeredText}>Walk Notes</Text>
      <Text style={styles.statusmessage}>Status: {status}</Text>
      <TextInput
        multiline={true}
        maxLength={200}
        value={note.text}
        onChangeText={(text) => setNote({...note, text})}
        placeholder="Enter a note about your walk."
        style={styles.inputText}
      />
      <Text style={styles.statusmessage}>{note.text.length} / 200 characters</Text>
      <View style={styles.button}>
        <Button title="Save Note" onPress={saveNote} />
      </View>
      <View style={styles.button}>
        <Button title="Sync Now" onPress={() => {}} />
      </View>
      <Text style={styles.centeredText}>Saved Notes:</Text>
      <FlatList 
        style={styles.flatList}
        data={notes}
        renderItem={({ item }) => <Text style={styles.flatListText}>{item.createdAt} - {item.text} ({item.syncStatus})</Text>}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

// still need to handle error when saving to AsyncStorage, and also need to implement the sync functionality.