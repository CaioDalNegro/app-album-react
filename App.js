import { useEffect, useState } from "react";
import { View, Text } from "react-native";

export default function App() {
  const [photos, setPhotos] = useState([]); // Estado para armazenar os usuários

  // Função assíncrona para buscar os dados
  const getUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/users"); 
      // Faz a requisição GET ao servidor json-server

      const data = await response.json(); 
      // Converte a resposta em JSON

      setUsers(data); 
      // Atualiza o estado com os dados recebidos
    } catch (error) {
      console.error("Erro ao buscar usuários:", error); 
      // Caso dê erro, exibe no console
    }
  };

  // useEffect para chamar a função ao carregar o app
  useEffect(() => {
    getUsers();
  }, []);

  return (
    <View>
      {users.map(u => (
        <Text key={u.id}>{u.name} - {u.email}</Text>
      ))}
    </View>
  );
}