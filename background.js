const CONTEXT_MENU_ID = 'dc82bba0-dfd0-484d-9782-c8a27c521121';
const MUTE_TAB_STR = 'Mute Tab';
const UNMUTE_TAB_STR = 'Unmute Tab';
const MUTED_BADGE_STR = ' M ';

// 'Mute Tab' context menu
chrome.contextMenus.create({
  id: CONTEXT_MENU_ID,
  type: 'normal',
  title: MUTE_TAB_STR,
  contexts: ['all'] // Chrome doesn't allow us to add a custom context menu item to the actual tab.
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    updateMuteState(tab);
  }
});

// Chrome frame extension icon
chrome.browserAction.setBadgeBackgroundColor({ color: '#212121' });
chrome.browserAction.onClicked.addListener(function(tab) {
  updateMuteState(tab);
});

// Helper functions
function updateMuteState(tab) {
  let muted = muteTab(tab);
  let title = MUTE_TAB_STR;
  if (muted) {
    title = UNMUTE_TAB_STR;
    chrome.browserAction.setBadgeText({ text: MUTED_BADGE_STR, tabId: tab.id });
  } else {
    chrome.browserAction.setBadgeText({ text: '', tabId: tab.id });
  }
  chrome.contextMenus.update(CONTEXT_MENU_ID, { title });
}

function muteTab(tab) {
  let current_state = tab.mutedInfo.muted;
  let new_state = !current_state;
  chrome.tabs.update(tab.id, { muted: new_state });
  return new_state;
}
