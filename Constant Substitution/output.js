const req = function() {
  let random = Math.random() * 1000;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://api.n0tar3als1t3.dev:1423/getData");
  xhr.setRequestHeader("RandomInt", random);
  xhr.setRequestHeader("Accept", "text/html");
  xhr.setRequestHeader("Accept-Encoding", "gzip, deflate, br");
  xhr.setRequestHeader("Accept-Language", "en-US,en;q=0.9");
  xhr.setRequestHeader("Cache-Control", "no-cache");
  xhr.setRequestHeader("Connection", "keep-alive");
  xhr.setRequestHeader("Host", "n0tar3als1t3.dev");
  xhr.setRequestHeader("Pragma", "no-cache");
  xhr.setRequestHeader("Referer", "https://n0tar3als1t3.dev");
  xhr.setRequestHeader('sec-ch-ua", "" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"');
  xhr.setRequestHeader("sec-ch-ua-mobile", "?0");
  xhr.setRequestHeader("sec-ch-ua-platform", '"Windows"');
  xhr.setRequestHeader("Sec-Fetch-Dest", "empty");
  xhr.setRequestHeader("Sec-Fetch-Mode", "cors");
  xhr.setRequestHeader("Sec-Fetch-Site", "same-origin");
  xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36");

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      console.log(xhr.status);
      console.log(xhr.responseText);
    }
  };

  xhr.send();
};