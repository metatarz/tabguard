const inactiveTabs = new Map()
const groupedTabs = new Map()
const wastefulTabs = new Map()

let fallbackWindowId = undefined
let properties = {
    autosave: false

}
const CPU_THRESHOLD = 7
const MEM_THRESHOLD_INCREASE = 0.01
const MEM_MAX_ENTRIES = 7
const MEM_MIN_ENTRIES = 2
const NETWORK_MAX_ENTRIES = 7
const CPU_MAX_ENTRIES = 1
const MAX_THROTTLE = 10000
const MAX_TIMEOUT_UPDATE_TABS = 1000

function queryTabs() {
    chrome.tabs.query({}, (tabs) => {
        fallbackWindowId = tabs[0].windowId
        tabs.filter(tab => !tab.active && tab.id ? addTab(tab.id) : false)
    })
}

function addTab(tabId) {
    chrome.processes.getProcessIdForTab(tabId, pId => inactiveTabs.set(tabId, pId))
    return false
}

function removeTab(tabId) {
    console.log('removing tab', tabId)
    inactiveTabs.delete(tabId)
    wastefulTabs.delete(tabId)

    const groupedTabsMap = Array.from(groupedTabs.entries())[0]
    const groupId = groupedTabsMap[0]
    const groupedTabValues = groupedTabsMap[1]
    if (groupedTabValues.length > 1) {
        groupedTabs.set(groupId, groupedTabValues.filter(tId => tId !== tabId))
    } else {
        groupedTabs.delete(groupId)
    }

}

function computeMemAverage(mem) {
    return (mem.reduce((a, b) => a + b) / mem.length).toFixed(2)
}
function computePrivateMemRate(mem, currentMem) {
    const averageMem = computeMemAverage(mem)
    return (1 - averageMem / currentMem).toFixed(2)
}

function shouldThrottleTab(initialTime, finalTime) {
    return (finalTime - initialTime) < MAX_THROTTLE
}

async function groupTabOrRemove(tabs, tabId, groupId, reason) {
    await addTabToGroup(tabs, tabId, groupId)
    console.log(properties.autosave, 'autosave')
    if (properties.autosave) {
        const currentGroupedTabs = Array.from(groupedTabs.entries())[0][1]
        let formatedTabs = []
        console.log('tabs', currentGroupedTabs)
        await Promise.all(currentGroupedTabs.map(async (tabId) => {
            await chrome.tabs.get(tabId, ({ title, url, id }) => formatedTabs = [...formatedTabs, { title, url, id, reason }])
        }))
        chrome.tabs.remove(currentGroupedTabs, () => {
            sendMessage({ tabs: formatedTabs })
            updateStorage({ tabs: formatedTabs })
        })
    }
}

async function getProcessInfoAndSetMap({ tab, cpu, network, processId }) {
    const groupedTabsArray = Array.from(groupedTabs.entries())[0]
    let groupId = undefined
    let tabs = []
    const tabId = tab.tabId

    if (groupedTabsArray && groupedTabsArray.length) {
        groupId = groupedTabsArray[0]
        tabs = groupedTabsArray[1]
    }
    if (!tabs.length || !tabs.includes(tabId)) {
        await chrome.processes.getProcessInfo(processId, true, async (processes) => {
            const { privateMemory } = processes[processId]
            const timeNow = Date.now()

            let payload = wastefulTabs.get(tabId) || {
                tab,
                privateMemory: [],
                cpu: [],
                network: [],
                timestamp: timeNow
            }
            if (privateMemory > 0) {
                if (payload?.privateMemory.length >= MEM_MIN_ENTRIES) {
                    const memRate = computePrivateMemRate(payload.privateMemory, privateMemory)
                    if (memRate >= MEM_THRESHOLD_INCREASE) {
                        payload = { ...payload, privateMemory: [...payload?.privateMemory, privateMemory] }
                    }
                    if (payload.privateMemory.length >= MEM_MAX_ENTRIES) {
                        await groupTabOrRemove(tabs, tabId, groupId, 'memory')
                    }
                } else {
                    payload = { ...payload, privateMemory: [...payload?.privateMemory, privateMemory] }
                }
            }

            if (cpu >= CPU_THRESHOLD) {
                payload = { ...payload, cpu: [...payload?.cpu, cpu] }
                if (payload.cpu.length >= CPU_MAX_ENTRIES) {
                    await groupTabOrRemove(tabs, tabId, groupId, 'cpu')

                }

            }

            if (network) {
                payload = { ...payload, network: [...payload?.network, network] }
                if (payload.network.length >= NETWORK_MAX_ENTRIES) {
                    await groupTabOrRemove(tabs, tabId, groupId, 'network')
                }
            }
            wastefulTabs.set(tabId, payload = { ...payload, timestamp: timeNow })
            console.log(`Updated wastefulTabs for ${tab.title}`, payload)


        })
    }

}

