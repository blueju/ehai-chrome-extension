const loadStyle = (url) => {
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.media = 'all';
    head.appendChild(link);
};

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

loadStyle(chrome.runtime.getURL('ehai-helper.css'))
injectScript(chrome.runtime.getURL('ehai-helper.js'), 'body');
