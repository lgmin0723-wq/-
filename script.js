const API_KEY = "8ab5997488ce4e5e8b0676e93b465139";
const OFFICE_CODE = "M10";
const SCHOOL_CODE = "8000283";
const API_BASE = "https://open.neis.go.kr/hub";

const today = new Date();
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}년 ${m}월 ${d}일`;
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("today").textContent = formatDate(today);
  getMeal();
  getSchedule();
});

async function getMeal() {
  const target = document.getElementById("meal-content");
  const date = today.toISOString().slice(0, 10).replaceAll("-", "");

  const url = new URL(`${API_BASE}/mealServiceDietInfo`);
  url.search = new URLSearchParams({
    KEY: API_KEY,
    Type: "json",
    pIndex: "1",
    pSize: "100",
    ATPT_OFCDC_SC_CODE: OFFICE_CODE,
    SD_SCHUL_CODE: SCHOOL_CODE,
    MLSV_YMD: date
  });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("급식 정보를 가져오지 못했습니다.");
    const data = await response.json();
    const rows = data.mealServiceDietInfo?.[1]?.row || [];

    if (!rows.length) {
      target.textContent = "오늘은 등록된 급식 정보가 없습니다.";
      return;
    }

    target.replaceChildren();
    rows.forEach((row) => {
      const title = document.createElement("h3");
      title.textContent = row.MMEAL_SC_NM || "급식";
      const menu = document.createElement("p");
      menu.textContent = (row.DDISH_NM || "")
        .replace(/<br\s*\/?\s*>/gi, "\n")
        .replace(/\([^)]*\)/g, "")
        .trim();
      const calories = document.createElement("p");
      calories.className = "calories";
      calories.textContent = row.CAL_INFO ? `열량: ${row.CAL_INFO}` : "";
      target.append(title, menu, calories);
    });
  } catch (error) {
    target.textContent = "급식 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.";
    console.error(error);
  }
}

async function getSchedule() {
  const target = document.getElementById("schedule-list");
  const start = new Date(today);
  const end = new Date(today);
  end.setMonth(end.getMonth() + 3);

  const toYmd = (date) =>
    `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;

  const url = new URL(`${API_BASE}/SchoolSchedule`);
  url.search = new URLSearchParams({
    KEY: API_KEY,
    Type: "json",
    pIndex: "1",
    pSize: "300",
    ATPT_OFCDC_SC_CODE: OFFICE_CODE,
    SD_SCHUL_CODE: SCHOOL_CODE,
    AA_FROM_YMD: toYmd(start),
    AA_TO_YMD: toYmd(end)
  });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("학사일정을 가져오지 못했습니다.");
    const data = await response.json();
    const rows = data.SchoolSchedule?.[1]?.row || [];

    if (!rows.length) {
      target.textContent = "표시할 학사일정이 없습니다.";
      return;
    }

    rows.sort((a, b) => (a.AA_YMD || "").localeCompare(b.AA_YMD || ""));
    target.replaceChildren();

    rows.forEach((row) => {
      const item = document.createElement("article");
      item.className = "schedule-item";

      const date = document.createElement("time");
      const rawDate = row.AA_YMD || "";
      date.textContent = rawDate.length === 8
        ? `${rawDate.slice(0, 4)}.${rawDate.slice(4, 6)}.${rawDate.slice(6, 8)}`
        : rawDate;

      const name = document.createElement("p");
      name.textContent = row.EVENT_NM || "일정";

      item.append(date, name);
      target.appendChild(item);
    });
  } catch (error) {
    target.textContent = "학사일정을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.";
    console.error(error);
  }
}