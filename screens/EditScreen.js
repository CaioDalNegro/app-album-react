import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";

const BASE_URL = "http://10.110.12.28:3000";

export default function EditScreen({ route, navigation }) {
  const { photo } = route.params;
  const [titulo, setTitulo] = useState(photo.titulo_foto || "");
  const [descricao, setDescricao] = useState(photo.descricao_foto || "");

  const handleSave = async () => {
    try {
      const updated = {
        ...photo,
        titulo_foto: titulo,
        descricao_foto: descricao,
      };

      const res = await fetch(`${BASE_URL}/photos/${photo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Erro ao atualizar");

      Alert.alert("Salvo", "Foto atualizada com sucesso!");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível atualizar.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Título" />
      <TextInput style={[styles.input, { height: 100 }]} value={descricao} onChangeText={setDescricao} placeholder="Descrição" multiline />
      <Button title="Salvar" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, flex: 1, backgroundColor: "#fff" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12, borderRadius: 6 },
});
