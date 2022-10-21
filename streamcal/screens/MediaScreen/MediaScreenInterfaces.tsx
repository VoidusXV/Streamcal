import { IEpisode } from "../../components/constants/interfaces";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

interface IMediaRouteParams {
  Episode?: IEpisode;
  Episodes?: Array<IEpisode>;
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
