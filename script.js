const calendar = document.querySelector(".calendar"),
  date = document.querySelector(".date"),
  daysContainer = document.querySelector(".days"),
  prev = document.querySelector(".prev"),
  next = document.querySelector(".next"),
  todayBtn = document.querySelector(".today-btn"),
  gotoBtn = document.querySelector(".goto-btn"),
  dateInput = document.querySelector(".data-input"),
  eventDay = document.querySelector(".event-day"),
  eventDate = document.querySelector(".event-date"),
  eventsContainer = document.querySelector(".events"),
  addEventTrigger = document.querySelector(".add-event-trigger"),
  addEventWrapper = document.querySelector(".add-event-wrapper"),
  addEventCloseBtn = document.querySelector(".add-event-wrapper .close"),
  addEventTitle = document.querySelector(".event-name"),
  addEventFrom = document.querySelector(".event-time-from"),
  addEventTo = document.querySelector(".event-time-to"),
  addEventBtn = document.querySelector(".add-event-btn"),
  modalBackdrop = document.querySelector(".modal-backdrop"),
  editEventWrapper = document.querySelector(".edit-event-wrapper"),
  editEventCloseBtn = document.querySelector(".edit-event-wrapper .close"),
  editEventTitle = document.querySelector(".edit-event-name"),
  editEventFrom = document.querySelector(".edit-event-time-from"),
  editEventTo = document.querySelector(".edit-event-time-to"),
  editEventBtn = document.querySelector(".edit-event-btn");

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

const months = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

const weekdays = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
];

const eventsArr = localStorage.getItem("events")
  ? JSON.parse(localStorage.getItem("events"))
  : [];

let currentEditingEventId = null;

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function initCalendar() {
  const firstDay = new Date(year, month, 1); //這個月第一天(注意month是這個月-1)
  const lastDay = new Date(year, month + 1, 0); //這個月最後一天
  const prevLastDay = new Date(year, month, 0); //上個月最後一天
  const prevDays = prevLastDay.getDate(); //上個月最後一天的幾月幾日的幾日
  const lastDate = lastDay.getDate(); // 這個月最後一天的幾月幾日的幾日
  const day = firstDay.getDay(); //這個月第一天的星期幾
  const nextDays = 7 - lastDay.getDay() - 1; //這個月最後一天星期幾，距離35日完結還有多少天(到下個月幾日滿35天)

  date.innerHTML = months[month] + " " + year;
  console.log(date);

  let days = "";

  // prev month days 上個月在這個月多餘的天數
  for (let x = day; x > 0; x--) {
    const prevDayDate = new Date(year, month - 1, prevDays - x + 1);
    const isWeekendDay =
      prevDayDate.getDay() === 0 || prevDayDate.getDay() === 6;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const events = getEventsForDate(prevDays - x + 1, prevYear, prevMonth);

    days += `<div class="day prev-date ${isWeekendDay ? "weekend" : ""}">
      <div>${prevDays - x + 1}</div>
      ${
        events.length > 0
          ? `
        <ul>
          ${events.map((event) => `<li>${event.title}</li>`).join("")}
        </ul>
      `
          : ""
      }
    </div>`;
  }

  // current month days，本月的總天數
  for (let i = 1; i <= lastDate; i++) {
    const currentDayDate = new Date(year, month, i);
    const isWeekendDay =
      currentDayDate.getDay() === 0 || currentDayDate.getDay() === 6;
    const events = getEventsForDate(i);

    // 如果是今天，添加today的css類
    if (
      i === new Date().getDate() &&
      year === new Date().getFullYear() &&
      month === new Date().getMonth()
    ) {
      days += `<div class="day today ${isWeekendDay ? "weekend" : ""}">
        <div>${i}</div>
        ${
          events.length > 0
            ? `
          <ul>
            ${events.map((event) => `<li>${event.title}</li>`).join("")}
          </ul>
        `
            : ""
        }
      </div>`;
    } else {
      days += `<div class="day ${isWeekendDay ? "weekend" : ""}">
        <div>${i}</div>
        ${
          events.length > 0
            ? `
          <ul>
            ${events.map((event) => `<li>${event.title}</li>`).join("")}
          </ul>
        `
            : ""
        }
      </div>`;
    }
  }

  // next month days，下個月在這個月多餘的天數
  for (let j = 1; j <= nextDays; j++) {
    const nextDayDate = new Date(year, month + 1, j);
    const isWeekendDay =
      nextDayDate.getDay() === 0 || nextDayDate.getDay() === 6;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const events = getEventsForDate(j, nextYear, nextMonth);

    days += `<div class="day next-date ${isWeekendDay ? "weekend" : ""}">
      <div>${j}</div>
      ${
        events.length > 0
          ? `
        <ul>
          ${events.map((event) => `<li>${event.title}</li>`).join("")}
        </ul>
      `
          : ""
      }
    </div>`;
  }

  daysContainer.innerHTML = days;
  addDayClickListeners();

  // 初始化顯示當天日期
  if (eventDay && eventDate) {
    eventDay.textContent = weekdays[today.getDay()];
    eventDate.textContent = `${today.getFullYear()}年 ${
      months[today.getMonth()]
    } ${today.getDate()}日`;
  }
}

