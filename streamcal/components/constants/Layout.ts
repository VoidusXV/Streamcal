import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;



const Mini_IconSize = width * 0.08;


const WindowSize= {
  Width: width,
  Height: height,
}
export  {
  WindowSize,
  Mini_IconSize
 // isSmallDevice: width < 375,
};
