
export function setToStorage(tabs) {
    chrome.storage.sync.set(tabs);
}
export function getFromStorage(key, callback) {
    chrome.storage.sync.get([key], callback);
}