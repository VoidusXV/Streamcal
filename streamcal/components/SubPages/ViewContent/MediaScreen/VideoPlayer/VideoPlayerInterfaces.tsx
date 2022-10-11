import { ViewStyle } from "react-native";
import { IGeneratedImages } from "../../../../constants/interfaces";

interface ISliderBar {
  isFullscreen: Boolean;
  positionMilli?: Number;
  maximumValue: Number;
  onValueChange?: any;
  onSlidingComplete?: any;
  value?: Number;
  onTouchStart?: any;
}

interface ISlider_Preview {
  getSliderValue: any;
  imageURI: any;
  status: any;
  CroppedImages: IGeneratedImages[];
  isFullScreen: any;
}

interface IVideoPlayer {
  VideoRef: any;
  CroppedImages: any;
  isFullScreen?: any;
  navigation?: any;
  ScreenButtonOnPress?: any;
  style?: ViewStyle | ViewStyle[];
  onSkipBackward?: any;
  onSkipForward?: any;
}

interface ITopButton {
  isFullscreen: any;
  BackButtonOnPress?: any;
  ScreenButtonOnPress?: any;
  onSkipForward?: any;
  onSkipBackward?: any;
}

interface IMiddle_Buttons {
  isFullscreen: any;
  status: any;
  VideoRef: any;
  onPressAllButtons: any;
}
export { ISliderBar, IGeneratedImages, ISlider_Preview, IVideoPlayer, ITopButton, IMiddle_Buttons };
