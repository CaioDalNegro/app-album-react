/*
  1- Importa componentes básicos do React Native
  2- Importa o CameraView e hook de permissões do Expo Camera
  3- Importa a versão legacy do FileSystem para mover arquivos
*/

import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Button, Image, StyleSheet, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from 'expo-file-system/legacy';

// URL JSON Server
const BASE_URL = "http://10.110.12.20:3000";


export default function CameraScreen() {

  /*
    1- Facing é o estado para definir a câmera traseira e frontal
    2- CapturedPhoto armazena a foto capturada om uri
    3- CameraRef para acessar diretamente os métodos da câmera
    4- Permission é as permissões da câmera
  */
  const [facing, setFacing] = useState("back");    
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  // Enquanto a permissão ainda não foi carregada, renderiza View vazia
  if (!permission) return <View />;

  // Caso a permissão seja negada, mostra mensagem e botão para solicitar novamente
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Preciso da sua permissão para usar a câmera</Text>
        <Button title="Conceder permissão" onPress={requestPermission} />
      </View>
    );
  }

  // Função para alternar entre câmera traseira e frontal
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // Função assíncrona para tirar foto usando a câmera
  const takePicture = async () => {
    if (cameraRef.current) {
      // Captura a foto e guarda no estado capturedPhoto
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedPhoto(photo);
      console.log("Foto capturada:", photo.uri); // Loga a URI no console
    }
  };

  // Função assíncrona para salvar a foto no JSON Server
  const savePhoto = async () => {
    if (!capturedPhoto) return; // Se não tiver foto, retorna

    try {
      // Cria um nome único para a foto e define o caminho no armazenamento persistente
      const fileName = `photo_${Date.now()}.jpg`;
      const newPath = FileSystem.documentDirectory + fileName;
      // Move a foto do cache temporário para o armazenamento persistente
      await FileSystem.moveAsync({ from: capturedPhoto.uri, to: newPath });

      // Cria objeto com informações da foto para enviar ao JSON Server
      const newPhotoObj = {
        titulo_foto: "Sem título",
        descricao_foto: "",
        data_foto: new Date().toISOString(),
        uri: newPath,
      };

      // Requisição POST para salvar no JSON Server
      const res = await fetch(`${BASE_URL}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPhotoObj),
      });

      // Se não foi possível salvar, lança erro
      if (!res.ok) throw new Error("Erro ao salvar no servidor");

      // Mostra alerta de sucesso e limpa a foto do estado
      Alert.alert("Sucesso", "Foto salva no banco!");
      setCapturedPhoto(null);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", err.message); // Mostra alerta de erro
    }
  };

  // Se há foto capturada, exibe preview com botões
  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        {/* Mostra a foto capturada */}
        <Image source={{ uri: capturedPhoto.uri }} style={styles.preview} />
        {/* Botão para tirar outra foto */}
        <View style={{ margin: 10 }}>
          <Button title="Tirar outra foto" onPress={() => setCapturedPhoto(null)} />
        </View>
        {/* Botão para salvar a foto */}
        <View style={{ margin: 10 }}>
          <Button title="Salvar Foto" onPress={savePhoto} />
        </View>
      </View>
    );
  }

  // Tela padrão da câmera quando ainda não tirou foto
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
        <View style={styles.buttonContainer}>
          {/* Botão para alternar câmera */}
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Virar câmera</Text>
          </TouchableOpacity>
          {/* Botão para tirar foto */}
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Tirar Foto</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

// Estilos do componente
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center" 
  },
  camera: { 
    flex: 1 
  },
  buttonContainer: { 
    flex: 1, 
    flexDirection: "row", 
    margin: 64, 
    backgroundColor: "transparent" 
  },
  button: { 
    flex: 1, 
    alignItems: "center", 
    alignSelf: "flex-end" },
  text: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#fff"
   },
  preview: { 
    flex: 1, 
    resizeMode: "contain" 
  },
});