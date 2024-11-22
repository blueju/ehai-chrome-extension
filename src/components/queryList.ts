import {
  IStoreStockItem
} from './queryList';

export interface IStoreStockResponseResult {
  carTypeList: Array<IStoreStockItem.priceLevel>,
  carTypeItem: Array<ICarTypeItem>

  [key: string]: any
}

interface IStoreStockResponse extends Response {
  data: {
    result: IStoreStockResponseResult,
    [key: string]: any
  };
}

export default function queryList(params): Promise<IStoreStockResponseResult> {
  return new Promise((resolve, reject) => {
    return unsafeWindow.ehai
      .postEncrypt('/Stock/List', '', {
        stockType: 1,
        whereFilter: {
          level: null,
          levelId: 0,
          brands: [],
          priceLevel: null,
          gear: null,
          seat: null,
          carNoId: null,
        },
        pickupDto: {
          cityId: params.cityId,
          storeId: params.storeId,
          operationTime: params.pickupTime,
          isService: false,
        },
        pickupAddressDto: null,
        returnDto: {
          cityId: params.cityId,
          storeId: params.storeId,
          operationTime: params.returnTime,
          isService: false,
        },
        returnAddressDto: null,
        requestContext: {
          platform: 1010902,
          platformSource: 1010902,
          operatorId: null,
          userId: null,
          channelId: null,
          enterpriseId: null,
          optionTag: {
            isChargeFee: false,
            choose: 3,
            isEnterprise: false,
          },
        },
      })
      .then((res: IStoreStockResponse) => {
        resolve(res.data.result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