//function to add month and year on prev and next button
function prevMonth() {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  initCalendar();
}

function nextMonth() {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  initCalendar();
}

// add event_Listener on prev and next
prev.addEventListener("click", prevMonth);
next.addEventListener("click", nextMonth);

initCalendar(); // 初始化日曆

todayBtn.addEventListener("click", () => {
  today = new Date();
  month = today.getMonth();
  year = today.getFullYear();
  initCalendar();
});

//按鈕功能：跳轉到特定日期
async function gotoSpecificDate() {
  const inputValue = dateInput.value;
  if (!inputValue) {
    alert("請輸入日期！");
    return;
  }

  try {
    // 解析輸入的日期
    const selectedDate = new Date(inputValue);
    if (isNaN(selectedDate)) {
      alert("請輸入有效的日期！");
      return;
    }

    // 更新年月
    year = selectedDate.getFullYear();
    month = selectedDate.getMonth();

    // 初始化日曆
    initCalendar();

    // 等待下一個渲染週期
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const days = document.querySelectorAll(".day");
    days.forEach((day) => {
      const dayNumber = Number(day.querySelector("div").textContent);
      if (
        dayNumber === selectedDate.getDate() &&
        !day.classList.contains("prev-date") &&
        !day.classList.contains("next-date")
      ) {
        // 移除之前選中的日期
        const activeDay = document.querySelector(".day.active");
        if (activeDay) {
          activeDay.classList.remove("active");
        }

        // 選中新日期
        day.classList.add("active");

        // 更新右側事件面板
        updateEvents(day);
      }
    });

    // 清空輸入
    dateInput.value = "";
  } catch (error) {
    alert("日期格式錯誤");
  }
}

gotoBtn.addEventListener("click", gotoSpecificDate);

// 添加新函數：添加日期點擊事件
function addDayClickListeners() {
  const days = document.querySelectorAll(".day");
  days.forEach((day) => {
    day.addEventListener("click", (e) => {
      const clickedDay = e.target.closest(".day");
      if (!clickedDay) return;

      // 移除之前選中的日期的active類
      const activeDay = document.querySelector(".day.active");
      if (activeDay) {
        activeDay.classList.remove("active");
      }

      // 為點擊的日期添加active類
      clickedDay.classList.add("active");

      // 根據日期類型計算正確的年月
      let targetMonth = month;
      let targetYear = year;

      if (clickedDay.classList.contains("prev-date")) {
        // 如果是上個月的日期
        if (month === 0) {
          targetMonth = 11;
          targetYear = year - 1;
        } else {
          targetMonth = month - 1;
        }
      } else if (clickedDay.classList.contains("next-date")) {
        // 如果是下個月的日期
        if (month === 11) {
          targetMonth = 0;
          targetYear = year + 1;
        } else {
          targetMonth = month + 1;
        }
      }

      // 更新事件顯示，傳入正確的年月資訊
      updateEvents(clickedDay, targetYear, targetMonth);
    });
  });
}

