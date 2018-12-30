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
    setIconFromAudible(tab.audible, tab.id);
  });
});

// Listen for tab updates and update the icon to reflect the new state of the tab
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // Keep the muted icon in sync if the tab was reloaded
  if ('status' in changeInfo) {
    return updateUIState(tab, tab.mutedInfo.muted);
  }

  // If we're currently muted or about to be muted, then exit early
  if ((tab.mutedInfo.muted && !('mutedInfo' in changeInfo)) || ('mutedInfo' in changeInfo && changeInfo.mutedInfo.muted)) {
    return;
  }

  // Otherwise, check audible state and update icon accordingly.
  if ('audible' in changeInfo) {
    setIconFromAudible(changeInfo.audible, tabId);
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

// Flip the muted state of the tab
function updateMuteState(tab) {
  let current_state = tab.mutedInfo.muted;
  let should_mute = !current_state;
  chrome.tabs.update(tab.id, { muted: should_mute });
  updateUIState(tab, should_mute);
}

// Update the UI to reflect the current muted state
function updateUIState(tab, should_mute) {
  let tabId = tab.id;
  let title = MUTE_TAB_STR;
  if (should_mute) {
    title = UNMUTE_TAB_STR;
    chrome.browserAction.setBadgeText({ text: MUTED_BADGE_STR, tabId });
    chrome.browserAction.setIcon({ path: MUTED_ICONS, tabId });
  } else {
    chrome.browserAction.setBadgeText({ text: '', tabId });
    setIconFromAudible(tab.audible, tabId);
  }
  chrome.contextMenus.update(CONTEXT_MENU_ID, { title });
}

// Update icon based on audible state
function setIconFromAudible(is_audible, tabId) {
  let path = is_audible ? UNMUTED_ICONS : MUTED_ICONS;
  chrome.browserAction.setIcon({ path, tabId });
}
