// App.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Definimos el tipo de cada tarea
interface Task {
  id: string;
  text: string;
  done: boolean;
}

export default function App(): JSX.Element {
  const [input, setInput] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);

  // Cargar tareas al iniciar
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const stored = await AsyncStorage.getItem("@tasks");
        if (stored) {
          const parsed: Task[] = JSON.parse(stored);
          setTasks(parsed);
        }
      } catch (e) {
        console.log("Error cargando tareas", e);
      }
    };
    loadTasks();
  }, []);

  // Guardar tareas cada vez que cambien
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem("@tasks", JSON.stringify(tasks));
      } catch (e) {
        console.log("Error guardando tareas", e);
      }
    };
    saveTasks();
  }, [tasks]);

  const addTask = (): void => {
    const text = input.trim();
    if (!text) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      done: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    setInput("");
    Keyboard.dismiss();
  };

  const toggleDone = (id: string): void => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const deleteTask = (id: string): void => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAll = (): void => {
    if (tasks.length === 0) return;
    Alert.alert("Confirmar", "¿Deseas eliminar todas las tareas?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => setTasks([]) },
    ]);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={[styles.taskRow, item.done && styles.taskRowDone]}>
      <TouchableOpacity
        onPress={() => toggleDone(item.id)}
        style={styles.taskTextWrap}
      >
        <Text style={[styles.taskText, item.done && styles.taskTextDone]}>
          {item.text}
        </Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => toggleDone(item.id)}
          style={styles.actionBtn}
        >
          <Text style={styles.actionText}>
            {item.done ? "Desmarcar" : "Completar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => deleteTask(item.id)}
          style={[styles.actionBtn, styles.deleteBtn]}
        >
          <Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Lista Rápida de Actividades</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escribe una tarea..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTask}>
          <Text style={styles.addBtnText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.counterRow}>
        <Text style={styles.counterText}>
          Total tareas: <Text style={styles.counterNumber}>{tasks.length}</Text>
        </Text>
        <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay tareas. Agrega la primera.
          </Text>
        }
        contentContainerStyle={tasks.length === 0 && styles.emptyContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f7f9fc" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0b3d91",
    marginBottom: 12,
    textAlign: "center",
  },

  inputRow: { flexDirection: "row", marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e6ef",
    fontSize: 16,
  },
  addBtn: {
    marginLeft: 8,
    backgroundColor: "#0b7bff",
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "600" },

  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  counterText: { fontSize: 14, color: "#333" },
  counterNumber: { fontWeight: "700", color: "#0b7bff" },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ffecec",
    borderRadius: 6,
  },
  clearBtnText: { color: "#d00", fontWeight: "600" },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e6eefc",
  },
  taskRowDone: { backgroundColor: "#eef9f1" },
  taskTextWrap: { flex: 1 },
  taskText: { fontSize: 16, color: "#222" },
  taskTextDone: { textDecorationLine: "line-through", color: "#6b6b6b" },

  actions: { flexDirection: "row", marginLeft: 8 },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#eef3ff",
    marginLeft: 6,
  },
  actionText: { color: "#0b3d91", fontWeight: "600", fontSize: 12 },
  deleteBtn: { backgroundColor: "#fff0f0" },
  deleteText: { color: "#b00000" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#888", fontSize: 16, textAlign: "center" },
});
