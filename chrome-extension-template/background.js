// const blockUrls = [
//     "https://booking.1hai.cn/static/js/8.9f7dbbde.chunk.js"
// ]

// blockUrls.forEach((domain, index) => {
//     const id = index + 1;
//     chrome.declarativeNetRequest.updateDynamicRules({
//         addRules: [
//             {
//                 "id": id,
//                 "priority": 1,
//                 "condition": {
//                     "urlFilter": domain,
//                     "resourceTypes": ["script"]
//                 },
//                 action: {
//                     type: 'redirect',
//                     redirect: {
//                         url: 'https://markdown-note-1255426737.cos.ap-guangzhou.myqcloud.com/8.9f7dbbde.chunk.js'
//                     }
//                 }
//             }
//         ],
//         removeRuleIds: [id]
//     });
// });


