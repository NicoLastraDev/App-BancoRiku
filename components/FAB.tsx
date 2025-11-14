import { Image, Text, TouchableOpacity } from 'react-native';

interface Props {
  iconSource: any;
  onPress: () => void;
  iconColor?: string;
  children?: React.ReactNode;
}


export const FAB = ({ iconSource, onPress, children }: Props) => {

  return (
    <TouchableOpacity
      onPress={onPress}>
        <Image
        source={iconSource}
        style={{
          width:70,
          height: 70,
          marginRight: children ? 8 : 0,
        }}
      />
      {children && (
        <Text>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};