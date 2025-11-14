import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity } from 'react-native'

const LogoutIconButton = () => {

  return (
    <TouchableOpacity className='absolute top-6, right-6' onPress={() => {}}>
      <Ionicons name='log-out-outline' size={36} color={'#C40808'}/>
    </TouchableOpacity>
  )
}

export default LogoutIconButton