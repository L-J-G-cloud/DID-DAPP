import 'vant/es/toast/style';
import { ethers, utils } from 'ethers'
import { Decimal } from 'decimal.js'
import moment from 'moment'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { useStore } from '../store/store'
import success from '@/assets/imgs/home/success.png'
import fail from '@/assets/imgs/home/fail.png'
import i18n from '../plugin/i18n';

export function showToastIcon(text: string, flag: string, duration = 3000) {
  showToast({
    message: text,
    icon: flag === 'success' ? success : fail,
    forbidClick: true,
    duration: duration,
    wordBreak: 'break-word'
  });
}


export function getStr(str: string, numsBe = 6, numsAf = 6, tempdot = '...') {
  return str.slice(0, numsBe) + tempdot + str.slice(str.length - numsAf, str.length)
}

export function showLoading(callback?: () => void) {
  const store = useStore();
  store.isLoad = false;
  showLoadingToast({
    closeOnClickOverlay: true,
    closeOnClick: true,
    message: i18n.global.t('loading'),
    forbidClick: false,
    duration: 0,
    onClose: () => {
      callback && callback()
    }
  })
}
export function closeToastLoading() {
  const store = useStore();
  store.isLoad = true;
  closeToast();
}

// export function getKMG(str: string) {
//   if(str){
//     const tempStr = effective(str);
//     const temp = KF(tempStr).split(',');
//     console.log(temp);
//     switch(temp.length){
//       case 1:
//         return str;
//       case 2:
//         return {
//           value: temp[0]  + temp[1].slice(0,2),
//           unit: 'K'
//         };
//       case 3:
//         return {
//           value: temp[0] + temp[1].slice(0,2),
//           unit: 'M'
//         };
//       case 4:
//           return {
//           value: temp[0] + temp[1].slice(0,2),
//           unit: 'G'
//         };
//       case 5:
//         return {
//           value: temp[0] + temp[1].slice(0,2),
//           unit: 'T'
//         };
//     }
//   }
// }

export function getBadgeName(type: number) {
  if (type >= 1 && type <= 7) {
    return i18n.global.t('badge_country_list.' + type);
  } else if (type >= 8 && type <= 14) {
    return i18n.global.t('badge_continent_list.' + type);
  } else if (type === 15) {
    return i18n.global.t('badge_global');
  }
  return '';
}


export function getKMG(value: string | number, decimals: number = 2): { value: string, unit: string } {
  let num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return { value: '0', unit: '' };
  const units = ['', 'K', 'M', 'G', 'T'];
  const order = Math.floor(Math.log10(Math.abs(num)) / 3);

  if (order < 1) return { value: (Math.floor(num * 1000) / 1000).toString(), unit: '' }; // 小于1000直接返回
  if (order >= units.length) return { value: num.toExponential(decimals), unit: '' }; // 超过最大单位用科学计数法
  let unitValue = num / Math.pow(1000, order);
  unitValue = Math.floor(unitValue * 1000) / 1000;
  return {
    value: clearZoo(unitValue.toString()),
    unit: units[order]
  };
}

//返回16位随机唯一字符串
function nowDate(): string {
  const D = new Date()

  // let y = D.getFullYear().toString().slice(2)
  const M = D.getMonth()
  const d = D.getDate()
  const h = D.getHours()
  const m = D.getMinutes()
  const s = D.getSeconds()
  return M.toString() + d + h + m + s
}

function getLetterByNumber(num: number, type?: boolean): string {
  let arr = ["t", "i", "h", "s", "l", "u", "b", "y", "k", "f"]
  if (type) {
    arr = ['k', 'u', 'm', 'd', 'y', 'c', 's', 'a', 'b', 'x']
  }
  const random = Math.random() > 0.5
  return random ? arr[num] : String(num)
}

function numberStrToLetters(str: string): string {
  return str.split('').map(s => getLetterByNumber(Number(s))).join('')
}

//strNum:生成的随机字符个数
export function getRandomStr16(strNum = 16): string {
  if (strNum <= 10) {
    console.warn('随机数可能不唯一')
  }
  const pre = numberStrToLetters(nowDate())
  const restNum = strNum - pre.length

  const post = parseInt(String(Math.random() * Math.pow(10, restNum)))
  return pre + numberStrToLetters(String(post))
}

