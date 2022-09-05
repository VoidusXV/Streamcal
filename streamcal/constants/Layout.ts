import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const WindowSize= {
  Width: width,
  Height: height,
}
export  {
  WindowSize,
 // isSmallDevice: width < 375,
};
