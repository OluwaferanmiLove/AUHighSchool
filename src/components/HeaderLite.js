import React from 'react';
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { hp, wp } from '../util/dimension';

function HeaderLite({onPress, title, description}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.iconContainer}>
          <Ionicons name={'arrow-back'} size={wp(20)} color={colors.primary} />
        </View>
      </TouchableOpacity>
      <View>
        <Text style={styles.headerTitle}>{title}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
      <View></View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(15),
    marginHorizontal: wp(20),
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(35),
    height: wp(35),
    borderRadius: 7,
    backgroundColor: colors.primaryLighter + '10',
  },
  headerTitle: {
    marginLeft: wp(10),
    fontSize: wp(22),
    fontWeight: '700',
    color: colors.primary
  },
  description: {
    marginLeft: wp(10),
    fontSize: wp(14),
    fontWeight: '500',
    color: colors.primary
  },
})

export default HeaderLite;