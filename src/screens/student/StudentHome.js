import React, { useContext, useState, useEffect, useRef } from 'react';
import { 
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar
} from 'react-native';
import { colors } from '../../constants/colors';
import { hp, wp } from '../../util/dimension';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppContext } from '../../context/AppContext';
import { generateColor } from '../../util/randomColor';
import ImageView from '../../components/ImageView';
import { deleteFromStorage } from '../../util/storageUtil';
import { logout } from '../../context/action';
import { useToast } from 'react-native-toast-notifications';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  where
} from 'firebase/firestore';
import ClassSubjectCard from '../../components/ClassSubjectCard';
import TeacherSubject from '../../components/TeacherSubject';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import ActionCards from '../admin/components/ActionCards';
import { Paystack } from 'react-native-paystack-webview';
import EnterPayModal from './component/EnterPayModal';
import { makeid } from '../../util/util';

function StudentHome({ navigation }) {
  const { state, dispatch } = useContext(AppContext);

  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [fees, setFees] = useState(null);
  const [paySettings, setPaysettings] = useState({});
  const [paymentCheck, setPaymentCheck] = useState({});
  const [payHistory, setPayHistory] = useState([]);

  const toast = useToast();

  const db = getFirestore();

  const paystackWebViewRef = useRef();

  const feesRef = query(collection(db, "fees"));
  const paymentRef = query(collection(db, "payments"), where("email", "==", state.user.email));
  
  useEffect(() => {
    const unsubscribe = onSnapshot(paymentRef, (querySnapshot) => {
      const allData = [];
      querySnapshot.forEach((doc) => {
        let singleData = {...doc.data(), id: doc.id};
        allData.push(singleData);
      });
      setPayHistory(allData);
    },
    (error) => {
      console.log(error);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const geFees = async () => {
      let fees = await getDocs(feesRef);
      let allFees = fees.docs.map((item) => {
        return item.data();
      })
      setFees(allFees[0]);
      // console.log(allFees[0]);
    }

    geFees();
  }, []);

  useEffect(() => {
    let paymentCheckObj = {};
    let schoolFeeCheck = payHistory.find((pay) => {
      return pay.paymentType === 'schoolFee';
    });

    console.log(schoolFeeCheck)

    let hostelFeeCheck = payHistory.find((pay) => {
      return pay.paymentType === 'hostelFee';
    });

    if(schoolFeeCheck !== undefined) {
      console.log('schoolFeeCheck !== undefined')
      paymentCheckObj = {...paymentCheck, schoolFee: true};
    } else {
      paymentCheckObj = {...paymentCheck, schoolFee: false};
    }

    if(hostelFeeCheck !== undefined) {
      paymentCheckObj = {...paymentCheck, hostelFee: true};
    } else {
      paymentCheckObj = {...paymentCheck, hostelFee: false};
    }

    setPaymentCheck(paymentCheckObj);

  }, [payHistory]);

  function checkPay(payType) {
    return payType.paymentType === paySettings.paymentType;
  }

  const handlePayment = (paymentType) => {    
    if (!fees) return;

    if (paymentCheck.schoolFee && paymentType === 'schoolFee') {
      toast.show('You paid your school fee already');
      return;
    };

    if (paymentCheck.hostelFee && paymentType === 'hostelFee') {
      toast.show('You paid your hostel fee already');
      return;
    };

    if (paymentType === 'schoolFee') {
      setPaysettings({fee: fees.schoolFee, paymentType: paymentType});
      paystackWebViewRef.current.startTransaction();
    }

    if (paymentType === 'hostelFee') {
      setPaysettings({fee: fees.hostelFee, paymentType: paymentType});
      paystackWebViewRef.current.startTransaction();
    }
  }

  const onPaymentSuccess = async (res) => {
    try {
      setLoading(true);
      let data = {
        ...state.user,
        reference: res.data.transactionRef.reference,
        amount: paySettings.fee,
        paymentType: paySettings.paymentType,
        status: res.data.transactionRef.status,
        transaction: res.data.transactionRef.transaction,
        paidAt: new Date(),
      };
      // console.log(data);

      const paymentRef = doc(db, 'payments', makeid(20));

      // set data in firestore
      let Info = await setDoc(paymentRef, data);
      setLoading(false);
      toast.show('Payment successfull');
    } catch (error) {
      setLoading(false);
      console.log(error)
    }
  };

  const allFeesPaid = () => {
    let pay = 0;
    payHistory.forEach(data => {
      pay = pay + parseInt(data.amount)
      // console.log(pay)
    });
    return pay;
  }

  const handleLogOut = () => {
    deleteFromStorage('userData')
      .then((response) => {
        dispatch(logout());
        // dispatch(resetState())
      })
  }

  return (
    <SafeAreaView style={styles.main}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#ffffff'} />
      <ScrollView style={{ flex: 1, marginHorizontal: wp(20), }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {/* <ImageView
            image={{uri: 'https://randomuser.me/api/portraits/women/8.jpg'}}
            width={wp(55)}
            height={wp(55)}
            /> */}
          <View style={styles.userInfoContainer}>
            <Text style={styles.name}>{state.user.firstName} {state.user.lastName}</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.description}>{state.user.role} - {state.user.class}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogOut}>
            <View style={styles.iconContainer}>
              <Ionicons name={'log-out-outline'} size={wp(20)} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>
            Total fees paid by you
          </Text>
          <Text style={styles.infoValue}>
            N {allFeesPaid().toLocaleString('en-US', { minimumFractionDigits: 2})}
          </Text>
        </View>
        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { fontSize: wp(14) }]}>Quick Actions</Text>
        </View>
        <View style={{
          flexDirection: 'row',
          marginTop: hp(25),
          alignItems: 'center',
          justifyContent: 'space-between'}}>
          <TouchableOpacity style={{alignItems: 'center', flex: 1}} onPress={() => {
            handlePayment('schoolFee');
          }}>
              <Ionicons name={'cash-outline'} color={colors.primary} size={wp(25)} />
              <Text style={{ marginTop: hp(8) }}>School fee</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{alignItems: 'center', flex: 1}} onPress={() => {
            handlePayment('hostelFee')
            }}>
            <FontAwesome name={'bank'} color={colors.primary} size={wp(25)} />
            <Text style={{ marginTop: hp(8) }}>Hostel fee</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{alignItems: 'center', flex: 1}} onPress={() => navigation.navigate('Results')}>
            <FontAwesome name={'paper-plane'} color={colors.primary} size={wp(25)} />
            <Text style={{ marginTop: hp(8) }}>Check result</Text>
          </TouchableOpacity>
        </View>
        <View style={{
          paddingBottom: hp(20),
          marginTop: hp(25),
          flexWrap: 'wrap',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          {/* <ClassSubjectCard /> */}
          {/* #294743 */}
          {/* #294743 */}
          <ActionCards
            color={'#294743'}
            value={'History'}
            title={'payment'}
            onPress={() => navigation.navigate('PaymentHistory')}
            iconName={'cash-outline'}
          />
          <ActionCards
            color={'#451460'}
            value={'Results'}
            title={'Your'}
            onPress={() => navigation.navigate('Results')}
            iconName={'cash-outline'}
          />
        </View>
      </ScrollView>
      <Paystack  
        paystackKey="pk_test_b61b0e265f29c5a924ec564a4c029af5722d012f"
        ref={paystackWebViewRef}
        amount={paySettings.fee}
        billingEmail={state.user.email}
        activityIndicatorColor="green"
        onCancel={(e) => {
          // handle response here
        }}
        onSuccess={onPaymentSuccess}
      />
      {/* <EnterPayModal
        isVisible={isVisible}
        onPressCancel={() => setIsVisible(false)} 
        onPressNext={handlePayment}
      /> */}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size={'small'} color={colors.white} />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    // marginHorizontal: wp(20),
  },
  header: {
    marginTop: hp(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoContainer: {
    flex: 1,
    // marginLeft: wp(10)
  },
  name: {
    fontSize: wp(20),
    fontWeight: '500',
    color: colors.primary
  },
  description: {
    fontSize: wp(16),
    textTransform: 'capitalize',
    fontWeight: '500',
    color: '#00000070'
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(35),
    height: wp(35),
    borderRadius: 7,
    backgroundColor: colors.primary + '10',
  },
  infoContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: hp(20),
    paddingVertical: hp(22),
    borderRadius: wp(10),
    backgroundColor: colors.primary + 20,
  },
  infoTitle: {
    fontSize: wp(16),
    fontWeight: '300',
    color: colors.primary + 80,
  },
  infoValue: {
    fontSize: wp(35),
    fontWeight: '700',
    marginTop: hp(10),
    color: colors.primary
  },
  sectionTitleContainer: {
    marginTop: hp(25),
  },
  sectionTitle: {
    fontSize: wp(22),
    fontWeight: '700',
    color: colors.primary
  },
  loading: {
    flex: 1,
    position: 'absolute',
    height: hp(812),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000090',
  }
})

export default StudentHome;