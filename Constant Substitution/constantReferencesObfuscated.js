/**
 * "constantReferencesObfuscated.js"
 * This is the resulting code after obfuscation.
 *
*/
const QY$e_yOs = "https://api.n0tar3als1t3.dev:1423/getData";
let apNykoxUn = "sec-ch-ua-mobile";
const zgDT = "Connection";
let A$E =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36";
const XVyy$qGVDc = "Sec-Fetch-Dest";
var EkoMLkb = "Cache-Control";
let $jAONLEC = "Host";
var PGOSDhGVlcd = "https://n0tar3als1t3.dev";
const m$ua = "Accept-Encoding";
var Hw$seiMEes = "Pragma";
const ZHCx = "Sec-Fetch-Site";
var PfxQUj = "Referer";
const e_WXHbgheSe = "Accept";
const _VTGows = "GET";
var kphzJIkbgb = "gzip, deflate, br";

const req = function () {
  const SNgfg = "no-cache";
  let vOqEy = "text/html";
  const uugBXYcdsHp = "same-origin";
  const AH$HwC = "Accept-Language";
  var PnAJsD =
    'sec-ch-ua", "" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"';
  const Svno = "n0tar3als1t3.dev";
  let OTCqIvdmed = '"Windows"';
  let mVu = "RandomInt";
  const UgLln = "empty";
  const HwjBe = "?0";
  var QnXFnewjh = "Sec-Fetch-Mode";
  var lGhlU$gqPoK = "cors";
  const GcictYiOQ = "User-Agent";
  const AfYNl = "no-cache";
  var cLAVjnFa = "keep-alive";
  var V$lt = "en-US,en;q=0.9";
  const TlMBXe = "sec-ch-ua-platform";
  let random = Math.random() * 1000;
  var xhr = new XMLHttpRequest();
  var url = QY$e_yOs;
  xhr.open(_VTGows, url);
  xhr.setRequestHeader(mVu, random);
  xhr.setRequestHeader(e_WXHbgheSe, vOqEy);
  xhr.setRequestHeader(m$ua, kphzJIkbgb);
  xhr.setRequestHeader(AH$HwC, V$lt);
  xhr.setRequestHeader(EkoMLkb, SNgfg);
  xhr.setRequestHeader(zgDT, cLAVjnFa);
  xhr.setRequestHeader($jAONLEC, Svno);
  xhr.setRequestHeader(Hw$seiMEes, AfYNl);
  xhr.setRequestHeader(PfxQUj, PGOSDhGVlcd);
  xhr.setRequestHeader(PnAJsD);
  xhr.setRequestHeader(apNykoxUn, HwjBe);
  xhr.setRequestHeader(TlMBXe, OTCqIvdmed);
  xhr.setRequestHeader(XVyy$qGVDc, UgLln);
  xhr.setRequestHeader(QnXFnewjh, lGhlU$gqPoK);
  xhr.setRequestHeader(ZHCx, uugBXYcdsHp);
  xhr.setRequestHeader(GcictYiOQ, A$E);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      console.log(xhr.status);
      console.log(xhr.responseText);
    }
  };

  xhr.send();
};

