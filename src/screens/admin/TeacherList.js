import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { hp, wp } from '../../util/dimension';
import { colors } from '../../constants/colors';
import Input from '../../components/Input';
import HeaderLite from '../../components/HeaderLite';
import Userlist from '../../components/Userlist';
import { users } from '../../constants/mockData';
import Button from '../../components/Button';
import AddAdminModal from './components/AddAdminModal';
import { useToast } from 'react-native-toast-notifications';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import AddTeacherModal from './components/AddTeacherModal';

function TeacherList({navigation}) {
  const [addAdminModal, setAddAdminModal] = useState(false);
  const [teacher, setTeacher] = useState([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const db = getFirestore();

  const adminsRef = query(collection(db, "users"), where("role", "==", 'teacher'));

  useEffect(() => {
    const getTeacher = async () => {
      let teacher = await getDocs(adminsRef);
      let allAdmins = teacher.docs.map((item) => {
        return item.data();
      })
      setTeacher(allAdmins);
      console.log(allAdmins);
    }
  
    getTeacher();
  });

  return (
    <SafeAreaView style={styles.main}>
      <HeaderLite title={'Teacher List'} onPress={() => navigation.goBack()} />
      {/* <View style={styles.searchContainer}>
        <Input height={hp(48)} placeholder={'Search the list'} />
      </View> */}
      <ScrollView style={styles.content}>
        {teacher.map((item, index) => (
          <Userlist
            key={item.id}
            onPress={() => navigation.navigate('Profile', item)}
            image={{ uri: item.image }}
            name={item.firstName + ' ' + item.lastName}
            description={item.role} />
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button dark title={'Add new teacher'} onPress={() => setAddAdminModal(true)} />
      </View>
      <AddTeacherModal isVisible={addAdminModal} onPressCancel={() => setAddAdminModal(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    // marginHorizontal: wp(20),
  },
  searchContainer: {
    marginTop: hp(20),
    marginHorizontal: wp(20),
  },
  content: {
    marginTop: hp(20),
    paddingHorizontal: wp(20),
  },
  buttonContainer: {
    // position: 'absolute',
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    marginBottom: hp(25),
  },
})

export default TeacherList;