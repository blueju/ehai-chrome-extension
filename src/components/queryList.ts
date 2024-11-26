export default function queryList(params: {
    cityId: string,
    storeId: string,
    pickupTime: string,
    returnTime: string,
}) {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        return window.ehai
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
            .then((res) => {
                debugger;
                resolve(res);
            })
            .catch((err) => {
                debugger;
                reject(err);
            });
    });
}