// 修改updateEvents函数，添加年月参数
function updateEvents(dayElement, targetYear = year, targetMonth = month) {
  if (!dayElement) return;

  const dayNumber = Number(dayElement.querySelector("div").textContent);
  if (isNaN(dayNumber)) return;

  const currentDate = new Date(targetYear, targetMonth, dayNumber);

  if (eventDay && eventDate) {
    eventDay.textContent = weekdays[currentDate.getDay()];
    eventDate.textContent = `${targetYear}年 ${months[targetMonth]} ${dayNumber}日`;
  }

  if (eventsContainer) {
    const dayEvents = getEventsForDate(dayNumber, targetYear, targetMonth);
    if (dayEvents.length > 0) {
      eventsContainer.innerHTML = dayEvents
        .map(
          (event) => `
        <div class="event">
          <div class="title">
            <i class="fas fa-circle"></i>
            <h3 class="event-title">${event.title}</h3>
          </div>
          ${
            event.timeFrom
              ? `
            <div class="event-time">
              ${event.timeFrom} - ${event.timeTo}
            </div>
          `
              : ""
          }
          <div class="event-actions">
            <i class="fas fa-edit edit-event" data-id="${event.id}"></i>
            <i class="fas fa-trash-alt delete-event" data-id="${event.id}"></i>
          </div>
        </div>
      `
        )
        .join("");

      addDeleteEventListeners();
      addEditEventListeners();
    } else {
      eventsContainer.innerHTML = `
        <div class="no-event">
          <h3>暫無代辦事項</h3>
        </div>
      `;
    }
  }
}

// 修改getEventsForDate函數，添加年月參數
function getEventsForDate(date, targetYear = year, targetMonth = month) {
  return eventsArr.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === date &&
      eventDate.getMonth() === targetMonth &&
      eventDate.getFullYear() === targetYear
    );
  });
}

// 修改saveEvent函數
function saveEvent(title, timeFrom, timeTo) {
  const selectedDay = document.querySelector(".day.active");
  if (!selectedDay) {
    alert("請選擇一個日期！");
    return;
  }

  const dayNumber = Number(selectedDay.querySelector("div").textContent);
  let targetMonth = month;
  let targetYear = year;

  // 確定正確的年月信息
  if (selectedDay.classList.contains("prev-date")) {
    if (month === 0) {
      targetMonth = 11;
      targetYear = year - 1;
    } else {
      targetMonth = month - 1;
    }
  } else if (selectedDay.classList.contains("next-date")) {
    if (month === 11) {
      targetMonth = 0;
      targetYear = year + 1;
    } else {
      targetMonth = month + 1;
    }
  }

  // 創建代辦事建物件
  const event = {
    title: title,
    timeFrom: timeFrom,
    timeTo: timeTo,
    date: new Date(targetYear, targetMonth, dayNumber).toISOString(),
    id: Date.now().toString(),
  };

  eventsArr.push(event);
  localStorage.setItem("events", JSON.stringify(eventsArr));

  // 更新UI
  updateEvents(selectedDay, targetYear, targetMonth);
  closeEventForm();

  // 重新初始化日曆以顯示新事項
  initCalendar();
}

// 修改打開表單的功能
addEventTrigger.addEventListener("click", () => {
  addEventWrapper.classList.add("active");
  modalBackdrop.classList.add("active");
});

// 修改關閉表單的功能
function closeEventForm() {
  addEventWrapper.classList.remove("active");
  modalBackdrop.classList.remove("active");
  clearEventForm();
}

// 點擊關閉按鈕
addEventCloseBtn.addEventListener("click", closeEventForm);

// 點擊遮罩層overlay關閉
modalBackdrop.addEventListener("click", () => {
  if (addEventWrapper.classList.contains("active")) {
    closeEventForm();
  }
  if (editEventWrapper.classList.contains("active")) {
    closeEditForm();
  }
});

// 清空表單
function clearEventForm() {
  addEventTitle.value = "";
  addEventFrom.value = "";
  addEventTo.value = "";
}

