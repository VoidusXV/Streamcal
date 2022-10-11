import { currentConnectionInfo } from "../../../../backend/serverConnection";
import { IUserInfo } from "../../../constants/interfaces";

function UnMarkedArray(getUserSelections: any, setUserSelections: any, state = false) {
  let data = [...getUserSelections];
  console.log(data.length);
  data.map((e: any, index: any) => {
    data[index] = state;
  });
  setUserSelections(data);
}

function getSelectedUsersAmount(getUserSelections: any) {
  let count = 0;
  getUserSelections.map((e: any) => e && count++);
  return count;
}

function getSelectedAPIKEYS(getUserSelections: any, getUserData: Array<IUserInfo>) {
  let APIKEY: any = [];
  getUserSelections?.map((e: any, index: any) => {
    if (e) APIKEY.push(getUserData[index].APIKEY);
  });
  return APIKEY;
}

function removeAdminFromArray(UserData: Array<IUserInfo>) {
  UserData?.map((e, index) => {
    if (e?.APIKEY == currentConnectionInfo?.APIKEY)
      // && currentConnectionInfo.isAdmin
      UserData?.splice(index, 1);
  });
}

export { UnMarkedArray, getSelectedUsersAmount, getSelectedAPIKEYS, removeAdminFromArray };
