import { IEpisodes } from "../../components/constants/interfaces";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

interface IMediaRouteParams {
  item?: any;
  Episodes?: Array<IEpisodes>;
  ContentTitle?: any;
  ContentID?: any;
  index?: any;
  getSeason?: any;
  //navigation?: NativeStackNavigationProp<any, any>;
  isFullScreen?: any;
}

interface IMediaScreen {
  route?: any;
  navigation?: NativeStackNavigationProp<any>;
}
export { IMediaRouteParams, IMediaScreen };
