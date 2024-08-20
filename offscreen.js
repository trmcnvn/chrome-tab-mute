const prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function send() {
  chrome.runtime.sendMessage({ type: 'darkTheme', dark: prefersDarkQuery.matches });
}

prefersDarkQuery.addEventListener('change', send);
send();