// 去除多余的0
export function effective(val: string) {
  if (!val) return val;
  val = String(val);
  let dot = val.includes(".");
  if (val == '0' || val === "undefined") {
    return "0";
  } else if (dot) {
    let num = 0;
    let start = 0;
    let array = val.split(".")[1].split("");
    for (let index = 0; index < array.length; index++) {
      if (Number(array[index]) >= 0 && start == 0) {
        start = index + 1;
      }
      if (array[index] > '0') {
        num = index + 1;
      }
    }
    let fixe = 0;
    if (num - start >= 3) {
      fixe = start + 3;
    } else {
      fixe = num - start + 1;
    }
    if (num >= 2 && num - start < 3) {
      fixe = num * 2 - start - 1
    }
    if (num == start) {
      fixe = num;
    }
    if (fixe == 0) {
      return val.split(".")[0]
    } else {
      let tempVal = val.slice(0, fixe + val.split(".")[0].length + 1);
      let str = parseFloat(tempVal);
      return String(str).includes('e') ? tempVal : parseFloat(tempVal).toString(); //去除尾部多余的0 避免parseFloat后出现e的科学记数法
    }
  } else {
    return val;
  }
}

export function getDot(val: string) {
  if (!val) return val;
  val = String(val);
  let dot = val.includes(".");
  if (val == '0' || val === "undefined") {
    return "0";
  } else if (dot) {
    const str = val.split('.')[0] + '.' + val.split('.')[1].substring(0, 8);
    // console.log(str,parseFloat(str));
    return parseFloat(str)
  } else {
    return val
  }

}

//保留整数
export function getInt(val: string) {
  return val.includes('.') ? val.split('.')[0] : val
}

//科学分割
export function KF(val: any) {
  return Number(val).toLocaleString('en-US')
}


export function getTimeChou(leftTime: any) {
  var d, h, m, s
  if (leftTime >= 0) {
    d = Math.floor(leftTime / 1000 / 60 / 60 / 24)
    h = Math.floor((leftTime / 1000 / 60 / 60) % 24)
    m = Math.floor((leftTime / 1000 / 60) % 60)
    s = Math.floor((leftTime / 1000) % 60)
  }
  return {
    Day: String(d),
    Hour: String(h).padStart(2, '0'),
    minute: String(m).padStart(2, '0'),
    second: String(s).padStart(2, '0'),
  }
}

export function getUserIP(func: any) {
  if (typeof window != 'undefined') {
    var RTCPeerConnection: any = window.RTCPeerConnection;
    // window.mozRTCPeerConnection ||
    if (RTCPeerConnection) (() => {

      var rtc = new RTCPeerConnection()

      rtc.createDataChannel(''); //创建一个可以发送任意数据的数据通道

      rtc.createOffer((offerDesc: any) => { //创建并存储一个sdp数据

        rtc.setLocalDescription(offerDesc)

      }, (e: any) => { console.log(e) })

      rtc.onicecandidate = (evt: any) => { //监听candidate事件

        if (evt.candidate) {

          console.log('evt:', evt.candidate)

          let ip_rule: any = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/

          var ip_addr: any = ip_rule.exec(evt.candidate.candidate)[1]
          // this.test(ip_addr);//调用方法把ip地址的值传出去
          func(ip_addr)
        }
      }
    })()
  }
}


export function formatDecimal(str: string, num = 6, falg = true) {
  //str当前输入值，num是想要保留的小数位数
  str = String(str);
  if (str == '--') {
    return '--'
  }
  if (!str.trim()) {
    return '0';
  }
  var len1 = str.substr(0, 1);
  var len2 = str.substr(1, 1);
  // 如果第一位是0，第二位不是点，就用数字把点替换掉
  if (str.length > 1 && Number(len1) === 0 && len2 !== ".") {
    str = str.substr(1, 1);
  }
  // 第一位不能是.
  if (len1 === ".") {
    str = "";
  }
  // 限制只能输入一个小数点
  if (str.indexOf(".") !== -1) {
    var str_ = str.substr(str.indexOf(".") + 1);
    if (str_.indexOf(".") !== -1) {
      str = str.substr(0, str.indexOf(".") + str_.indexOf(".") + 1);
    }
  }
  // 正则替换
  str = str.replace(/[^\d^.]+/g, ""); // 保留数字和小数点
  if (num || num === 0) {
    var rest = str.split(".")[1];
    if (rest && rest.length > num) {
      rest = rest.substr(0, num);
      str = str.split(".")[0] + "." + rest;
    }
  }
  return falg ? addThousandthSign(str) : clearZoo(str);
}

