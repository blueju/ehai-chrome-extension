const dataSource = require('./dataSource.json');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

let allStoreBeforeHandle = [];

dataSource.forEach((item) => {
  if (item.result[0].stores.length) {
    item.result[0].stores.forEach((item2) => {
      if (item2.stores.length) {
        item2.stores.forEach((item3) => {
          allStoreBeforeHandle.push(
            _.omit(item3, [
              'englishAddress',
              'pickupAddress',
              'openingTime',
              'pickupLongitude',
              'pickupLatitude',
              'amapDropoffLongitude',
              'dropoffLongitude',
              'dropoffLatitude',
              'amapPickupLongitude',
              'amapPickupLatitude',
              'amapDropoffLatitude',
              'lastModificationTime',
              'address',
              'fromTime',
              'toTime',
              'dropoffAddress',
              'englishShortName',
              'pickupDropoffAddress',
              'englishShortName',
              'isPhysicalStore',
              'pickupPointLongUrl',
              'dropOffPointLongUrl',
              'isAllowSendCar',
              'limitStartTime',
              'limitEndTime',
              'limitHour',
              'sendCarStartHour',
              'sendCarEndHour',
              'earliestBookingTime',
              'shortName',
              'selfPickOrDropoffTime',
              'orderAllHourOpen',
              'allHourOpen',
              'predictClosedTime',
              'location',
              'districtName',
              'businessCircle',
              'isDeleted',
              'manageStoreId',
              'showConfig',
              'adcode',
              'districtSort',
              'displayType',
              'managerId',
            ]),
          );
        });
      }
    });
  }
});

const uniqueArraySet = [];
const seenIds = new Set();

allStoreBeforeHandle.forEach((item) => {
  if (!seenIds.has(item.id)) {
    seenIds.add(item.id);
    uniqueArraySet.push(item);
  }
});

const output = JSON.stringify(uniqueArraySet);
// const output = JSON.stringify(uniqueArraySet, null, 2)
console.log(uniqueArraySet.length);
fs.writeFile(path.resolve(__dirname, 'all-stores', 'stores.json'), output, (err) => {
  if (err) {
    console.error('写入文件时出错:', err);
  } else {
    console.log('JSON 数据已成功写入');
  }
});
