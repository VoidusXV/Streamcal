import AsyncStorage from "@react-native-async-storage/async-storage";

const StoreData_AsyncStorage = async (storageKey: any, value: any) => {
  const jsonValue = JSON.stringify(value);
  await AsyncStorage.setItem(storageKey, jsonValue);
};
const GetData_AsyncStorage = async (storageKey: any) => {
  const StringValue: any = await AsyncStorage.getItem(storageKey);
  return JSON.parse(StringValue);
};

const AddData_AsyncStorage = async (storageKey: any, value: any, isArray?: Boolean) => {
  let Data: any = await GetData_AsyncStorage(storageKey);
  if (isArray || !Data) Data = [];

  Data.push(value);
  await StoreData_AsyncStorage(storageKey, Data);
};

export { StoreData_AsyncStorage, GetData_AsyncStorage, AddData_AsyncStorage };
