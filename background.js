const CONTEXT_MENU_ID = 'dc82bba0-dfd0-484d-9782-c8a27c521121';
const MUTE_TAB_STR = 'Mute Tab';
const UNMUTE_TAB_STR = 'Unmute Tab';

// 'Mute Tab' context menu
chrome.contextMenus.create({
  id: CONTEXT_MENU_ID,
  type: 'normal',
  title: MUTE_TAB_STR,
  contexts: ['all'] // Chrome doesn't allow us to add a custom context menu item to the actual tab.
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    let muted = changeMuteState(tab);
    let title = MUTE_TAB_STR;
    if (muted) {
      title = UNMUTE_TAB_STR;
    }
    chrome.contextMenus.update(CONTEXT_MENU_ID, { title });
  }
});

function changeMuteState(tab) {
  let current_state = tab.mutedInfo.muted;
  let new_state = !current_state;
  chrome.tabs.update(tab.id, { muted: new_state });
  return new_state;
}