export function getRate(duty1: string, duty2: string) {
  const result = new Decimal(duty1).add(new Decimal(duty2)).sub(new Decimal(Math.pow(10, 27))).mul(new Decimal(3600)).mul(new Decimal(24)).mul(new Decimal(365)).div(new Decimal(Math.pow(10, 25))).toFixed(2);
  return result;
}

// export async function upDateUserInfo() {
//   let params = {
//     phone: store.state.telPhone,
//     region: store.state.region,
//     email: store.state.email,
//     mode: store.state.isPhoneLogin ? 'phone' : 'email'
//   }
//   store.state.isPhoneLogin ? params.email = '' : params.phone = '';
//   // const { code, data } = await getUserData(params);
//   // if (!code) {
//   //   store.abonus_identity = data.abonus_identity;
//   //   store.energy_token_name = data.energy_token_name;
//   //   store.is_special = data.is_special;
//   //   store.email = data.email;
//   // }
// }

export function replaceInvalidInput(input: string): string {
  // 清除除了数字和小数点以外的字符
  const cleanedInput = input.replace(/[^0-9.]/g, '');
  // 只保留第一个小数点，并清除多余的小数点
  const dotIndex = cleanedInput.indexOf('.');
  let formattedInput = dotIndex !== -1 ? cleanedInput.replace(/\./g, (match, index) => index === dotIndex ? match : '') : cleanedInput;
  // 限制小数位数（最多六位小数）
  const decimalIndex = formattedInput.indexOf('.');
  if (decimalIndex !== -1 && formattedInput.length - decimalIndex > 7) {
    formattedInput = formattedInput.slice(0, decimalIndex + 7);
  }
  return formattedInput;
}

export function addThousandthSign(numStr: string | number) { //处理数字的千分
  let regForm = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g; //小数点也分千分位
  numStr = String(numStr);
  if (numStr.includes('.')) {
    let num = numStr.split('.')[0];
    let dotNum = numStr.split('.')[1];
    let resultStr = num.toString().replace(regForm, "$1,");
    return clearZoo(`${resultStr}.${dotNum}`);
  } else {
    return clearZoo(numStr.toString().replace(regForm, "$1,"))
  }
}


//根据不同的时区转换
export function getdata(launchStartTimeStamp: any) {
  var offset = new Date() + '' //将时间格式转为字符串
  // console.log(offset);  //  Mon Nov 02 2020 20:57:20 GMT-0600 (北美中部标准时间)
  let GMTAfter = offset.indexOf('GMT') //拿到这个-0600也就是当前所在时区，然后转时间戳的
  let current_time = offset.substring(GMTAfter + 3, GMTAfter + 8) //-0600    给了你定义的一个字段，在拿到数据后使用
  let time = moment(launchStartTimeStamp)
    .utcOffset(current_time)
    .format('YYYY-MM-DD')
  let timeXie = moment(launchStartTimeStamp)
    .utcOffset(current_time)
    .format('YYYY/MM/DD')
  let timeDetail = moment(launchStartTimeStamp)
    .utcOffset(current_time)
    .format('YYYY-MM-DD HH:mm:ss')
  let timeYMDHM = moment(launchStartTimeStamp)
    .utcOffset(current_time)
    .format('YYYY-MM-DD HH:mm')
  let day: any = moment(time).day().toString().padStart(2, '0');
  let HMS: string = moment(launchStartTimeStamp)
    .utcOffset(current_time)
    .format('HH:mm:ss');
  let HM = moment(launchStartTimeStamp)
    .utcOffset(current_time)
    .format('HH:mm');
  day = day + ' '
  let nys = time.split('-')
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let month = months.find((item, index) => Number(nys[1]) == index + 1)
  let years = nys[0]
  let daily = nys[2]
  let cnmonth = nys[1]
  let sfm = timeDetail.split('')[1]
  let langEnStr = month + ' ' + daily + ' ' + years + ' ' + HMS;
  let langEnYMS = month + ' ' + daily + ' ' + years;
  return { day, time, timeDetail, month, years, daily, sfm, cnmonth, langEnStr, langEnYMS, timeXie, HM, timeYMDHM }
}


export function clearZoo(str: string) {
  if (!str.includes('.')) return str;
  for (let index = str.length - 1; index > 0; index--) {
    if (str[index] == '0') {
      str = str.slice(0, index)
    } else if (str[index] === '.') {
      return str.slice(0, index)
    } else {
      return str
    }
  }
  return str
}

