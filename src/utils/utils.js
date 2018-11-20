// Check server
export const IsLiveServer = window.location.hostname === "cubego.io"
  || window.location.hostname === "www.cubego.io";

export const IsLocalhost = window.location.hostname === "localhost"
  || window.location.hostname === "www.localhost"
  || window.location.hostname === "127.0.0.1"
  || window.location.hostname === "222.127.0.0.1";

export const CutoffString = (s, p) => (!s || s.length <= p ? s : `${s.substr(0, p)}...`);

export const BoundVal = (val, mmin, mmax) => Math.max(mmin, Math.min(val, mmax));

export const MergeObjects = (a, b) => {
  for (let i in b)
    if (b.hasOwnProperty(i))
      a[i] = b[i];
  return a;
};

export const ConvertUnixToDateTime = (unixTime) => ((new Date(unixTime * 1000)).toLocaleDateString());

export const GetSumOfObjArray = (arr, key) => (arr.reduce((total, e) => (total + ((e && e[key]) || 0)), 0));

export const RoundToDecimalStr = (num, numRound) => (num ? parseFloat(parseFloat(num).toFixed(numRound)).toString() : num);
export const RoundToDecimalFloat = (num, numRound) => (num ? parseFloat(parseFloat(num).toFixed(numRound)) : num);

export const RoundDownToDecimal = (num, numRound) => (Math.floor(num * Math.pow(10, numRound)) / Math.pow(10, numRound));
export const RoundUpToDecimal = (num, numRound) => (Math.ceil(num * Math.pow(10, numRound)) / Math.pow(10, numRound));

export const AddHeadingZero = (num, len) => {
  let str = '' + num;
  while (str.length < len) str = '0' + str;
  return str;
};

/**
 * Time Utils
 */
export const GetCurrentUnixTime = () => Math.floor(Date.now() / 1000);

export const FormatUnixTime = (unixTime) => {
  let hours = Math.floor(unixTime / 60 / 60);
  let minutes = Math.floor((unixTime - hours * 60 * 60) / 60);
  let seconds = Math.floor(unixTime - hours * 60 * 60 - minutes * 60);
  return `${hours} : ${minutes} : ${seconds}`
};

export const ExtractUnixTime = (unixTime) => {
  let days = Math.floor(unixTime / 60 / 60 / 24);
  let hours = Math.floor((unixTime - days * 24 * 60 * 60) / 60 / 60);
  let minutes = Math.floor((unixTime - days * 24 * 60 * 60 - hours * 60 * 60) / 60);
  let seconds = Math.floor(unixTime - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60);
  return {days, hours, minutes, seconds};
};

export const ScrollTop = () => {window.scroll(0, 0)};

export const ToJS = (immutableObj) => (immutableObj && immutableObj.toJS ? immutableObj.toJS() : immutableObj);


/**
 * Array Utils
 */
export const ArrayCalAverage = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;


/**
 * Object Utils
 */
export const ObjFilter = (obj, func) => {
  let result = {};
  Object.keys(obj).forEach((key) => {
    if (func(obj[key])) result[key] = obj[key];
  });
  return result;
};

export const ObjIsEmpty = (obj) => (obj ? !Object.keys(obj).length : true);

export const ObjRename = (obj, oldKey, newKey) => {
  if (oldKey === newKey || !obj) return;
  obj[newKey] = obj[oldKey];
  delete obj[oldKey];
};

/**
 * Metamask & Web3 related
 */
export const HasWalletSupported = () => (!!window.hasWeb3Injected);
export const hasWalletUnlocked = () => (!!window.account);

/**
 * Url, Query related
 */

export const handleJoinQueryURL = (push, query, filterValues) => {
  let newQuery = {...query, ...filterValues};

  let strQuery = [];
  for (let key in newQuery) {
    if (newQuery[key] !== null && newQuery[key] !== 'undefined') {
      let kk = key;
      let vv = newQuery[key];
      strQuery.push(`${kk}=${typeof(vv) !== 'string' ? JSON.stringify(vv) : vv}`);
    }
  }

  push(`?${strQuery.join('&')}`)
};

export const ParseQueryString = (searchStr) => {
  let vars = searchStr.substring(1).split('&');
  let res = {};
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split('=');
    if (pair.length >= 2) {
      try {
        res[pair[0]] = JSON.parse(window.decodeURIComponent(pair[1]));
      } catch (e) {
        res[pair[0]] = window.decodeURIComponent(pair[1]);
      }
    }
  }
  return res;
};