function addTabToGroup(tabs, tabId, groupId) {
    return new Promise((resolve) => {
        if (groupId && !tabs.includes(tabId)) {
            console.log('found wasteful tab', tabId)
            chrome.tabs.group({ tabIds: tabId, groupId }, (groupId) => {
                if (!groupId) {
                    //retry with fallbackWindowId
                    chrome.tabs.group({ tabIds: tabId, createProperties: { ...(fallbackWindowId ? { windowId: fallbackWindowId } : {}) } }, (groupId) => {
                        if (groupId) groupedTabs.set(groupId, [...tabs, tabId])
                        resolve()
                    })
                } else {
                    groupedTabs.set(groupId, [...tabs, tabId])
                    resolve()
                }
            })
        } else {
            chrome.tabs.group({ tabIds: tabId }, (groupId) => {
                if (!groupId) {
                    //retry with fallbackWindowId
                    chrome.tabs.group({ tabIds: tabId, createProperties: { ...(fallbackWindowId ? { windowId: fallbackWindowId } : {}) } }, (groupId) => {
                        if (groupId) groupedTabs.set(groupId, [...tabs, tabId])
                        resolve()
                    })
                } else {
                    groupedTabs.set(groupId, [tabId])
                    resolve()
                }
            })

        }

    })
}


function groupTab(tabId, groupId) {
    tabGroups.set(tabId, groupId)
}

function sendMessage(message) {
    console.log('sent message', message)
    chrome.runtime.sendMessage(message)
}

function updateStorage(object) {
    const updateKey = Object.keys(object)[0]
    chrome.storage.sync.get([updateKey], (result) => {
        if (result[updateKey]) {
            object = [...object[updateKey], ...result[updateKey]]
        } else {
            object = object[updateKey]
        }
        chrome.storage.sync.set({ [updateKey]: object })
    })
}


// EVENTS 

chrome.runtime.onInstalled.addListener(function () {
    queryTabs()
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request?.properties) {
            properties = { ...properties, ...request.properties }
        }
    })

chrome.processes.onUpdated.addListener((processes) => {
    try {
        const processesInfo = Array.from(inactiveTabs.values())
            .filter(pId => processes[pId])
            .map(pId => {
                const { cpu, network, tasks } = processes[pId]
                return {
                    processId: pId,
                    cpu,
                    network,
                    tab: tasks.filter(t => t.tabId)[0]
                }

            })

        processesInfo.filter(p => p.network || p.cpu >= CPU_THRESHOLD)
            .forEach(process => {
                const currentWasteFulTab = wastefulTabs.get(process.tab.tabId)
                if (currentWasteFulTab && Object.keys(currentWasteFulTab).length) {
                    const skipProcess = shouldThrottleTab(currentWasteFulTab.timestamp, Date.now())
                    if (skipProcess) {
                        return
                    }
                }
                getProcessInfoAndSetMap(process)
            }
            )
    } catch (e) {
        console.log(e)

    }

})

chrome.windows.onCreated.addListener((window) => fallbackWindowId = window.id)
chrome.tabs.onCreated.addListener(function (tab) {
    if (!tab.active && tab.status === 'complete') addTab(tab.id)
})

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    removeTab(tabId)
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
    inactiveTabs.delete(tabId)
})


chrome.tabs.onHighlighted.addListener(async () => {
    await new Promise((resolve) => setTimeout(resolve, MAX_TIMEOUT_UPDATE_TABS)) //avoids data spikes caused by fast tab highlighting
    queryTabs()
})










