const inactiveTabs = new Map()
const groupedTabs = new Map()
const wastefulTabs = new Map()
let fallbackWindowId = undefined

const CPU_THRESHOLD = 1
const MEM_THRESHOLD_INCREASE = 0.01
const MEM_MAX_ENTRIES = 7
const MEM_MIN_ENTRIES = 2
const NETWORK_MAX_ENTRIES = 7
const CPU_MAX_ENTRIES = 7
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
    inactiveTabs.delete(tabId)
    wastefulTabs.delete(tabId)
    groupedTabs.delete(tabId)
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

function getProcessInfoAndSetMap({ tab, cpu, network, processId }) {
    const groupedTabsArray = Array.from(groupedTabs.entries())[0]
    let groupId = undefined
    let tabs = []
    const tabId = tab.tabId

    if (groupedTabsArray && groupedTabsArray.length) {
        groupId = groupedTabsArray[0]
        tabs = groupedTabsArray[1]
    }
    if (!tabs.length || !tabs.includes(tabId)) {
        chrome.processes.getProcessInfo(processId, true, (processes) => {
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
                        addTabToGroup(tabs, tabId, groupId)
                    }
                } else {
                    payload = { ...payload, privateMemory: [...payload?.privateMemory, privateMemory] }
                }
            }

            if (cpu >= CPU_THRESHOLD) {
                payload = { ...payload, cpu: [...payload?.cpu, cpu] }
                if (payload.cpu.length >= CPU_MAX_ENTRIES) {
                    addTabToGroup(tabs, tabId, groupId)
                }

            }

            if (network) {
                payload = { ...payload, network: [...payload?.network, network] }
                if (payload.network.length >= NETWORK_MAX_ENTRIES) {
                    addTabToGroup(tabs, tabId, groupId)
                }
            }
            wastefulTabs.set(tabId, payload = { ...payload, timestamp: timeNow })
            console.log(`Updated wastefulTabs for ${tab.title}`, payload)


        })
    }

}

function addTabToGroup(tabs, tabId, groupId) {
    if (groupId && !tabs.includes(tabId)) {
        console.log('found wasteful tab', tabId)
        chrome.tabs.group({ tabIds: tabId, groupId }, (groupId) => {
            if (!groupId) {
                //retry with fallbackWindowId
                chrome.tabs.group({ tabIds: tabId, groupId, createProperties: { ...(fallbackWindowId ? { windowId: fallbackWindowId } : {}) } }, (groupId) => {
                    if (groupId) groupedTabs.set(groupId, [...tabs, tabId])
                })
            } else {
                groupedTabs.set(groupId, [...tabs, tabId])
            }
        })
    } else {
        chrome.tabs.group({ tabIds: tabId }, (groupId) => {
            if (!groupId) {
                //retry with fallbackWindowId
                chrome.tabs.group({ tabIds: tabId, groupId, createProperties: { ...(fallbackWindowId ? { windowId: fallbackWindowId } : {}) } }, (groupId) => {
                    if (groupId) groupedTabs.set(groupId, [...tabs, tabId])
                })
            } else {
                groupedTabs.set(groupId, [tabId])
            }
        })

    }
}

function groupTab(tabId, groupId) {
    tabGroups.set(tabId, groupId)
}

// EVENTS 

chrome.runtime.onInstalled.addListener(function () {
    queryTabs()
});

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
    removeTab(tabId)
})


chrome.tabs.onHighlighted.addListener(async () => {
    await new Promise((resolve) => setTimeout(resolve, MAX_TIMEOUT_UPDATE_TABS)) //avoids data spikes caused by fast tab highlighting
    queryTabs()
})










