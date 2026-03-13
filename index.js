const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const nodeEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};
const query = new URLSearchParams(window.location.search);

const config = {
  liffId: env.VITE_LIFF_ID || env.LIFF_ID || nodeEnv.VITE_LIFF_ID || nodeEnv.LIFF_ID || query.get('liffId') || '',
  botId: env.VITE_LINE_BOT_ID || env.LINE_BOT_ID || nodeEnv.VITE_LINE_BOT_ID || nodeEnv.LINE_BOT_ID || '',
  miniAppUrl: env.VITE_MINIAPP_URL || env.MINIAPP_URL || nodeEnv.VITE_MINIAPP_URL || nodeEnv.MINIAPP_URL || '',
};

const body = document.querySelector('#body');
const btnSend = document.querySelector('#btnSend');
const btnShare = document.querySelector('#btnShare');
const btnLogIn = document.querySelector('#btnLogIn');
const btnLogOut = document.querySelector('#btnLogOut');
const btnScanCode = document.querySelector('#btnScanCode');
const btnOpenWindow = document.querySelector('#btnOpenWindow');
const btnShortcut = document.querySelector('#btnShortcut');

const email = document.querySelector('#email');
const userId = document.querySelector('#userId');
const pictureUrl = document.querySelector('#pictureUrl');
const displayName = document.querySelector('#displayName');
const statusMessage = document.querySelector('#statusMessage');
const code = document.querySelector('#code');
const friendShip = document.querySelector('#friendShip');

function textLine(el, title, value) {
  if (!el) return;
  el.textContent = `${title}: ${value || '-'}`;
}

function setButtonVisible(el, visible) {
  if (!el) return;
  el.style.display = visible ? 'block' : 'none';
}

function showStatus(message) {
  textLine(code, 'Result', message);
}

function getShortcutUrl() {
  if (config.miniAppUrl) return config.miniAppUrl;
  if (config.liffId) return `https://miniapp.line.me/${config.liffId}`;
  return '';
}

async function getUserProfile() {
  const profile = await liff.getProfile();
  const decodedIdToken = liff.getDecodedIDToken();
  pictureUrl.src = profile.pictureUrl || 'https://vos.line-scdn.net/imgs/apis/ic_mini.png';
  textLine(userId, 'userId', profile.userId);
  textLine(displayName, 'displayName', profile.displayName);
  textLine(statusMessage, 'statusMessage', profile.statusMessage);
  textLine(email, 'email', decodedIdToken && decodedIdToken.email);
}

async function getFriendship() {
  const friendship = await liff.getFriendship();
  if (friendship.friendFlag) {
    friendShip.textContent = 'You and the LINE Official Account are already friends.';
    return;
  }

  const botId = config.botId.replace(/^@/, '').replace(/[^0-9A-Za-z._-]/g, '');
  if (!botId) {
    friendShip.textContent = 'Set LINE_BOT_ID in .env to show your add-friend link.';
    return;
  }
  friendShip.innerHTML = `Please add friend: <a target="_blank" rel="noopener noreferrer" href="https://line.me/R/ti/p/@${botId}">@${botId}</a>`;
}

async function sendMessages() {
  if (!liff.isInClient()) {
    showStatus('sendMessages works only inside LINE app.');
    return;
  }

  await liff.sendMessages([
    {
      type: 'text',
      text: "You've successfully sent a message! Hooray!",
    },
  ]);
  liff.closeWindow();
}

async function shareTargetPicker() {
  const result = await liff.shareTargetPicker([
    {
      type: 'text',
      text: 'This message was sent by shareTargetPicker.',
    },
  ]);

  if (result) {
    showStatus('shareTargetPicker succeeded.');
  } else {
    showStatus('shareTargetPicker was cancelled.');
  }
}

async function scanCode() {
  if (!liff.isApiAvailable('scanCodeV2')) {
    showStatus('scanCodeV2 is not available on this device.');
    return;
  }
  const result = await liff.scanCodeV2();
  textLine(code, 'QR', result && result.value);
}

async function openWindow() {
  liff.openWindow({
    url: 'https://line.me',
    external: true,
  });
}

async function createShortcut() {
  if (!liff.isApiAvailable('createShortcutOnHomeScreen')) {
    showStatus('createShortcutOnHomeScreen is not available.');
    return;
  }

  const url = getShortcutUrl();
  if (!url) {
    showStatus('Set LIFF_ID or MINIAPP_URL in .env to use shortcut.');
    return;
  }

  await liff.createShortcutOnHomeScreen({
    url,
  });
  showStatus('Shortcut flow opened.');
}

function bindButton(el, handler) {
  if (!el) return;
  el.addEventListener('click', async () => {
    try {
      await handler();
    } catch (error) {
      showStatus(error.message || String(error));
    }
  });
}

function showButtons() {
  setButtonVisible(btnOpenWindow, true);
  setButtonVisible(btnShare, liff.isApiAvailable('shareTargetPicker'));
  setButtonVisible(btnScanCode, liff.isApiAvailable('scanCodeV2'));
  setButtonVisible(btnShortcut, liff.isApiAvailable('createShortcutOnHomeScreen'));

  if (liff.isLoggedIn()) {
    setButtonVisible(btnSend, liff.isInClient());
    setButtonVisible(btnLogOut, !liff.isInClient());
    setButtonVisible(btnLogIn, false);
  } else {
    setButtonVisible(btnSend, false);
    setButtonVisible(btnLogOut, false);
    setButtonVisible(btnLogIn, true);
  }
}

function setThemeByOs() {
  if (!body) return;
  const os = liff.getOS();
  if (os === 'android') body.style.backgroundColor = '#d1f0ff';
  if (os === 'ios') body.style.backgroundColor = '#eeeeee';
}

async function main() {
  if (typeof liff === 'undefined') {
    showStatus('LIFF SDK failed to load.');
    return;
  }

  if (!config.liffId) {
    showStatus('LIFF_ID is missing. Set it in .env or use ?liffId=...');
    return;
  }

  await liff.init({ liffId: config.liffId });
  setThemeByOs();
  showButtons();

  if (!liff.isLoggedIn()) {
    return;
  }

  await getUserProfile();
  await getFriendship();
}

bindButton(btnSend, sendMessages);
bindButton(btnShare, shareTargetPicker);
bindButton(btnScanCode, scanCode);
bindButton(btnOpenWindow, openWindow);
bindButton(btnShortcut, createShortcut);
bindButton(btnLogIn, () => liff.login({ redirectUri: window.location.href }));
bindButton(btnLogOut, () => {
  liff.logout();
  window.location.reload();
});

main().catch((error) => {
  showStatus(error.message || String(error));
});