export function changE(str: string) {//将String 大数后带e的转成不带e的字符串
  let num = str.split('e')[0];
  let deci = str.split('+')[1];
  return utils.formatUnits(utils.parseUnits(num, deci), 18)
}

export function getResultData(val: any, flag?: boolean) {//flag 代表是否需要保留四位小数
  if (!val) {
    return '0'
  }
  var valStr = String(val);//当数字过大时转换会出现e小数点精度最多保留14位最后一位四舍五入但是一般也够用了
  var tempStr = valStr.includes('e') ? changE(valStr) : utils.formatUnits(valStr, 18);
  const str = String(effective(tempStr));
  return flag ? clearZoo(addThousandthSign(String(tempStr))) : addThousandthSign(str);
}

/*
  浮点数截取位数精度
  参数 _float 取药处理的浮点数
      _decimal精度位数

  区别toFixed, toFixed会四舍五入
*/
export function tofixedWithEndPad(_float: any, _decimal: number) {
  if (!_float) {
    console.warn('num is required')
    return '0'
  }
  // let intLength = parseInt(String(_float)).toString().length
  let u = Math.pow(10, _decimal)

  let resNum = Math.floor(Number(_float) * u) / u

  //处理小数位数不足的情况
  let strResNumArr = String(resNum).split('.')

  let decimalDidget =
    strResNumArr[1] && strResNumArr[1].length ? strResNumArr[1].length : 0

  let decimalDidgetStr =
    (strResNumArr[1] ? strResNumArr[1] : '') +
    String(Math.pow(10, _decimal - decimalDidget)).slice(1)

  return strResNumArr[0] + '.' + decimalDidgetStr
}


//输入00、01等0开头的整数时，直接清空输入框让用户重新输入
export function vailNum(amount: string) {
  amount = amount
    .replace(/[^\d.]/g, "") //只能输入数字
    .replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d).*$/, "$1$2.$3") //只能输入四个小数
    .replace(/\.{2,}/g, "."); //出现多个点时只保留第一个
  // 第一位不让输小数点
  if (amount == ".") {
    amount = "";
  }
  // 如果第一位是0，有第二位且第二位不是小数点的情况下 就清空输入框
  if (amount.slice(0, 1) == "0") {
    if (amount.slice(1, 2)) {
      if (amount.slice(1, 2) == ".") {
        console.log("第二位是小数点");
      } else {
        console.log("第二位不是小数点，清空输入框");
        amount = "";
      }
    }
  }
  return amount
}

export function convertScientificNotationToString(num: any) {
  if (num == 0) return "0"; // 处理特殊情况：0
  if (!String(num).includes('e')) { return num };
  num = Number(num);
  let [base, exponent] = num.toExponential().split("e");
  base = base.replace('.', ''); // 去掉小数点
  exponent = parseInt(exponent, 10);

  if (exponent < 0) {
    // 小数点左移
    const decimalPlaces = Math.abs(exponent) - 1;
    return "0." + "0".repeat(decimalPlaces) + base;
  } else {
    // 小数点右移
    return base + "0".repeat(exponent - (base.length - 1));
  }
}

export function decimalParseToNumber(num: any, decimals = 18) {
  if (num == '--') {
    return '--'
  }
  if (!Number(num)) {
    return num;
  }
  let nums = ethers.utils.formatUnits(num, decimals);
  return nums;
}




// 检测用户输入地址是否符合规范
export function isValidBEP20OrPolygonAddress(address: string) {
  // 正则表达式：验证以 0x 开头，且后面跟随 40 个十六进制字符
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
}



export function isPc() {
  return !navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  )
}

export function isBSC(chainId: string) {
  //这里列出支持的主链id
  const tokenMap = {
    pro: {
      '56': 'BSC',
      '0x56': 'BSC',
      '0x38': 'BSC',
    },
    test: {
      '61': 'BSC',  // test //通过bitkeep 主网bsc拿到的也是61
      '0x61': 'BSC',  // test
      '97': 'BSC'
    }
  }
  // return tokenMap.pro[chainId] === 'BSC'
  if (import.meta.env.MODE == 'development') {
    return chainId in tokenMap.test && tokenMap.test[chainId as keyof typeof tokenMap.test] === 'BSC'
  } else {
    return chainId in tokenMap.pro && tokenMap.pro[chainId as keyof typeof tokenMap.pro] === 'BSC'
  }
}

