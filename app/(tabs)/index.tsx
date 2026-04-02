import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { JSX, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

const STORAGE_KEY = "@tasks_v1";

export default function App(): JSX.Element {
  const [input, setInput] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar tareas al iniciar
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Task[] = JSON.parse(raw);
          setTasks(parsed);
        }
      } catch (error) {
        console.warn("Error cargando tareas", error);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  // Guardar tareas cada vez que cambien
  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.warn("Error guardando tareas", error);
      }
    };
    // Evitar guardar antes de la primera carga
    if (!loading) save();
  }, [tasks, loading]);

  const addTask = (): void => {
    const text = input.trim();
    if (!text) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      done: false,
      createdAt: Date.now(),
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
    <LinearGradient
      // Gradiente minimalista y suave
      colors={["#f7fbff", "#eaf3ff", "#fff7f2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Lista Rápida de Actividades</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Escribe una tarea..."
            placeholderTextColor="#9aa4b2"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={addTask}
            returnKeyType="done"
            accessible
            accessibilityLabel="Campo para escribir tarea"
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={addTask}
            accessibilityRole="button"
          >
            <Text style={styles.addBtnText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            Total tareas:{" "}
            <Text style={styles.counterNumber}>{tasks.length}</Text>
          </Text>
          <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#0b7bff" />
            <Text style={styles.loadingText}>Cargando tareas...</Text>
          </View>
        ) : (
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
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Espacio inferior para evitar solapamiento en Android */}
        <View style={Platform.OS === "android" ? { height: 16 } : undefined} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, padding: 16 },
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
    backgroundColor: "#ffffffcc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6eefc",
    fontSize: 16,
    color: "#1b2b4a",
  },
  addBtn: {
    marginLeft: 8,
    backgroundColor: "#0b7bff",
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 10,
  },
  addBtnText: { color: "#fff", fontWeight: "600" },

  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  counterText: { fontSize: 14, color: "#334155" },
  counterNumber: { fontWeight: "700", color: "#0b7bff" },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff0f0",
    borderRadius: 8,
  },
  clearBtnText: { color: "#b00000", fontWeight: "600" },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffffcc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e6eefc",
  },
  taskRowDone: { backgroundColor: "#eef9f1" },
  taskTextWrap: { flex: 1 },
  taskText: { fontSize: 16, color: "#0f1724" },
  taskTextDone: { textDecorationLine: "line-through", color: "#6b6b6b" },

  actions: { flexDirection: "row", marginLeft: 8 },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#eef3ff",
    marginLeft: 6,
  },
  actionText: { color: "#0b3d91", fontWeight: "600", fontSize: 12 },
  deleteBtn: { backgroundColor: "#fff0f0" },
  deleteText: { color: "#b00000" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#6b7280", fontSize: 16, textAlign: "center" },

  loadingWrap: { alignItems: "center", marginTop: 24 },
  loadingText: { marginTop: 8, color: "#475569" },
});