/**
 * sites
 */
export const IsChrome   = navigator.userAgent.indexOf('Chrome') > -1;
export const IsIE       = navigator.userAgent.indexOf('MSIE') > -1;
export const IsFirefox  = navigator.userAgent.indexOf('Firefox') > -1;
export const IsSafari   = IsChrome && navigator.userAgent.indexOf("Safari") > -1 ? false : navigator.userAgent.indexOf("Safari") > -1;
export const IsCamino   = navigator.userAgent.indexOf("Camino") > -1;
export const IsOpera    = IsChrome && navigator.userAgent.toLowerCase().indexOf("op") > -1 ? false : navigator.userAgent.toLowerCase().indexOf("op") > -1;

export const IsMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
export const IsIOS = (/iPad|iPhone|iPod/i.test(navigator.userAgent));
export const IdAndroid = (/Android/i.test(navigator.userAgent));

export const OpenMetamaskInstallation = () => {
  if (IsFirefox)
    OpenInNewTab('https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/');
  else if (IsOpera)
    OpenInNewTab('https://addons.opera.com/en/extensions/details/metamask/');
  else
    OpenInNewTab('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn');
};

export const OpenToshiInstallation = () => {
  if (IsIOS)
    OpenInNewTab('https://itunes.apple.com/us/app/toshi-ethereum/id1278383455?ls=1&mt=8');
  else
    OpenInNewTab('https://play.google.com/store/apps/details?id=org.toshi');
};

export const OpenCipherInstallation = () => {
  if (IsIOS)
    OpenInNewTab('https://itunes.apple.com/app/cipher-browser-for-ethereum/id1294572970?ls=1&mt=8');
  else
    OpenInNewTab('https://play.google.com/store/apps/details?id=com.cipherbrowser.cipher');
};

export const OpenInNewTab = (url) => {
  let win = window.open(url, '_blank');
  if (win) {
    //Browser has allowed it to be opened
    win.focus();
  } else {
    //Browser has blocked it
    alert('Please allow popups for this website');
  }
};


/**
 * Format
 */

export const VerifyEmail =  (email)  => {
  let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * General Utils
 */
export const Capitalize = (s) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const CopyToClipboard = (str) => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

export const TryRequire = (path) => {
  try {
    return require(`${path}`);
  } catch (err) {
    return null;
  }
};

export const delay = (duration) => {
  return function (...args) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(...args);
      }, duration);
    });
  }
};

export const runPromiseQueue = funcs => {
  return funcs.reduce((promise, func) => {
    return promise.then((result) => {
      let funcRes = func();
      if (typeof funcRes === 'function') {
        return funcRes;
      } else {
        return Promise.resolve(funcRes);
      }
    });
  }, Promise.resolve([]))
};

export const ConvertNonNullToString = (value) => (value !== undefined && value !== null ? `${value}`: value);

export const AddHeadingZeros = (val, numDigits) => {
  let c = 0, r = '', temp = val;
  while (temp !== 0) {
    c += 1;
    temp /= 10;
  }
  for (let i = 1; i <= numDigits - c; i += 1) r = r + '0';
  return `${r}${val}`;
};

/**
 * Random Utils
 */

export const GetRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const GetRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.substr(1)
};

/**
 * Clamp position between a range
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
};

/**
 * nearest position between a range
 */
 export const nearestPosition = (value, range, offSet) => {
   return range.find(ele => Math.abs(value - ele) <= offSet)
 }

 /**
 * convert time
 */
export const ConvertTimeUnix = (fromDay, toDay) => {
  let from = new Date(fromDay);
  let to = new Date(toDay);
  let seconds = to.getTime() - from.getTime();
  seconds = seconds / 1000;
  let days = Math.floor(seconds / (3600*24));
  seconds  -= days*3600*24;
  let hrs   = Math.floor(seconds / 3600);
  seconds  -= hrs*3600;
  let mnts = Math.floor(seconds / 60);
  seconds  -= mnts*60;
  seconds = parseInt(seconds)
  return {days: days, hours: hrs, minutes: mnts, seconds: seconds};
}

export const ExtractImageBase64String = (str) => (str.split(',').length > 1 ? str.split(',')[1] : str);