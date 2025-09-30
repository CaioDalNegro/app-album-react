import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from "react-native";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

const BASE_URL = "http://10.110.12.28:3000";

export default function CameraScreen({ navigation }) {
  const camRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [mediaPermission, setMediaPermission] = useState(null);
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    (async () => {
      const cam = await Camera.requestCameraPermissionsAsync();
      setHasPermission(cam.status === "granted");
      const ml = await MediaLibrary.requestPermissionsAsync();
      setMediaPermission(ml.status === "granted");
    })();
  }, []);

  if (hasPermission === null) return <View><Text>Solicitando permissão...</Text></View>;
  if (hasPermission === false) return <View><Text>Sem permissão para usar a câmera.</Text></View>;

  const takeAndSave = async () => {
    if (!camRef.current) return;
    setTakingPhoto(true);
    try {
      const photo = await camRef.current.takePictureAsync({ quality: 0.7 });
      // photo.uri exemplo: file:///data/user/0/.../tmp/exp-xxx.jpg

      // criar nome único
      const fileName = `photo_${Date.now()}.jpg`;
      const newPath = FileSystem.documentDirectory + fileName;

      // mover do cache para documentDirectory (persistente do app)
      await FileSystem.moveAsync({
        from: photo.uri,
        to: newPath,
      });

      // preparar objeto para enviar ao JSON-Server
      const newPhotoObj = {
        titulo_foto: titulo || "Sem título",
        descricao_foto: descricao || "",
        data_foto: new Date().toISOString(),
        uri: newPath,
      };

      // POST com fetch
      const res = await fetch(`${BASE_URL}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPhotoObj),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar no servidor");
      }

      Alert.alert("Sucesso", "Foto salva com sucesso!");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível tirar/salvar a foto. " + err.message);
    } finally {
      setTakingPhoto(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} ref={camRef} ratio="16:9" />
      <View style={styles.panel}>
        <TextInput placeholder="Título" value={titulo} onChangeText={setTitulo} style={styles.input} />
        <TextInput placeholder="Descrição" value={descricao} onChangeText={setDescricao} style={styles.input} />
        <TouchableOpacity style={styles.button} onPress={takeAndSave} disabled={takingPhoto}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>{takingPhoto ? "Salvando..." : "Tirar e Salvar"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 10, backgroundColor: "#fff" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8, marginBottom: 8 },
  button: { backgroundColor: "#1976d2", padding: 12, borderRadius: 6, alignItems: "center" },
});
