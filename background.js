const CONTEXT_MENU_ID = 'dc82bba0-dfd0-484d-9782-c8a27c521121';
const MUTE_TAB_STR = 'Mute Tab';
const UNMUTE_TAB_STR = 'Unmute Tab';
const MUTED_BADGE_STR = ' M ';
const BADGE_BACKGROUND = '#212121';
const EXTENSION_ICONS = Object.freeze({
  muted: {
    '16': 'images/16_m.png',
    '48': 'images/48_m.png',
    '128': 'images/128_m.png',
  },
  unmuted: {
    '16': 'images/16_u.png',
    '48': 'images/48_u.png',
    '128': 'images/128_u.png',
  },
});
const MUTED_ICONS = EXTENSION_ICONS.muted;
const UNMUTED_ICONS = EXTENSION_ICONS.unmuted;

// Listen for tab switches and update the browserAction icon according to audible state
chrome.tabs.onActivated.addListener(function ({ tabId }) {
  chrome.tabs.get(tabId, function (tab) {
    if (tab.mutedInfo.muted) { return; }
    let path = tab.audible ? UNMUTED_ICONS : MUTED_ICONS;
    chrome.browserAction.setIcon({ path, tabId: tab.id });
  });
});

// Listen for tab updates and update the icon to reflect the new state of the tab
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // Keep the muted icon in sync if the tab was reloaded
  if ('status' in changeInfo && tab.mutedInfo.muted) {
    updateUIState(tabId, tab.mutedInfo.muted);
  }

  // If we're currently muted or about to be muted, then exit early
  if ((tab.mutedInfo.muted && !('mutedInfo' in changeInfo)) || ('mutedInfo' in changeInfo && changeInfo.mutedInfo.muted)) {
    return;
  }

  // Otherwise, check audible state and update icon accordingly.
  if ('audible' in changeInfo) {
    let path = changeInfo.audible ? UNMUTED_ICONS : MUTED_ICONS;
    chrome.browserAction.setIcon({ path, tabId });
  }
});

// Create context menu on all available menus
chrome.contextMenus.create({
  id: CONTEXT_MENU_ID,
  type: 'normal',
  title: MUTE_TAB_STR,
  contexts: ['all'] // Chrome doesn't allow us to add a custom context menu item to the actual tab.
});

// Modify the mute state when interacting with the context menu option
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    updateMuteState(tab);
  }
});

// Browser frame icon
chrome.browserAction.setBadgeBackgroundColor({ color: BADGE_BACKGROUND });
chrome.browserAction.onClicked.addListener(function (tab) {
  updateMuteState(tab);
});

// Helper functions
function updateMuteState(tab) {
  // Flip the muted state of the tab
  let current_state = tab.mutedInfo.muted;
  let is_muted = !current_state;
  chrome.tabs.update(tab.id, { muted: is_muted });
  updateUIState(tab.id, is_muted);
}

function updateUIState(tabId, is_muted) {
  // Update the UI to reflect the current muted state
  let title = MUTE_TAB_STR;
  if (is_muted) {
    title = UNMUTE_TAB_STR;
    chrome.browserAction.setBadgeText({ text: MUTED_BADGE_STR, tabId });
    chrome.browserAction.setIcon({ path: MUTED_ICONS, tabId });
  } else {
    chrome.browserAction.setBadgeText({ text: '', tabId });
    chrome.browserAction.setIcon({ path: UNMUTED_ICONS, tabId });
  }
  chrome.contextMenus.update(CONTEXT_MENU_ID, { title });
}