// 添加保存事件的功能
addEventBtn.addEventListener("click", () => {
  const eventTitle = addEventTitle.value;
  const eventTimeFrom = addEventFrom.value;
  const eventTimeTo = addEventTo.value;

  if (eventTitle === "") {
    alert("請輸入事項名稱！");
    return;
  }

  saveEvent(eventTitle, eventTimeFrom, eventTimeTo);
});

// 添加删除事件的功能
function addDeleteEventListeners() {
  const deleteButtons = document.querySelectorAll(".delete-event");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const eventId = button.dataset.id;
      deleteEvent(eventId);
    });
  });
}

// 删除事件
function deleteEvent(eventId) {
  const index = eventsArr.findIndex((event) => event.id === eventId);
  if (index > -1) {
    eventsArr.splice(index, 1);
    localStorage.setItem("events", JSON.stringify(eventsArr));

    const activeDay = document.querySelector(".day.active");
    if (activeDay) {
      updateEvents(activeDay);
    }

    // 重新初始化日曆以更新顯示
    initCalendar();
  }
}

// 添加編輯事件的功能
function addEditEventListeners() {
  const editButtons = document.querySelectorAll(".edit-event");
  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const eventId = button.dataset.id;
      openEditForm(eventId);
    });
  });
}

// 打開編輯表單
function openEditForm(eventId) {
  const event = eventsArr.find((e) => e.id === eventId);
  if (!event) return;

  currentEditingEventId = eventId;
  editEventTitle.value = event.title;
  editEventFrom.value = event.timeFrom || "";
  editEventTo.value = event.timeTo || "";

  editEventWrapper.classList.add("active");
  modalBackdrop.classList.add("active");
}

// 關閉編輯表單
function closeEditForm() {
  editEventWrapper.classList.remove("active");
  modalBackdrop.classList.remove("active");
  currentEditingEventId = null;
  editEventTitle.value = "";
  editEventFrom.value = "";
  editEventTo.value = "";
}

// 修改saveEditedEvent函數
function saveEditedEvent() {
  if (!currentEditingEventId) return;

  const eventTitle = editEventTitle.value;
  const eventTimeFrom = editEventFrom.value;
  const eventTimeTo = editEventTo.value;

  if (eventTitle === "") {
    alert("請輸入事項名稱！");
    return;
  }

  const eventIndex = eventsArr.findIndex((e) => e.id === currentEditingEventId);
  if (eventIndex === -1) return;

  // 保持原有的日期資訊
  const originalEvent = eventsArr[eventIndex];
  const originalDate = new Date(originalEvent.date);

  //收集所有代辦事項
  eventsArr[eventIndex] = {
    ...eventsArr[eventIndex],
    title: eventTitle,
    timeFrom: eventTimeFrom,
    timeTo: eventTimeTo,
  };

  localStorage.setItem("events", JSON.stringify(eventsArr));

  const activeDay = document.querySelector(".day.active");
  if (activeDay) {
    // 獲取正確的年月資訊
    let targetMonth = month;
    let targetYear = year;

    if (activeDay.classList.contains("prev-date")) {
      if (month === 0) {
        targetMonth = 11;
        targetYear = year - 1;
      } else {
        targetMonth = month - 1;
      }
    } else if (activeDay.classList.contains("next-date")) {
      if (month === 11) {
        targetMonth = 0;
        targetYear = year + 1;
      } else {
        targetMonth = month + 1;
      }
    }

    // 使用正確的年月資訊更新顯示
    updateEvents(activeDay, targetYear, targetMonth);
  }

  // 重新初始化日曆以更新日期表格的顯示
  initCalendar();

  closeEditForm();
}

// 添加事件監聽器
editEventCloseBtn.addEventListener("click", closeEditForm);
editEventBtn.addEventListener("click", saveEditedEvent);

// 修改ESC鍵處理，同時處理兩種表單
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (addEventWrapper.classList.contains("active")) {
      closeEventForm();
    }
    if (editEventWrapper.classList.contains("active")) {
      closeEditForm();
    }
  }
});
