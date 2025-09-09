import React, { useState, useEffect } from "react";
import { 
  Button, Text, TextInput, View, StyleSheet, 
  FlatList, TouchableOpacity, Image, Alert 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =========================
// Tela Cliente
// =========================
const TelaCliente = ({
  nome, setNome,
  telefone, setTelefone,
  servico, setServico,
  descricao, setDescricao,
  imagem, setImagem,
  enviarSolicitacao,
  abrirCamera,
  abrirLogin
}) => (
  <View style={styles.container}>
    <Text style={styles.titulo}>Solicitar Manutenção</Text>

    <TextInput
      placeholder="Nome"
      placeholderTextColor="#888"
      style={styles.input}
      value={nome}
      onChangeText={setNome}
    />
    <TextInput
      placeholder="Telefone"
      placeholderTextColor="#888"
      style={styles.input}
      value={telefone}
      onChangeText={setTelefone}
      keyboardType="phone-pad"
    />
    <TextInput
      placeholder="Serviço (Ex: Formatação, Limpeza)"
      placeholderTextColor="#888"
      style={styles.input}
      value={servico}
      onChangeText={setServico}
    />
    <TextInput
      placeholder="Descrição (opcional)"
      placeholderTextColor="#888"
      style={styles.input}
      value={descricao}
      onChangeText={setDescricao}
    />

    <Button title="Tirar Foto" onPress={abrirCamera} />
    {imagem && (
      <Image source={{ uri: imagem }} style={styles.preview} />
    )}

    <Button title="Enviar Solicitação" onPress={enviarSolicitacao} />

    <TouchableOpacity onPress={abrirLogin}>
      <Text style={styles.link}>Acessar como Administrador</Text>
    </TouchableOpacity>
  </View>
);

// =========================
// Tela Login Admin
// =========================
const TelaLogin = ({
  usuario, setUsuario,
  senha, setSenha,
  fazerLogin,
  voltar
}) => (
  <View style={styles.container}>
    <Text style={styles.titulo}>Login do Administrador</Text>
    <TextInput
      placeholder="Usuário"
      placeholderTextColor="#888"
      style={styles.input}
      value={usuario}
      onChangeText={setUsuario}
    />
    <TextInput
      placeholder="Senha"
      placeholderTextColor="#888"
      style={styles.input}
      value={senha}
      onChangeText={setSenha}
      secureTextEntry
    />
    <Button title="Entrar" onPress={fazerLogin} />
    <TouchableOpacity onPress={voltar}>
      <Text style={styles.link}>Voltar</Text>
    </TouchableOpacity>
  </View>
);

// =========================
// Tela Admin
// =========================
const TelaAdmin = ({
  solicitacoes,
  atualizarStatus,
  sair
}) => (
  <View style={styles.container}>
    <Text style={styles.titulo}>Painel do Administrador</Text>

    {solicitacoes.length === 0 ? (
      <Text style={{ color: "#fff" }}>Nenhuma solicitação recebida.</Text>
    ) : (
      <FlatList
        data={solicitacoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.servico}</Text>
            <Text style={{ color: "#fff" }}>Cliente: {item.nome}</Text>
            <Text style={{ color: "#fff" }}>Telefone: {item.telefone}</Text>
            <Text style={{ color: "#fff" }}>Status: {item.status}</Text>
            {item.imagem && (
              <Image source={{ uri: item.imagem }} style={styles.preview} />
            )}
            <View style={styles.botoes}>
              <Button
                title="Concluído"
                onPress={() => atualizarStatus(item.id, "Concluído")}
              />
              <Button
                title="Em Andamento"
                onPress={() => atualizarStatus(item.id, "Em Andamento")}
              />
            </View>
          </View>
        )}
      />
    )}

    <TouchableOpacity onPress={sair}>
      <Text style={styles.link}>Sair</Text>
    </TouchableOpacity>
  </View>
);

// =========================
// Componente Principal
// =========================
export default function App() {
  const [pagina, setPagina] = useState("cliente"); // cliente | login | admin
  const [solicitacoes, setSolicitacoes] = useState([]);

  // Campos do formulário cliente
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [servico, setServico] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState(null);

  // Login admin
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  const usuarioAdmin = "admin";
  const senhaAdmin = "1234";

  // Carregar solicitações salvas
  useEffect(() => {
    const carregar = async () => {
      try {
        const data = await AsyncStorage.getItem("solicitacoes");
        if (data) setSolicitacoes(JSON.parse(data));
      } catch (e) {
        console.log("Erro ao carregar:", e);
      }
    };
    carregar();
  }, []);

  // Salvar solicitações
  useEffect(() => {
    AsyncStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
  }, [solicitacoes]);

  // Abrir câmera
  const abrirCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão necessária", "Precisamos de acesso à câmera para tirar fotos.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  // Enviar solicitação
  const enviarSolicitacao = () => {
    if (!nome || !telefone || !servico) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios!");
      return;
    }
    const nova = {
      id: Date.now().toString(),
      nome,
      telefone,
      servico,
      descricao,
      imagem,
      status: "Pendente",
    };
    setSolicitacoes([...solicitacoes, nova]);
    setNome("");
    setTelefone("");
    setServico("");
    setDescricao("");
    setImagem(null);
    Alert.alert("Sucesso", "Solicitação enviada!");
  };

  // Atualizar status
  const atualizarStatus = (id, novoStatus) => {
    setSolicitacoes(prev =>
      prev.map(s => s.id === id ? { ...s, status: novoStatus } : s)
    );
  };

  // Login admin
  const fazerLogin = () => {
    if (usuario === usuarioAdmin && senha === senhaAdmin) {
      setPagina("admin");
      setUsuario("");
      setSenha("");
    } else {
      Alert.alert("Erro", "Usuário ou senha inválidos");
    }
  };

  // Renderização
  if (pagina === "cliente") return (
    <TelaCliente
      nome={nome} setNome={setNome}
      telefone={telefone} setTelefone={setTelefone}
      servico={servico} setServico={setServico}
      descricao={descricao} setDescricao={setDescricao}
      imagem={imagem} setImagem={setImagem}
      enviarSolicitacao={enviarSolicitacao}
      abrirCamera={abrirCamera}
      abrirLogin={() => setPagina("login")}
    />
  );

  if (pagina === "login") return (
    <TelaLogin
      usuario={usuario} setUsuario={setUsuario}
      senha={senha} setSenha={setSenha}
      fazerLogin={fazerLogin}
      voltar={() => setPagina("cliente")}
    />
  );

  if (pagina === "admin") return (
    <TelaAdmin
      solicitacoes={solicitacoes}
      atualizarStatus={atualizarStatus}
      sair={() => setPagina("cliente")}
    />
  );
}

// =========================
// Estilos
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0b0b0b",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#350de9ff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#444",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#1a1a1a",
    color: "#fff",
  },
  preview: {
    width: "100%",
    height: 150,
    marginVertical: 10,
    borderRadius: 5,
  },
  link: {
    marginTop: 8,
    textAlign: "center",
    color: "#3b82f6",
    textDecorationLine: "underline",
  },
  card: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#350de9ff",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
  botoes: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});
