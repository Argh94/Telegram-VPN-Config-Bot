addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// ثابت‌ها
const PROTOCOLS = {
  'Vless': 'vless://',
  'Vmess': 'vmess://',
  'Shadowsocks': 'ss://',
  'Trojan': 'trojan://',
  'Hysteria': 'hysteria://',
  'Hysteria2': 'hysteria2://'
};

const LOCATIONS = {
  'آلمان': 'de',
  'آمریکا': 'us',
  'ژاپن': 'jp',
  'انگلیس': 'uk',
  'فرانسه': 'fr',
  'کانادا': 'ca',
  'هلند': 'nl',
  'روسیه': 'ru',
  'ترکیه': 'tr',
  'کره جنوبی': 'kr',
  'استرالیا': 'au',
  'ایتالیا': 'it',
  'هند': 'in',
  'سوئد': 'se',
  'سوئیس': 'ch'
};

const SOURCES = {
  barry: { baseUrl: 'https://raw.githubusercontent.com/barry-far/V2ray-Configs/main', subs: ['Sub1.txt', 'Sub2.txt', 'Sub3.txt', 'Sub4.txt', 'Sub5.txt', 'Sub6.txt', 'Sub7.txt', 'Sub8.txt', 'Sub9.txt', 'Sub10.txt'] },
  ssCollector: { baseUrl: 'https://raw.githubusercontent.com/lagzian/SS-Collector/main', protocolFile: 'mix.txt', locationPrefix: '' },
  v2rayCollector: { baseUrl: 'https://raw.githubusercontent.com/M-Mashreghi/Free-V2ray-Collector/main', subFile: 'subs/v2ray-sub' },
  v2rayConfigLite: { baseUrl: 'https://raw.githubusercontent.com/coldwater-10/V2ray-Config-Lite/main', subFile: 'v2ray-lite.txt' },
  freeSubLink: { baseUrl: 'https://raw.githubusercontent.com/vAHiD55555/Free-SUB-Link/main', subFile: 'FreeLink.txt' },
  nirevil: { baseUrl: 'https://raw.githubusercontent.com/NiREvil/vless/main', subFile: 'vless-sub' },
  clashXTopFreeProxy: { baseUrl: 'https://raw.githubusercontent.com/VPN-Subcription-Links/ClashX-V2Ray-TopFreeProxy/main', subFile: 'clash.yaml' },
  azadNetCH: { baseUrl: 'https://raw.githubusercontent.com/AzadNetCH/Clash/main', subFile: 'AzadNet_iOS.txt' },
  coldwaterFreeSub: { baseUrl: 'https://raw.githubusercontent.com/coldwater-10/free-sub-link/main', subFile: 'free-sub-link.txt' },
  everydayVPN: { baseUrl: 'https://raw.githubusercontent.com/Everyday-VPN/Everyday-VPN/main', subFile: 'subscription.txt' }
};

const CONFIG_LIMIT = 5;
let configCache = {
  protocols: {},
  locations: {},
  special: {},
  lastUpdated: 0
};
const CACHE_TTL = 3600000; // 1 ساعت

// تابع کمکی برای گرفتن توکن از متغیر محیطی
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

