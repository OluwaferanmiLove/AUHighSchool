import React from 'react';
import AppContextProvider from './src/context/AppContext';
import { ToastProvider } from 'react-native-toast-notifications';
import AUHighSchool from './src/navigation';
import { colors } from './src/constants/colors';
import { initializeApp } from "firebase/app";
import { hp } from './src/util/dimension';

export default function App() {
  const firebaseConfig = {
    apiKey: "AIzaSyCiTfB6K6oAn8voEsnQk5bZBVe9ttcES_w",
    authDomain: "auhighschool-70d8b.firebaseapp.com",
    projectId: "auhighschool-70d8b",
    storageBucket: "auhighschool-70d8b.appspot.com",
    messagingSenderId: "850660120353",
    appId: "1:850660120353:web:73aebce9631c7863481060"
  };

  initializeApp(firebaseConfig);

  return (
    <AppContextProvider>
      <ToastProvider
        placement="top"
        duration={2000}
        // successColor="green"
        // dangerColor="red"
        // warningColor="orange"
        // normalColor="#6610F2"
        normalColor={colors.primaryLighter}
        offsetTop={hp(40)}
        // renderType={{
        //   normal: (toast) => (
        //     <Toast text={toast.message} bgColor="#6610F2" />
        //   ),
        //   danger: (toast) => (
        //     <Toast text={toast.message} bgColor="#F83C33" />
        //   ),
        //   success: (toast) => (
        //     <Toast text={toast.message} bgColor="#45D988" />
        //   ),
        // }}
        swipeEnabled={true}>
        <AUHighSchool />
      </ToastProvider>
    </AppContextProvider>
  );
}
