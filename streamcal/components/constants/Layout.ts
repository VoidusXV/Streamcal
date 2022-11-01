import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;



const Mini_IconSize = width * 0.08;
const Normal_IconSize = width * 0.1;
const Big_IconSize = width * 0.13;
const Bigger_IconSize = width * 0.15;


const WindowSize= {
  Width: width,
  Height: height,
}
export  {
  WindowSize,
  Mini_IconSize,
  Normal_IconSize,
  Big_IconSize,
  Bigger_IconSize
 // isSmallDevice: width < 375,
};
