// Importações dos hookes useState, useEffect e useRef
import React, { useState, useEffect, useRef } from "react";

// Importação dos componentes React Native que serão utilizados na tela
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";

// Importação do Expo-Câmera
import { CameraView, useCameraPermissions } from "expo-camera";

function CameraComponent(){
    // Estado que define se a camêra será frontal ou traseira 'front' ou 'back'
    const [facing, setFacing] = useState('back');

    /*
        - Hook do expo para lidar com permissão do usuário
        - permission = estado da permissão
        - requestPermission = função que solicita a permissão ao usuário
    */
    const [permission, requestPermission] = useCameraPermissions();

    // Estado para guardar a foto capturada
    const [capturedPhoto, setCapturedPhoto] = useState(null);

    // Referencia para acesso direto aos métodos da câmera
    const cameraRef = useRef(null);

    // Executado quando o componente é montado
    useEffect(()=>{
        // Solicita permissão assim que o componente é montado
        requestPermission();
    },[])

    // Caso permission não tenha tido retorno ainda
    if (!permission) {
        return <View/>
    }

    // Retorno com a permissão nao concedida
    if(!permission.granted){
        return(
            <View style={styles.container}>
                <Text>Preciso de sua permissão para rodar</Text>
                <Button onPress={requestPermission} title="Conceder permissão!"/>
            </View>
        )
    }

    // Função para alternar entre câmera frontal e traseira
    function toggleCameraFacing(){
        setFacing(current => (current === 'back' ? 'front' : 'back'))
    }

    // Função que tira uma foto - função assíncrona
    async function takePicture() {
        if(cameraRef.current){
            // Usa a refêrencia da camera para capturar uma foto
            const photo = await cameraRef.current.takePictureAsync();
            // Guarda a photo capturada no estado 'capturedPhoto'
            setCapturedPhoto(photo);
            // Exibe o path da foto no console
            console.log(photo.uri);
        }
    }

    // Caso haja uma foto capturada ela é exibida
    if (capturedPhoto){
        return(
            <View style={styles.container}>
                <View style={styles.tirar_outra}>
                    <Button title="Tirar outra foto" onPress={() => setCapturedPhoto(null)}/>
                </View>
                <Image source={{uri:capturedPhoto.uri}} style={styles.container}/>
            </View>
        )
    }

    // Renderização padrão (ainda sem foto tirada)
    return (
        <View style={styles.container}>
            <CameraView facing={facing} ref={cameraRef} style={styles.Camera}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <Text>Virar camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity  style={styles.button} onPress={takePicture}>
                        <Text>Tirar Foto</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    )
}

export default CameraComponent;

// Estilos usados no componente
const styles = StyleSheet.create({
    tirar_outra : {marginTop: 50},
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    Camera: {
        flex: 1
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    buttonContainer:{
        flex:1,
        flexDirection:'row',
        backgroundColor:'transparent',
        margin: 64
    },
    text :{
        fontSize: 25,
        fontWeight: "bold",
        color: "white"
    },
    preview: {
        flex:1,
        resizeMode:'contain'
    }
})