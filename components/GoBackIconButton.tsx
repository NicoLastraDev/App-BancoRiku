import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { TouchableOpacity } from 'react-native'

const GoBackIconButton = () => {

  return (
    <TouchableOpacity
      className='absolute top-10, left-4 z-10'
      onPress={() => {router.dismiss()}}
      hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
      <Ionicons name='arrow-back-outline' size={36} color={'black'}/>
    </TouchableOpacity>
  )
}

export default GoBackIconButton