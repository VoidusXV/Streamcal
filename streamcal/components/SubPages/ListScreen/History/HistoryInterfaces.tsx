import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { IEpisode } from "../../../constants/interfaces";

interface IHistory {
  navigation: NativeStackNavigationProp<any>;
}

interface IHistoryData {
  ContentID: any;
  SeasonNum: any;
  EpisodeNum: any;
}

interface IFilteredEpisodeHistory {
  ContentTitle?: any;
  HistoryData?: IHistoryData;
  Episodes?: Array<IEpisode>;
  Episode?: IEpisode;
}

export { IHistoryData, IFilteredEpisodeHistory, IHistory };
