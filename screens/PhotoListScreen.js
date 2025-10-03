// Componentes básicos do React Native
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Image, Alert } from "react-native";

// URL JSON Server
const BASE_URL = "http://10.110.12.20:3000";


/*
    Photos guarda todas as fotos carregadas
    Editing que define se estamos editando alguma foto
    Titulo e descricao para título e descrição durante a edição
*/
export default function PhotoListScreen({ navigation }) {

    const [photos, setPhotos] = useState([]);
    const [editing, setEditing] = useState(null);

    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");

    // Função GET para carregar fotos
    const loadPhotos = async () => {
        try {
            const res = await fetch(`${BASE_URL}/photos`);
            const data = await res.json();
            setPhotos(data); // Atualiza o estado com as fotos
        } catch (e) {
            console.error(e);
        }
    };

    // useEffect para recarregar as fotos
    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", loadPhotos);
        return unsubscribe;
    }, [navigation]);

    // Função para usando DELETE para deletar uma foto
    const deletePhoto = async (id) => {
        try {
            await fetch(`${BASE_URL}/photos/${id}`, { method: "DELETE" }); // DELETE /photos/:id
            loadPhotos(); // Recarrega a lista
        } catch (e) {
            Alert.alert("Erro", "Não foi possível deletar");
        }
    };

    // Função para com PUT para atualizar a foto
    const updatePhoto = async (id) => {
        try {
            await fetch(`${BASE_URL}/photos/${id}`, {
                method: "PUT", // PUT para atualizar
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...editing, // mantém os dados originais
                    titulo_foto: titulo, // atualiza o título
                    descricao_foto: descricao, // atualiza a descrição
                }),
            });
            // Limpa estado de edição
            setEditing(null);
            setTitulo("");
            setDescricao("");
            loadPhotos(); // Recarrega lista
        } catch (e) {
            Alert.alert("Erro", "Não foi possível editar");
        }
    };

    // Renderiza cada item da lista de fotos
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            {/* Mostra a imagem */}
            <Image source={{ uri: item.uri }} style={styles.image} />

            {editing?.id === item.id ? (
                // Se estiver editando este item
                <>
                    <TextInput
                        value={titulo}
                        onChangeText={setTitulo}
                        placeholder="Novo título"
                        style={styles.input}
                    />
                    <TextInput
                        value={descricao}
                        onChangeText={setDescricao}
                        placeholder="Nova descrição"
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={() => updatePhoto(item.id)} style={styles.btnEdit}>
                        <Text style={styles.btnText}>Salvar</Text>
                    </TouchableOpacity>
                </>
            ) : (
                // Caso contrário, mostra título, descrição e botões de ação
                <>
                    <Text style={styles.title}>{item.titulo_foto}</Text>
                    <Text>{item.descricao_foto}</Text>
                    <View style={styles.actions}>
                        {/* Botão de editar */}
                        <TouchableOpacity
                            onPress={() => {
                                setEditing(item); // Define o item que está sendo editado
                                setTitulo(item.titulo_foto); // Preenche input com título atual
                                setDescricao(item.descricao_foto); // Preenche input com descrição atual
                            }}
                            style={styles.btnEdit}
                        >
                            <Text style={styles.btnText}>Editar</Text>
                        </TouchableOpacity>
                        {/* Botão de deletar */}
                        <TouchableOpacity onPress={() => deletePhoto(item.id)} style={styles.btnDelete}>
                            <Text style={styles.btnText}>Excluir</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            {/* Botão para ir para a tela da câmera */}
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("Camera")}>
                <Text style={styles.btnText}>+ Nova Foto</Text>
            </TouchableOpacity>
            {/* Lista de fotos */}
            <FlatList
                data={photos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
            />
        </View>
    );
}

// Estilos
const styles = StyleSheet.create({
    card: {
        padding: 10,
        margin: 8,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        elevation: 2
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginBottom: 8
    },
    title: {
        fontWeight: "bold",
        fontSize: 16
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8
    },
    btnEdit: {
        backgroundColor: "#1976d2",
        padding: 6,
        borderRadius: 4
    },
    btnDelete: {
        backgroundColor: "#d32f2f",
        padding: 6,
        borderRadius: 4
    },
    btnText: {
        color: "#fff",
        fontWeight: "bold"
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 6,
        marginVertical: 4
    },
    addBtn: {
        backgroundColor: "#388e3c",
        padding: 12,
        alignItems: "center"
    },
});