// گرفتن لینک ساب یا کانفیگ پروتکل‌ها
async function fetchProtocolData(protocol) {
  const allSources = [
    ...SOURCES.barry.subs.map(sub => `${SOURCES.barry.baseUrl}/${sub}`),
    `${SOURCES.ssCollector.baseUrl}/${SOURCES.ssCollector.protocolFile}`,
    `${SOURCES.v2rayCollector.baseUrl}/${SOURCES.v2rayCollector.subFile}`,
    `${SOURCES.v2rayConfigLite.baseUrl}/${SOURCES.v2rayConfigLite.subFile}`,
    `${SOURCES.freeSubLink.baseUrl}/${SOURCES.freeSubLink.subFile}`,
    `${SOURCES.nirevil.baseUrl}/${SOURCES.nirevil.subFile}`,
    `${SOURCES.clashXTopFreeProxy.baseUrl}/${SOURCES.clashXTopFreeProxy.subFile}`,
    `${SOURCES.azadNetCH.baseUrl}/${SOURCES.azadNetCH.subFile}`,
    `${SOURCES.coldwaterFreeSub.baseUrl}/${SOURCES.coldwaterFreeSub.subFile}`,
    `${SOURCES.everydayVPN.baseUrl}/${SOURCES.everydayVPN.subFile}`
  ];
  
  const prefix = PROTOCOLS[protocol.charAt(0).toUpperCase() + protocol.slice(1)];
  for (const configUrl of allSources) {
    try {
      const configResponse = await fetch(configUrl);
      if (!configResponse.ok) continue;
      const configText = await configResponse.text();
      const configLines = configText.split('\n').filter(line => line.trim() !== '');
      const protoConfigs = configLines.filter(line => line.startsWith(prefix));
      if (protoConfigs.length > 0) {
        return { type: 'configs', data: protoConfigs.slice(0, CONFIG_LIMIT).join('\n') };
      }
      return { type: 'sub', data: configUrl };
    } catch (error) {
      console.error(`Error fetching ${configUrl}: ${error.message}`);
    }
  }
  return { type: 'error', data: 'هیچ داده‌ای پیدا نشد' };
}

// گرفتن لینک ساب یا کانفیگ لوکیشن
async function fetchLocationData(locationCode) {
  const possibleUrls = [
    `${SOURCES.ssCollector.baseUrl}/${locationCode}.txt`,
    ...SOURCES.barry.subs.map(sub => `${SOURCES.barry.baseUrl}/${sub}`),
    `${SOURCES.v2rayCollector.baseUrl}/${SOURCES.v2rayCollector.subFile}`,
    `${SOURCES.v2rayConfigLite.baseUrl}/${SOURCES.v2rayConfigLite.subFile}`,
    `${SOURCES.freeSubLink.baseUrl}/${SOURCES.freeSubLink.subFile}`,
    `${SOURCES.nirevil.baseUrl}/${SOURCES.nirevil.subFile}`,
    `${SOURCES.clashXTopFreeProxy.baseUrl}/${SOURCES.clashXTopFreeProxy.subFile}`,
    `${SOURCES.azadNetCH.baseUrl}/${SOURCES.azadNetCH.subFile}`,
    `${SOURCES.coldwaterFreeSub.baseUrl}/${SOURCES.coldwaterFreeSub.subFile}`,
    `${SOURCES.everydayVPN.baseUrl}/${SOURCES.everydayVPN.subFile}`
  ];

  for (const configUrl of possibleUrls) {
    try {
      const configResponse = await fetch(configUrl);
      if (!configResponse.ok) continue;
      const configText = await configResponse.text();
      const configLines = configText.split('\n').filter(line => line.trim() !== '');
      const locationConfigs = configLines.filter(line => line.toLowerCase().includes(locationCode.toLowerCase()));
      if (locationConfigs.length > 0) {
        return { type: 'configs', data: locationConfigs.slice(0, CONFIG_LIMIT).join('\n') };
      }
      return { type: 'sub', data: configUrl };
    } catch (error) {
      console.error(`Error fetching ${configUrl}: ${error.message}`);
    }
  }
  return { type: 'error', data: 'هیچ داده‌ای پیدا نشد' };
}

