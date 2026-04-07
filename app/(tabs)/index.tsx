// app/(tabs)/index.tsx
import DashboardScreen from "@/src/screens/DashboardScreen";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import SelecaoExercicios from "@/src/screens/SelecaoExercicios";
import Agendamento from "../../src/screens/Agendamento";
import DesafiosScreen from "../../src/screens/DesafiosScreen";
import HomeScreen from "../../src/screens/HomeScreen";
import ListaUsuarios from "../../src/screens/ListaUsuarios";
import LoginScreen from "../../src/screens/LoginScreen";
import Perfil from "../../src/screens/Perfil";
import Receipts from "../../src/screens/Receipts";
import RegisterScreen from "../../src/screens/RegisterScreen";
import RewardsList from "../../src/screens/RewardsList";
import ShopCart from "../../src/screens/ShopCart";
import TreinarFase2 from "../../src/screens/TreinarFase2";
import TreinarFase3 from "../../src/screens/TreinarFase3";
import TreinarScreen from "../../src/screens/TreinarScreen";


import { StoreProvider } from "../../src/screens/Store";

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

export default function RootStack() {
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
