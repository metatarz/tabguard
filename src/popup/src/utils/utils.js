
export function setToStorage(tabs) {
    chrome.storage.sync.set(tabs);
}
export function getFromStorage(key, callback) {
    chrome.storage.sync.get([key], callback);
}
export function createNewTab(url) {
    chrome.tabs.create({ url, active: false })
}
export function removeFromStorage(key) {
    chrome.storage.sync.remove(key);
}
export function onMessageListener(callback) {
    chrome.runtime.onMessage.addListener(callback);
}
export function sendMessage(object) {
    chrome.runtime.sendMessage(object)
}
export function setBadgeText(text) {
    chrome.action.setBadgeText({ text })
}
export function setTitle(title) {
    chrome.action.setTitle({ title })
}