async function handleRequest(request) {
  const url = new URL(request.url);
  if (url.pathname !== '/webhook') return new Response('Not Found', { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return new Response('Invalid request body', { status: 400 });
  }

  if (!TELEGRAM_TOKEN) {
    return new Response('Telegram token not set in environment variables', { status: 500 });
  }

  const chatId = body.message ? body.message.chat.id : body.callback_query?.message.chat.id;
  const data = body.message && body.message.text ? body.message.text : '';

  let response;
  if (data === '/start') {
    response = {
      chat_id: chatId,
      text: 'سلام! به ربات کانفیگ رایگان خوش اومدی. یکی از گزینه‌ها رو انتخاب کن:',
      reply_markup: {
        keyboard: [
          ['دریافت کانفیگ بر اساس پروتکل'],
          ['دریافت کانفیگ بر اساس لوکیشن'],
          ['کانفیگ‌های ویژه']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    };
  } else if (data === 'دریافت کانفیگ بر اساس پروتکل') {
    response = {
      chat_id: chatId,
      text: 'یکی از پروتکل‌ها رو انتخاب کن:',
      reply_markup: {
        keyboard: [
          Object.keys(PROTOCOLS).slice(0, 3),
          Object.keys(PROTOCOLS).slice(3),
          ['بازگشت']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    };
  } else if (Object.keys(PROTOCOLS).includes(data)) {
    const protocol = data.toLowerCase();
    const now = Date.now();
    let result;
    if (!configCache.protocols[protocol] || (now - configCache.lastUpdated > CACHE_TTL)) {
      result = await fetchProtocolData(protocol);
      configCache.protocols[protocol] = result;
      configCache.lastUpdated = now;
    } else {
      result = configCache.protocols[protocol];
    }

    if (result.type === 'error') {
      response = {
        chat_id: chatId,
        text: `متأسفانه هیچ کانفیگی برای ${data} پیدا نشد!`,
        reply_markup: { keyboard: [['بازگشت']] }
      };
    } else if (result.type === 'sub') {
      response = {
        chat_id: chatId,
        text: `لینک سابسکریپشن ${data}:\n${result.data}`,
        reply_markup: { keyboard: [['بازگشت']] }
      };
    } else {
      response = {
        chat_id: chatId,
        text: `کانفیگ‌های ${data}:\n${result.data}`,
        reply_markup: { keyboard: [['بازگشت']] }
      };
    }
  } else if (data === 'دریافت کانفیگ بر اساس لوکیشن') {
    response = {
      chat_id: chatId,
      text: 'یکی از لوکیشن‌ها رو انتخاب کن:',
      reply_markup: {
        keyboard: [
          Object.keys(LOCATIONS).slice(0, 3),
          Object.keys(LOCATIONS).slice(3, 6),
          Object.keys(LOCATIONS).slice(6, 9),
          Object.keys(LOCATIONS).slice(9, 12),
          Object.keys(LOCATIONS).slice(12),
          ['بازگشت']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    };
  } else if (Object.keys(LOCATIONS).includes(data)) {
    const location = LOCATIONS[data];
    const now = Date.now();
    let result;
    if (!configCache.locations[location] || (now - configCache.lastUpdated > CACHE_TTL)) {
      result = await fetchLocationData(location);
      configCache.locations[location] = result;
      configCache.lastUpdated = now;
    } else {
      result = configCache.locations[location];
    }

    if (result.type === 'error') {
      response = {
        chat_id: chatId,
        text: `متأسفانه هیچ کانفیگی برای لوکیشن ${data} پیدا نشد!`,
        reply_markup: { keyboard: [['بازگشت']] }
      };
    } else if (result.type === 'sub') {
      response = {
        chat_id: chatId,
        text: `لینک سابسکریپشن شما برای لوکیشن ${data}:\n${result.data}`,
        reply_markup: { keyboard: [['بازگشت']] }
      };
    } else {
      response = {
        chat_id: chatId,
        text: `کانفیگ‌های لوکیشن ${data}:\n${result.data}`,
        reply_markup: { keyboard: [['بازگشت']] }
      };
    }
  } else if (data === 'کانفیگ‌های ویژه') {
    response = {
      chat_id: chatId,
      text: 'یکی از کانفیگ‌های ویژه رو انتخاب کن:',
      reply_markup: {
        keyboard: [
          ['V2ray Collector', 'Free SUB Link'],
          ['Vless Sub', 'Clash'],
          ['ClashX Top Free', 'AzadNetCH'],
          ['Coldwater Free Sub', 'Everyday VPN'],
          ['بازگشت']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    };
  } else if (data === 'V2ray Collector') {
    const configUrl = `${SOURCES.v2rayCollector.baseUrl}/${SOURCES.v2rayCollector.subFile}`;
    response = {
      chat_id: chatId,
      text: `لینک سابسکریپشن V2ray Collector:\n${configUrl}`,
      reply_markup: { keyboard: [['بازگشت']] }
    };
  } else if (data === 'Free SUB Link') {
    const configUrl = `${SOURCES.freeSubLink.baseUrl}/${SOURCES.freeSubLink.subFile}`;
    response = {
      chat_id: chatId,
      text: `لینک سابسکریپشن Free SUB Link:\n${configUrl}`,
      reply_markup: { keyboard: [['بازگشت']] }
    };
  } else if (data === 'Vless Sub') {
    const configUrl = `${SOURCES.nirevil.baseUrl}/${SOURCES.nirevil.subFile}`;
    response = {
      chat_id: chatId,
      text: `لینک سابسکریپشن Vless Sub:\n${configUrl}`,
      reply_markup: { keyboard: [['بازگشت']] }
    };
  } else if (data === 'Clash') {
    const configUrl = `${SOURCES.v2rayConfigLite.baseUrl}/clash-config.yml`;
    response = {
      chat_id: chatId,
      text: `لینک سابسکریپشن Clash:\n${configUrl}`,
      reply_markup: { keyboard: [['بازگشت']] }
    };
  } else if (data === 'ClashX Top Free') {
    const configUrl = `${SOURCES.clashXTopFreeProxy.baseUrl}/${SOURCES.clashXTopFreeProxy.subFile}`;
    response = {
      chat_id: chatId,
      text: `لینک سابسکریپشن ClashX Top Free Proxy:\n${configUrl}`,
      reply_markup: { keyboard: [['بازگشت']] }
    };
  } else if (data === 'AzadNetCH') {
    const configUrl = `${SOURCES.azadNetCH.baseUrl}/${SOURCES.azadNetCH.subFile}`;
    response = {
      chat_id: chatId,
      text: `لینک سابسکریپشن AzadNetCH:\n${configUrl}`,
      reply_markup: { keyboard: [['بازگشت']] }
    };
  } else if (data === 'Coldwater Free Sub') {
    const configUrl = `${SOURCES.coldwaterFreeSub.baseUrl}/${SOURCES.coldwaterFreeSub.subFile}`;
    response = {
      chat_id: chatId,
      text: `لینک سابسکریپشن Coldwater Free Sub:\n${configUrl}`,
      reply_markup: { keyboard: [['بازگشت']] }
    };
  } else if (data === 'Everyday VPN') {
    const configUrl = `${SOURCES.everydayVPN.baseUrl}/${SOURCES.everydayVPN.subFile}`;
    response = {
      chat_id: chatId,
      text: `لینک سابسکریپشن Everyday VPN:\n${configUrl}`,
      reply_markup: { keyboard: [['بازگشت']] }
    };
  } else if (data === 'بازگشت') {
    response = {
      chat_id: chatId,
      text: 'یکی از گزینه‌ها رو انتخاب کن:',
      reply_markup: {
        keyboard: [
          ['دریافت کانفیگ بر اساس پروتکل'],
          ['دریافت کانفیگ بر اساس لوکیشن'],
          ['کانفیگ‌های ویژه']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    };
  } else {
    response = { chat_id: chatId, text: 'دستور اشتباهه! از گزینه‌های منو استفاده کن.' };
  }

  try {
    await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    });
  } catch (error) {
    console.error(`Error sending message to Telegram: ${error.message}`);
    return new Response('Failed to send message', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}