import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Button } from "react-native";

const BASE_URL = "http://10.110.12.28:3000";

export default function HomeScreen({ navigation }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/photos`);
      const data = await res.json();
      setPhotos(data.reverse()); // mostrar mais recentes primeiro
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível carregar as fotos. Verifique a URL do JSON-Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchPhotos();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id, uri) => {
    Alert.alert("Confirmar", "Deseja excluir esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            // delete no server
            await fetch(`${BASE_URL}/photos/${id}`, { method: "DELETE" });

            // opcional: tentar remover arquivo local (não obrigatório)
            // Não executamos remoção de arquivo aqui (permite que a imagem fique no storage se quiser).
            fetchPhotos();
          } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Não foi possível excluir.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => navigation.navigate("Edit", { photo: item })}>
        <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.title}>{item.titulo_foto}</Text>
        <Text style={styles.desc}>{item.descricao_foto}</Text>
        <View style={styles.row}>
          <Text style={styles.date}>{new Date(item.data_foto).toLocaleString()}</Text>
          <TouchableOpacity onPress={() => handleDelete(item.id, item.uri)} style={styles.deleteBtn}>
            <Text style={{ color: "white" }}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Tirar nova foto" onPress={() => navigation.navigate("Camera")} />
      <FlatList
        data={photos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchPhotos}
        ListEmptyComponent={() => <Text style={{ marginTop: 20, textAlign: "center" }}>Nenhuma foto ainda.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  card: { flexDirection: "row", marginVertical: 8, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#ddd" },
  image: { width: 140, height: 120 },
  info: { flex: 1, padding: 8, justifyContent: "space-between" },
  title: { fontWeight: "bold" },
  desc: { color: "#333" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: 12, color: "#666" },
  deleteBtn: { backgroundColor: "#e53935", padding: 6, borderRadius: 4 },
});
