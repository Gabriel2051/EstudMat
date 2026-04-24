import { StoreProvider } from "@/screens/Store";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

// Importações com Alias @/
import Agendamento from "@/screens/Agendamento";
import DashboardScreen from "@/screens/DashboardScreen";
import DesafiosScreen from "@/screens/DesafiosScreen";
import HomeScreen from "@/screens/HomeScreen";
import ListaUsuarios from "@/screens/ListaUsuarios";
import LoginScreen from "@/screens/LoginScreen";
import Perfil from "@/screens/Perfil";
import Receipts from "@/screens/Receipts";
import RegisterScreen from "@/screens/RegisterScreen";
import RewardsList from "@/screens/RewardsList";
import SelecaoExercicios from "@/screens/SelecaoExercicios";
import ShopCart from "@/screens/ShopCart";
import TreinarFase2 from "@/screens/TreinarFase2";
import TreinarFase3 from "@/screens/TreinarFase3";
import TreinarScreen from "@/screens/TreinarScreen";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Perfil: { userId?: string } | undefined;
  ListaUsuarios: undefined;
  Agendamento: undefined;
  RewardsList: undefined;
  ShopCart: undefined;
  Receipts: undefined;
  Desafios: undefined;
  Treinar: undefined;
  SelecaoExercicios: undefined;
  TreinarFase2: undefined;
  TreinarFase3: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <StoreProvider>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="ListaUsuarios" component={ListaUsuarios} />
        <Stack.Screen name="Agendamento" component={Agendamento} />
        <Stack.Screen name="RewardsList" component={RewardsList} />
        <Stack.Screen name="ShopCart" component={ShopCart} />
        <Stack.Screen name="Receipts" component={Receipts} />
        <Stack.Screen name="Desafios" component={DesafiosScreen} />
        <Stack.Screen name="Treinar" component={TreinarScreen} />
        <Stack.Screen name="SelecaoExercicios" component={SelecaoExercicios} />
        <Stack.Screen name="TreinarFase2" component={TreinarFase2} />
        <Stack.Screen name="TreinarFase3" component={TreinarFase3} />
      </Stack.Navigator>
    </StoreProvider>
  );
}