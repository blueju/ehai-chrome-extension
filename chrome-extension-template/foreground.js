// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

console.log("This prints to the console of the page (injected only if the page url matched)")

/**
 * 事件监听
 */
window.addEventListener('custom-index-type', async (e) => {
    const { type, data } = e.detail
    switch (type) {
        case 'run-index-fun': {
            const fn = new Function(`return (${data.function})(...arguments)`)
            const rs = await fn(...(data.args ?? []))
            luckySendMessageToIndex(type, rs)
            break
        }
    }
})

/**
 * lucky 文件发送消息到 index.js 文件
 * @param {string} type custom 类型
 * @param {any} data 数据
 */
const luckySendMessageToIndex = (type, data) => {
    window.dispatchEvent(
        new CustomEvent('custom-lucky-type', {
            detail: { type: type, data: data, file: 'lucky' }
        })
    )
}


