// Determine if the browser chrome is dark
chrome.offscreen.createDocument({
  url: chrome.runtime.getURL('offscreen.html'),
  reasons: ['MATCH_MEDIA'],
  justification: 'Determine if Dark Mode is enabled or not',
});

const CONTEXT_MENU_ID = 'dc82bba0-dfd0-484d-9782-c8a27c521121';
const MUTE_TAB_STR = 'Mute Tab';
const UNMUTE_TAB_STR = 'Unmute Tab';
const MUTED_BADGE_STR = ' M ';
const BADGE_BACKGROUND = '#212121';
const EXTENSION_ICONS = (isDarkTheme) => ({
  muted: {
    '16': `images/16_m${isDarkTheme ? '_white' : ''}.png`,
    '48': `images/48_m${isDarkTheme ? '_white' : ''}.png`,
    '128': `images/128_m${isDarkTheme ? '_white' : ''}.png`,
  },
  unmuted: {
    '16': `images/16_u${isDarkTheme ? '_white' : ''}.png`,
    '48': `images/48_u${isDarkTheme ? '_white' : ''}.png`,
    '128': `images/128_u${isDarkTheme ? '_white' : ''}.png`,
  },
});

const MUTED_ICONS = async function() {
  return chrome.storage.session.get('isDarkTheme').then(function (result) {
    return EXTENSION_ICONS(result.isDarkTheme).muted;
  });
}

const UNMUTED_ICONS = async function() {
  return chrome.storage.session.get('isDarkTheme').then(function (result) {
    return EXTENSION_ICONS(result.isDarkTheme).unmuted;
  });
}

chrome.runtime.onMessage.addListener(function (message) {
  if (message.type === 'darkTheme') {
    setDarkTheme(message.dark);
    chrome.storage.session.set({ isDarkTheme: message.dark });
  }
});

// Listen for tab switches and update the action icon according to audible state
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

// Only create listeners if not already set up to prevent error
if (!chrome.contextMenus.onClicked.hasListeners()) {
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
}

// Browser frame icon
chrome.action.setBadgeBackgroundColor({ color: BADGE_BACKGROUND });
chrome.action.onClicked.addListener(function (tab) {
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
async function updateUIState(tab, should_mute) {
  let tabId = tab.id;
  let title = MUTE_TAB_STR;
  if (should_mute) {
    title = UNMUTE_TAB_STR;
    chrome.action.setBadgeText({ text: MUTED_BADGE_STR, tabId });
    const icons = await MUTED_ICONS();
    chrome.action.setIcon({ path: icons, tabId });
  } else {
    chrome.action.setBadgeText({ text: '', tabId });
    setIconFromAudible(tab.audible, tabId);
  }
  chrome.contextMenus.update(CONTEXT_MENU_ID, { title });
}

// Update icon based on audible state
async function setIconFromAudible(is_audible, tabId) {
  let fn = is_audible ? UNMUTED_ICONS : MUTED_ICONS;
  const icons = await fn();
  chrome.action.setIcon({ path: icons, tabId });
}

function setDarkTheme(value) {
  chrome.storage.session.set({ isDarkTheme: value });
}
