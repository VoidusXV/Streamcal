import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { IUserInfo } from "../../../constants/interfaces";

interface IManageUsersScreen {
  navigation?: any; //NativeStackScreenProps<any,any>;
  setMessageText?: any;
  route?: RouteProp<any>;
}

interface IUserCard {
  item?: IUserInfo;
  index: any;
  navigation?: NativeStackNavigationProp<any>;
  isManaging?: any;
  getUserSelections?: any;
  setUserSelections?: any;
  onLongPress?: any;
}

interface IEditingButtons {
  setManaging?: any;
  isManaging?: any;
  onManage?: any;
  onCancel?: any;
  onAddUser?: any;
  onSelectAll?: any;
  onUnSelectAll?: any;
}

interface IFlashlist {
  item?: IUserInfo;
  index?: any;
  target?: any;
  extraData?: any;
}
export { IManageUsersScreen, IUserCard, IEditingButtons, IFlashlist };
