// // 获取当前页面的 window 对象
// const currentWindow = top;

// // 示例：获取页面的标题
// console.log("Page Title:", currentWindow.document.title);

// // 示例：获取页面的 URL
// console.log("Page URL:", currentWindow.location.href);

// // 你可以在这里执行更多的操作

// setInterval(() => {
//     if (currentWindow.ehai) {
//         console.dir(currentWindow.ehai);
//     } else {
//         console.log('等待下次检查');
//     }
// }, 1000);


/**
 * injectScript - Inject internal script to available access to the `window`
 *
 * @param  {type} file_path Local path of the internal script.
 * @param  {type} tag The tag as string, where the script will be append (default: 'body').
 * @see    {@link http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script}
 */
function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
}

injectScript(chrome.runtime.getURL('/lib/vue.global.min.js'), 'body');
injectScript(chrome.runtime.getURL('/lib/axios.min.js'), 'body');
injectScript(chrome.runtime.getURL('/lib/dayjs.min.js'), 'body');

setTimeout(() => {
    injectScript(chrome.runtime.getURL('content.js'), 'body');
}, 2000)
