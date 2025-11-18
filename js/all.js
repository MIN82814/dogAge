(function () {
  // DOM 元素
  const birthInput = document.getElementById("birth");
  const calcBtn = document.getElementById("calcBtn");
  const dogAgeEl = document.getElementById("dogAge");
  const humanAgeEl = document.getElementById("humanAge");
  const sizeRadios = document.querySelectorAll('input[name="size"]');

  const infoNote = document.getElementById("birthHelp"); // info block 說明
  const pillEl = document.querySelector(".pill"); // 下方 pill
  const formulaEl = document.querySelector(".muted"); // 下方公式提示
  const resultNoteEl = document.getElementById("resultNote"); // 右側換算提示

  // 體型參數對應表
  const SIZE_MAP = {
    small: {
      rateEstimate: 4,
      rateMin: 3.5,
      rateMax: 4.5,
      label: "小型犬（4–5）",
    },
    medium: {
      rateEstimate: 4.5,
      rateMin: 4,
      rateMax: 5,
      label: "中型犬（4.5–6）",
    },
    large: {
      rateEstimate: 5.5,
      rateMin: 5,
      rateMax: 6,
      label: "大型犬（5–7）",
    },
  };

  const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.2425;

  // 解析日期
  function parseInputDate(val) {
    if (!val) return null;
    const parts = val.split("-");
    if (parts.length !== 3) return null;
    return new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
  }

  // 計算狗狗年齡
  function calcDogAgeYears(birthDate, asOfDate) {
    const ms = asOfDate - birthDate;
    if (ms < 0) return -1;
    return ms / MS_PER_YEAR;
  }

  // 狗狗年齡轉換成人類
  function dogToHumanYears(dogYears, options) {
    const rate = options.rateEstimate ?? 4.5;
    const rateMin = options.rateMin ?? 4;
    const rateMax = options.rateMax ?? 5;

    if (dogYears <= 0) return { estimate: 0, range: [0, 0] };
    if (dogYears < 1)
      return { estimate: dogYears * 15, range: [dogYears * 15, dogYears * 15] };
    if (dogYears < 2)
      return {
        estimate: 15 + (dogYears - 1) * 9,
        range: [15 + (dogYears - 1) * 9, 15 + (dogYears - 1) * 9],
      };

    const extraYears = dogYears - 2;
    return {
      estimate: 24 + extraYears * rate,
      range: [24 + extraYears * rateMin, 24 + extraYears * rateMax],
    };
  }

  function formatNumber(num, digits = 2) {
    return Number.isFinite(num) ? num.toFixed(digits) : "—";
  }

  // 更新 info-block 與相關文字
  function updateInfoBlock(selectedSize) {
    const cfg = SIZE_MAP[selectedSize];

    // 左下 info 說明
    infoNote.textContent = `本工具依照常用換算指引計算：第一年約 15 歲、第二年快速成熟約達 24 歲，2 歲後依犬隻體型換算（${
      cfg.label
    }），每年約增加 ${cfg.rateMin.toFixed(1)}–${cfg.rateMax.toFixed(
      1
    )} 人類歲。結果為估算值，請以獸醫或實際健康狀況為準。`;

    // 下方 pill
    pillEl.textContent = `體型：${cfg.label}`;

    // 下方公式提示
    formulaEl.textContent = `計算公式提示：1st year = 15；2nd year + 約 9；後續每年約 ${cfg.rateEstimate.toFixed(
      1
    )}（平均）`;

    // 右側結果文字
    if (resultNoteEl) {
      resultNoteEl.textContent = `（換算採用${cfg.label}標準；顯示估算值與範圍）`;
    }
  }

  // 顯示計算結果
  function displayResult() {
    const birthDate = parseInputDate(birthInput.value);
    if (!birthDate) {
      dogAgeEl.textContent = "請輸入正確的生日";
      humanAgeEl.textContent = "—";
      return;
    }

    const now = new Date();
    const dogYears = calcDogAgeYears(birthDate, now);
    if (dogYears < 0) {
      dogAgeEl.textContent = "尚未出生或日期錯誤";
      humanAgeEl.textContent = "—";
      return;
    }

    const selectedRadio = document.querySelector('input[name="size"]:checked');
    if (!selectedRadio) {
      alert("請選擇體型");
      return;
    }

    const selectedSize = selectedRadio.value;
    const sizeConfig = SIZE_MAP[selectedSize];
    const human = dogToHumanYears(dogYears, sizeConfig);

    dogAgeEl.textContent = formatNumber(dogYears, 2) + " 歲";
    let rangeText = "";
    if (Math.abs(human.range[1] - human.range[0]) > 0.001) {
      rangeText = `（約 ${formatNumber(human.range[0], 1)}–${formatNumber(
        human.range[1],
        1
      )}）`;
    }
    humanAgeEl.textContent = human.estimate.toFixed(1) + " 歲 " + rangeText;

    // 存生日
    localStorage.setItem("dogBirth", birthInput.value);

    // 更新 info block 與提示文字
    updateInfoBlock(selectedSize);
  }

  // ----------------------
  // 初始化
  // ----------------------
  window.addEventListener("DOMContentLoaded", () => {
    // 讀取 localStorage
    const saved = localStorage.getItem("dogBirth");
    if (saved) birthInput.value = saved;

    displayResult();
  });

  // ----------------------
  // 事件綁定
  // ----------------------
  calcBtn.addEventListener("click", displayResult);
  birthInput.addEventListener("change", displayResult);
  sizeRadios.forEach((radio) =>
    radio.addEventListener("change", displayResult)
  );
})();
