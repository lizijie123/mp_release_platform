import { version } from 'process'

const spiders = [
  'TencentTraveler',
  'Baidu-YunGuanCe',
  'Baiduspider+',
  'BaiduGame',
  'Googlebot',
  'msnbot',
  'Sosospider+',
  'Sogou web spider',
  'ia_archiver',
  'Yahoo! Slurp',
  'YoudaoBot',
  'Yahoo Slurp',
  'MSNBot',
  'Java (Often spam bot)',
  'BaiDuSpider',
  'Voila',
  'Yandex bot',
  'BSpider',
  'twiceler',
  'Sogou Spider',
  'Speedy Spider',
  'Google AdSense',
  'Heritrix',
  'Python-urllib',
  'Alexa (IA Archiver)',
  'Ask',
  'Exabot',
  'Custo',
  'OutfoxBot/YodaoBot',
  'yacy',
  'SurveyBot',
  'legs',
  'lwp-trivial',
  'Nutch',
  'StackRambler',
  'The web archive (IA Archiver)',
  'Perl tool',
  'MJ12bot',
  'Netcraft',
  'MSIECrawler',
  'WGet tools',
  'larbin',
  'Fish search',
]

const isSpiders = (userAgent) => {
  const len = spiders.length
  for (let i = 0; i < len; i++) {
    const obj = spiders[i]
    if (userAgent.toLowerCase().indexOf(obj.toLowerCase()) !== -1) {
      return true
    }
  }

  return false
}

// 获取系统语言
const getLanguage = req => {
  const g = (req.headers['accept-language'] || (__CLIENT__ && navigator.language) || '不详').toLowerCase().split(';')[0].split(',')[0]
  return g === escape('zh-cn')
}

export const getBrowser = (req = { headers: {} }) => {
  const xRequestedWith = req.headers['x-requested-with'] || ''
  let u = req.headers['user-agent']
  const navigator = __CLIENT__ ? window.navigator : {}
  u = u || navigator.userAgent || ''
  const reg = new RegExp(/\([^)]+\)/)
  const info = {
    // 系统详细型号
    system: escape(
      u.match(reg)
      && u.match(reg)[0]
      && (u.match(reg)[0].split(';')[1]
      && u.match(reg)[0].split(';')[1].replace(/^\(|^ | $|\)$/ig, ''))
      || '不详',
    ),
    // 设备: pc/移动/平板
    device: 'PC',
    // 系统语言
    language: getLanguage(req),
  }
  const match = {
    // 内核
    Node: u.indexOf('node') !== -1,
    Trident: u.indexOf('Trident') > 0,
    Presto: u.indexOf('Presto') > 0,
    WebKit: u.indexOf('AppleWebKit') > 0,
    Gecko: u.indexOf('Gecko') > 0,
    // 浏览器
    Spider: isSpiders(u),
    UC: u.indexOf('UC') > 0 || u.indexOf('UBrowser') > 0,
    QQ: u.indexOf('QQBrowser') > 0,
    DouYin: u.includes('douyin') || u.includes('ByteLocale') || u.includes('ByteFullLocale'),
    WeiXin: u.indexOf('MicroMessenger') !== -1,
    BaiDu: u.indexOf('Baidu') > 0 || u.indexOf('BIDUBrowser') > 0,
    Alipay: (u.includes('AlipayDefined') || u.includes('AlipayClient') || u.includes('AliApp')) && !u.includes('DingTalk') && !u.includes('MiniProgram'),
    AliApplet: (u.includes('AlipayDefined') || u.includes('AlipayClient') || u.includes('AliApp')) && u.includes('MiniProgram'),
    ToutiaoApplet: false,
    BaiduApplet: false,
    Weibo: u.indexOf('Weibo') !== -1,
    Maxthon: u.indexOf('Maxthon') > 0,
    SouGou: u.indexOf('MetaSr') > 0 || u.indexOf('Sogou') > 0,
    IE: u.indexOf('MSIE') > 0,
    Firefox: u.indexOf('Firefox') > 0,
    Opera: u.indexOf('Opera') > 0 || u.indexOf('OPR') > 0,
    Safari: u.indexOf('Safari') > 0,
    Chrome: u.indexOf('Chrome') > 0 || u.indexOf('CriOS') > 0,
    // 系统或平台
    Windows: u.indexOf('Windows') > 0,
    Mac: u.indexOf('Macintosh') > 0,
    Android: u.indexOf('Android') > 0 || u.indexOf('Adr') > 0,
    WP: u.indexOf('IEMobile') > 0,
    BlackBerry: u.indexOf('BlackBerry') > 0 || u.indexOf('RIM') > 0 || u.indexOf('BB') > 0,
    MeeGo: u.indexOf('MeeGo') > 0,
    Symbian: u.indexOf('Symbian') > 0,
    iOS: u.indexOf('like Mac OS X') > 0 || u.indexOf('ios') !== -1 || u.indexOf('iOS') !== -1 || u.indexOf('IOS') !== -1,
    iPhone: u.indexOf('iPh') > 0,
    iPad: u.indexOf('iPad') > 0,
    // 设备
    Mobile: u.indexOf('Mobi') > 0 || u.indexOf('iPh') > 0 || u.indexOf('480') > 0,
    Tablet: u.indexOf('Tablet') > 0 || u.indexOf('iPad') > 0 || u.indexOf('Nexus 7') > 0,
  }
  // 修正
  if (!match.Trident) {
    match.Trident = match.IE
  }

  if (match.Gecko) {
    match.Gecko = !match.WebKit
  }

  if (match.QQ) {
    match.QQ = !match.WeiXin
  }

  if (match.Chrome) {
    match.Chrome = !(match.Opera + match.BaiDu + match.Maxthon + match.SouGou + match.UC + match.QQ + match.WeiXin)
  }

  if (match.Safari) {
    match.Safari = !(match.Chrome + match.Opera + match.BaiDu + match.Maxthon + match.SouGou + match.UC + match.QQ + match.WeiXin)
  }

  if (match.Mobile) {
    match.Mobile = !match.iPad
  }
  // 信息输出
  const hash = {
    // 浏览器引擎
    engine: ['Trident', 'Presto', 'WebKit', 'Gecko', 'Node'],
    // 浏览器外壳
    browser: ['UC', 'QQ', 'BaiDu', 'Alipay', 'ToutiaoApplet', 'AliApplet', 'Weibo', 'Maxthon', 'SouGou', 'IE', 'Firefox', 'Opera', 'Safari', 'Chrome', 'WeiXin', 'Node', 'Spider', 'GZRCB', 'ZMXY', 'ZJHT', 'Mina', 'JD'],
    // 系统类别
    os: ['Windows', 'Mac', 'Android', 'WP', 'BlackBerry', 'MeeGo', 'Symbian', 'iOS', 'iPhone', 'iPad', 'Node'],
    // 设备
    device: ['Mobile', 'Tablet', 'Node'],
  }

  Object.entries(hash).map(([key, value]) => {
    value.map(v => {
      if (Reflect.has(match, v)) {
        info[key] = version
      }
    })
  })

  return {
    versions: match,
    info,
  }
}

export default function (self) {
  const root = self
  let isBrowserSide = false
  if (__CLIENT__ && root === window) {
    isBrowserSide = true
  }

  return isBrowserSide
}
