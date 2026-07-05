const realmData = {
  life: {
    name: "赫丝塔·炉心",
    tone: "借鉴炉火与丰饶女神气质的生活教母，先替你安顿身体、空间与情绪。",
    archetype: "炉火与丰饶原型",
    portrait: "./assets/hestia-hearth-godmother.svg",
    alt: "赫丝塔·炉心，栗金长发的生活教母",
    traits: ["栗金长发", "绿金眼睛", "橄榄金麦长袍"],
    compass: "先让生活恢复流动，再让目标自然落地。",
    color: "#f4cd73",
    defaults: {
      goal: "我想把生活状态调整回来，让作息、空间和情绪都更稳定。",
      friction: "我感觉事情很多，容易逃避，也不知道先整理哪一块。"
    },
    frame: {
      wish: "你真正想要的不是完成更多，而是重新拥有一种可持续的生活秩序。",
      path: ["先恢复身体节律", "再清理环境阻力", "最后安排一个能坚持的小习惯"],
      action: ["喝一杯水并打开窗", "清掉眼前 10 件杂物", "写下今晚最晚入睡时间"]
    }
  },
  study: {
    name: "弥涅尔瓦·星卷",
    tone: "借鉴智慧女神气质的学习教母，把知识拆成理解、练习和反馈的小环。",
    archetype: "智慧与星卷原型",
    portrait: "./assets/minerva-starpage-godmother.svg",
    alt: "弥涅尔瓦·星卷，银蓝短发的学习教母",
    traits: ["银蓝短发", "星冠", "展开的星卷"],
    compass: "学习不是逼自己坐更久，而是让理解、练习和反馈循环起来。",
    color: "#89b8ff",
    defaults: {
      goal: "我想系统学完一个知识点，并且真的能用出来。",
      friction: "资料太多，看完容易忘，也不知道练什么。"
    },
    frame: {
      wish: "你要的不是堆时长，而是把陌生知识变成可调用的能力。",
      path: ["先限定一个最小知识块", "用自己的话复述", "马上做一个低难度练习"],
      action: ["选定一个章节或概念", "写 5 句自己的解释", "做一道例题或造一个案例"]
    }
  },
  work: {
    name: "赫尔弥娅·银翼",
    tone: "借鉴信使与策略神气质的工作教母，把压力翻译成交付、沟通与推进路径。",
    archetype: "信使与策略原型",
    portrait: "./assets/hermia-silverwing-godmother.svg",
    alt: "赫尔弥娅·银翼，黑银短发的工作教母",
    traits: ["黑银短发", "银翼肩甲", "信使权杖"],
    compass: "工作指导先看交付对象，再看关键风险，最后压缩到下一次可见进展。",
    color: "#74e4c0",
    defaults: {
      goal: "我想推进一个重要工作任务，并在今天看到实质进展。",
      friction: "任务边界不清，担心做偏，也有些不想开始。"
    },
    frame: {
      wish: "你真正需要的是可见进展，而不是在脑中反复背负整个项目。",
      path: ["明确交付对象", "列出当前未知项", "做一个能被别人看见的版本"],
      action: ["写下这件事交给谁看", "列 3 个必须确认的问题", "产出一个粗糙草稿或提纲"]
    }
  }
};

const modeData = {
  gentle: {
    label: "温柔",
    rhythm: "安顿 → 推进 → 复盘",
    voice: "我会把你的压力先接住，再轻轻推你一步。"
  },
  clear: {
    label: "清晰",
    rhythm: "澄清 → 拆解 → 执行",
    voice: "我会直接指出卡点，并帮你把下一步定清楚。"
  },
  bold: {
    label: "推进",
    rhythm: "定界 → 行动 → 交付",
    voice: "我们不再和混乱谈判，今天先拿到一个可见结果。"
  }
};

let activeRealm = "life";
let activeMode = "gentle";
let timerSeconds = 15 * 60;
let timerTotal = timerSeconds;
let timerId = null;
let currentPlan = null;
let realmDrafts = loadDrafts();
let archiveEntries = loadArchive();
let chatEntries = loadChat();
let profileData = loadProfile();
let ritualState = loadRitualState();
let taskState = loadTaskState();

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

const goalInput = qs("#goalInput");
const frictionInput = qs("#frictionInput");
const timeInput = qs("#timeInput");
const energyInput = qs("#energyInput");
const messageBubble = qs("#messageBubble");
const planCards = qs("#planCards");
const focusPrompt = qs("#focusPrompt");
const timerText = qs("#timerText");
const timerRing = qs("#timerRing");
const characterPortrait = qs("#characterPortrait");
const chatLog = qs("#chatLog");
const chatInput = qs("#chatInput");
const stageInput = qs("#stageInput");
const pressureInput = qs("#pressureInput");
const rhythmInput = qs("#rhythmInput");
const supportInput = qs("#supportInput");
const identityInput = qs("#identityInput");
const taskNoteInput = qs("#taskNoteInput");

function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function loadDrafts() {
  try {
    const saved = JSON.parse(localStorage.getItem("fairy-godmother-drafts") || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function saveDrafts() {
  try {
    localStorage.setItem("fairy-godmother-drafts", JSON.stringify(realmDrafts));
  } catch {
    // Local storage may be unavailable.
  }
}

function loadArchive() {
  try {
    const saved = JSON.parse(localStorage.getItem("fairy-godmother-archive") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveArchive() {
  try {
    localStorage.setItem("fairy-godmother-archive", JSON.stringify(archiveEntries));
  } catch {
    // Local storage may be unavailable.
  }
}

function loadChat() {
  try {
    const saved = JSON.parse(localStorage.getItem("fairy-godmother-chat") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveChat() {
  try {
    localStorage.setItem("fairy-godmother-chat", JSON.stringify(chatEntries));
  } catch {
    // Local storage may be unavailable.
  }
}

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem("fairy-godmother-profile") || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function saveProfile() {
  try {
    localStorage.setItem("fairy-godmother-profile", JSON.stringify(profileData));
  } catch {
    // Local storage may be unavailable.
  }
}

function loadRitualState() {
  const fallback = { date: getTodayKey(), steps: { morning: false, action: false, night: false } };
  try {
    const saved = JSON.parse(localStorage.getItem("fairy-godmother-ritual") || "null");
    if (!saved || saved.date !== fallback.date) return fallback;
    return { ...fallback, ...saved, steps: { ...fallback.steps, ...saved.steps } };
  } catch {
    return fallback;
  }
}

function saveRitualState() {
  try {
    localStorage.setItem("fairy-godmother-ritual", JSON.stringify(ritualState));
  } catch {
    // Local storage may be unavailable.
  }
}

function loadTaskState() {
  const fallback = { date: getTodayKey(), realms: {} };
  try {
    const saved = JSON.parse(localStorage.getItem("fairy-godmother-tasks") || "null");
    if (!saved || saved.date !== fallback.date) return fallback;
    return { ...fallback, ...saved, realms: saved.realms || {} };
  } catch {
    return fallback;
  }
}

function saveTaskState() {
  try {
    localStorage.setItem("fairy-godmother-tasks", JSON.stringify(taskState));
  } catch {
    // Local storage may be unavailable.
  }
}

function saveActiveDraft(extra = {}) {
  realmDrafts[activeRealm] = {
    goal: goalInput.value.trim(),
    friction: frictionInput.value.trim(),
    mode: activeMode,
    reflection: realmDrafts[activeRealm]?.reflection || "",
    ...extra
  };
  saveDrafts();
  renderRealmStatus();
}

function setRealm(realm) {
  const hasCurrentDraft = goalInput.value.trim() || frictionInput.value.trim();
  if (activeRealm !== realm || hasCurrentDraft) {
    saveActiveDraft();
  }
  activeRealm = realm;
  const data = realmData[realm];
  const draft = realmDrafts[realm] || {};
  document.documentElement.style.setProperty("--gold", data.color);
  qs("#realmCompass").textContent = data.compass;
  qs("#godmotherName").textContent = data.name;
  qs("#godmotherTone").textContent = data.tone;
  qs("#characterArchetype").textContent = data.archetype;
  characterPortrait.src = data.portrait;
  characterPortrait.alt = data.alt;
  qs("#characterTraits").innerHTML = data.traits.map((trait) => `<span>${trait}</span>`).join("");
  qsa(".realm-tab").forEach((button) => button.classList.toggle("is-active", button.dataset.realm === realm));
  goalInput.value = draft.goal || data.defaults.goal;
  frictionInput.value = draft.friction || data.defaults.friction;
  setMode(draft.mode || activeMode);
  renderStarterPlan();
}

function setMode(mode) {
  activeMode = mode;
  qsa(".mode-toggle").forEach((button) => button.classList.toggle("is-active", button.dataset.mode === mode));
  qs("#coachRhythm").textContent = modeData[mode].rhythm;
}

function detectFriction(text) {
  const value = text.toLowerCase();
  if (/拖延|不想|逃避|开始|procrastinat/.test(value)) return { type: "启动阻力", scale: "2 分钟开场动作" };
  if (/太多|混乱|不知道|复杂|资料/.test(value)) return { type: "复杂度过载", scale: "三步排序" };
  if (/怕|担心|焦虑|失败|做偏/.test(value)) return { type: "风险焦虑", scale: "低风险草稿" };
  if (/累|困|没精力|疲惫|burnout/.test(value)) return { type: "能量不足", scale: "恢复型微行动" };
  return { type: "目标模糊", scale: "澄清式下一步" };
}

function getEnergyName(value) {
  return ["", "很低", "偏低", "中等", "不错", "很满"][Number(value)] || "中等";
}

function getProfileSummary() {
  const parts = [];
  if (profileData.stage) parts.push(profileData.stage);
  if (profileData.pressure) parts.push(`压力源：${profileData.pressure}`);
  if (profileData.rhythm) parts.push(`高能时段：${profileData.rhythm}`);
  if (profileData.identity) parts.push(`正在成为：${profileData.identity}`);
  return parts.join("；");
}

function renderProfile() {
  stageInput.value = profileData.stage || "探索期";
  pressureInput.value = profileData.pressure || "";
  rhythmInput.value = profileData.rhythm || "早晨";
  supportInput.value = profileData.support || "温柔";
  identityInput.value = profileData.identity || "";
  const summary = getProfileSummary();
  qs("#profileSnapshot").textContent = summary || "还没有画像。先让教母认识你一点点。";
  qs("#profileInsight").textContent = summary
    ? `教母会按「${profileData.support || "温柔"}」支持你，并优先照顾「${profileData.pressure || "当前压力"}」。`
    : "画像会影响教母的语气、拆解尺度和每日提醒。";
}

function saveProfileFromInputs() {
  profileData = {
    stage: stageInput.value,
    pressure: pressureInput.value.trim(),
    rhythm: rhythmInput.value,
    support: supportInput.value,
    identity: identityInput.value.trim()
  };
  saveProfile();
  renderProfile();
  renderStarterPlan();
  renderGrowthBook();
  addChat("coach", `我记住了。你现在处在「${profileData.stage}」，更需要「${profileData.support}」式支持。以后我会把建议调到更贴近你的节奏。`);
}

function buildPlan({ goal, friction, minutes, energy }) {
  const realm = realmData[activeRealm];
  const mode = modeData[activeMode];
  const detected = detectFriction(friction);
  const timeBox = Number(minutes);
  const firstAction = timeBox <= 15 ? realm.frame.action[0] : realm.frame.action[1];
  const finishAction = timeBox >= 60 ? realm.frame.action[2] : "在结束前写下下一次继续的位置";

  const spell = [
    `我听见你的愿望了：${goal}`,
    profileData.identity ? `我也会记得你正在成为「${profileData.identity}」。` : "",
    `${mode.voice} 现在的卡点更像是「${detected.type}」，所以我们不把任务变大，只把入口变清楚。`,
    `以你现在「${getEnergyName(energy)}」的能量，今天只需要完成一个 ${detected.scale}。`
  ].filter(Boolean).join(" ");

  const actions = [firstAction, `专注 ${Math.min(timeBox, 25)} 分钟`, finishAction];

  return {
    detected,
    spell,
    actions,
    cards: [
      {
        kicker: "愿望层",
        title: "你要抵达的状态",
        body: realm.frame.wish,
        points: [goal.slice(0, 46) + (goal.length > 46 ? "..." : ""), `今日只承诺 ${minutes} 分钟`, `模式：${mode.label}`]
      },
      {
        kicker: "路径层",
        title: "先拆掉最大阻力",
        body: `这一步模仿 PlanCoach 的底层逻辑：不直接催你努力，而是先定位为什么动不了。`,
        points: [detected.type, ...realm.frame.path]
      },
      {
        kicker: "行动层",
        title: "现在就能开始",
        body: "第一步要小到不会触发抗拒，同时具体到可以立刻执行。",
        points: actions
      }
    ],
    focus: `第一步：${firstAction}。计时开始后，只做这一件事；如果心散了，就回到这个动作。`
  };
}

function renderPlan(plan) {
  currentPlan = plan;
  messageBubble.innerHTML = `<p>${plan.spell}</p>`;
  qs("#frictionType").textContent = plan.detected.type;
  qs("#actionScale").textContent = plan.detected.scale;
  qs("#coachRhythm").textContent = modeData[activeMode].rhythm;
  focusPrompt.textContent = plan.focus;
  planCards.innerHTML = plan.cards.map((card) => `
    <article class="ritual-card">
      <span class="card-kicker">${card.kicker}</span>
      <h3>${card.title}</h3>
      <p>${card.body}</p>
      <ul class="ritual-list">
        ${card.points.map((point) => `<li>${point}</li>`).join("")}
      </ul>
    </article>
  `).join("");
  renderRitualLoop();
  renderTaskChecklist(plan);
  renderGrowthBook();
}

function renderRealmStatus() {
  const labels = { life: "生活", study: "学习", work: "工作" };
  qs("#realmStatusList").innerHTML = Object.entries(labels).map(([key, label]) => {
    const draft = realmDrafts[key] || {};
    const summary = draft.reflection || draft.goal || "还没有许愿，先点亮这个领域。";
    const count = archiveEntries.filter((entry) => entry.realm === key).length;
    return `
      <li class="realm-status-item">
        <strong>${label} · 已封存 ${count} 次</strong>
        <span>${summary.slice(0, 40)}${summary.length > 40 ? "..." : ""}</span>
      </li>
    `;
  }).join("");
}

function renderArchive() {
  const labels = { life: "生活", study: "学习", work: "工作" };
  const list = archiveEntries.slice(0, 5);
  qs("#archiveList").innerHTML = list.length ? list.map((entry) => `
    <li class="archive-item">
      <strong>${labels[entry.realm]} · ${entry.date}</strong>
      <span>${entry.done}</span>
      <span>${entry.tomorrow}</span>
    </li>
  `).join("") : `<li class="archive-item"><strong>还没有封存记录</strong><span>完成第一次专注后，这里会留下教母替你记住的成长轨迹。</span></li>`;
}

function renderRitualLoop() {
  const goal = goalInput.value.trim() || realmData[activeRealm].defaults.goal;
  const firstAction = currentPlan?.actions?.[0] || "先完成一个小到不会抗拒的动作。";
  qs("#morningWishText").textContent = `今日愿望：${goal.slice(0, 34)}${goal.length > 34 ? "..." : ""}`;
  qs("#actionCompanionText").textContent = `行动入口：${firstAction}`;
  qs("#nightReviewText").textContent = archiveEntries[0]
    ? `最近封存：${archiveEntries[0].done.slice(0, 28)}${archiveEntries[0].done.length > 28 ? "..." : ""}`
    : "封存今天，而不是苛责今天。";
  qsa(".ritual-step").forEach((step) => {
    const key = step.dataset.step;
    const done = Boolean(ritualState.steps[key]);
    step.classList.toggle("is-complete", done);
    step.querySelector(".ritual-button").textContent = done ? "已点亮" : "点亮";
  });
}

function completeRitualStep(key) {
  ritualState.steps[key] = true;
  saveRitualState();
  renderRitualLoop();
  renderGrowthBook();
  const messages = {
    morning: "晨间许愿已点亮。今天只要先守住最重要的一件事。",
    action: "行动陪伴已点亮。现在你不是在等待状态，你已经进入路上了。",
    night: "夜间复盘已点亮。请把今天保存下来，不要用苛责把它擦掉。"
  };
  addChat("coach", messages[key]);
}

function getRealmTaskState() {
  if (taskState.date !== getTodayKey()) {
    taskState = { date: getTodayKey(), realms: {} };
  }
  if (!taskState.realms[activeRealm]) {
    taskState.realms[activeRealm] = { items: [], note: "" };
  }
  return taskState.realms[activeRealm];
}

function renderTaskChecklist(plan = currentPlan) {
  const realmTasks = getRealmTaskState();
  const actions = plan?.actions?.length ? plan.actions : ["先生成今日指导"];
  const saved = new Map(realmTasks.items.map((item) => [item.text, item.done]));
  realmTasks.items = actions.map((text) => ({ text, done: Boolean(saved.get(text)) }));
  taskNoteInput.value = realmTasks.note || "";
  saveTaskState();
  qs("#taskChecklist").innerHTML = realmTasks.items.map((item, index) => `
    <label class="task-item ${item.done ? "is-done" : ""}">
      <input type="checkbox" data-task-index="${index}" ${item.done ? "checked" : ""}>
      <span>${item.text}</span>
    </label>
  `).join("");
  qsa("[data-task-index]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const item = realmTasks.items[Number(checkbox.dataset.taskIndex)];
      item.done = checkbox.checked;
      saveTaskState();
      renderTaskStatus();
      renderGrowthBook();
      checkbox.closest(".task-item").classList.toggle("is-done", checkbox.checked);
    });
  });
  renderTaskStatus();
}

function renderTaskStatus() {
  const realmTasks = getRealmTaskState();
  const done = realmTasks.items.filter((item) => item.done).length;
  const total = realmTasks.items.length || 1;
  qs("#taskStatus").textContent = `今日推进：${done}/${total}。${realmTasks.note ? `卡点：${realmTasks.note}` : "记录一个卡点，明天就不用从零开始。"}`;
}

function saveTaskNote() {
  const realmTasks = getRealmTaskState();
  realmTasks.note = taskNoteInput.value.trim();
  saveTaskState();
  renderTaskStatus();
  renderGrowthBook();
  if (realmTasks.note) {
    addChat("coach", `我记下这个卡点了：「${realmTasks.note}」。下一次我们先从这里拆，不让它继续变成雾。`);
  }
}

function renderGrowthBook() {
  const labels = { life: "生活", study: "学习", work: "工作" };
  qs("#growthGrid").innerHTML = Object.entries(labels).map(([key, label]) => {
    const archived = archiveEntries.filter((entry) => entry.realm === key).length;
    const draft = realmDrafts[key] || {};
    const todays = taskState.realms[key]?.items || [];
    const done = todays.filter((item) => item.done).length;
    const total = todays.length || 0;
    const percent = Math.min(100, archived * 22 + done * 18 + (draft.goal ? 12 : 0));
    return `
      <article class="growth-card">
        <strong>${label}</strong>
        <div class="growth-meter" aria-label="${label}成长进度"><span style="--meter:${percent}%"></span></div>
        <p>封存 ${archived} 次 · 今日完成 ${done}/${total || 0}</p>
      </article>
    `;
  }).join("");
  const frictions = Object.values(realmDrafts).map((draft) => detectFriction(draft.friction || "").type);
  const counts = frictions.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  qs("#frictionPattern").textContent = top
    ? `最近最常出现的是「${top[0]}」。当前教母会优先把入口变小、把风险降下来。`
    : "还没有足够记录。先完成一次今日闭环。";
  const profile = getProfileSummary() || "尚未填写画像";
  const goal = goalInput.value.trim() || realmData[activeRealm].defaults.goal;
  qs("#coachContextDigest").textContent = `画像：${profile}。当前领域：${activeRealm}。当前目标：${goal}。最近记录：${archiveEntries[0]?.done || "暂无封存"}。`;
}

function getStreakCount() {
  const dates = [...new Set(archiveEntries.map((entry) => entry.date))].sort().reverse();
  if (!dates.length) return 0;
  let streak = 0;
  const cursor = new Date();
  for (const date of dates) {
    const expected = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (date !== expected) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderDailyTrack() {
  const count = getStreakCount();
  qs("#streakCount").textContent = count;
  const latest = archiveEntries[0];
  qs("#dailyTrackText").textContent = latest
    ? `最近一次：${latest.date}，${latest.done.slice(0, 24)}${latest.done.length > 24 ? "..." : ""}`
    : "完成一次复盘后，教母会开始替你记录节奏。";
}

function getCoachReply(message) {
  const data = realmData[activeRealm];
  const friction = detectFriction(`${frictionInput.value} ${message}`);
  const goal = goalInput.value.trim() || data.defaults.goal;
  const minutes = Math.min(Number(timeInput.value), 25);
  const archiveHint = archiveEntries.find((entry) => entry.realm === activeRealm);
  const prior = archiveHint ? `我还记得你上次封存过：「${archiveHint.done}」。` : "这是我们在这个领域的新一轮开始。";
  const profileHint = profileData.pressure ? `我也会留意你的主要压力源是「${profileData.pressure}」。` : "";

  if (/不想|拖|逃避|开始/.test(message)) {
    return `${prior}${profileHint} 现在不要靠意志硬推。把「${goal}」缩到一个开场动作：只做 2 分钟，打开相关材料、写下标题，或清出桌面的一小块。开始之后再决定要不要继续。`;
  }

  if (/焦虑|怕|担心|失败|做不好/.test(message)) {
    return `${prior} 你的焦虑在提醒你这里有风险，不是在证明你不行。先做一个低风险版本：允许粗糙，允许只给自己看，目标是在 ${minutes} 分钟内得到一个可修改的草稿。`;
  }

  if (/具体|下一步|怎么做|拆/.test(message)) {
    return `我把下一步落到地上：第一，写下此刻最小目标；第二，设置 ${minutes} 分钟；第三，只完成一个可见动作。今天识别到的阻力是「${friction.type}」，所以动作必须小、清楚、可结束。`;
  }

  if (/累|困|没精力|疲惫/.test(message)) {
    return `先别把低能量误读成失败。现在选恢复型推进：喝水、站起来伸展 30 秒，然后做一个不用判断的动作。今天只要求保住节奏，不要求漂亮。`;
  }

  return `${prior}${profileHint} 我听见你说：「${message}」。围绕「${goal}」，我建议先处理「${friction.type}」：把目标压缩成一个 ${friction.scale}，用 ${minutes} 分钟证明这件事可以被启动，而不是一次性完成全部。`;
}

function renderChat() {
  const intro = {
    role: "coach",
    realm: activeRealm,
    text: "我在。你可以把犹豫、焦虑或下一步说给我，我会按你当前的领域和目标继续拆。"
  };
  const realmEntries = chatEntries.filter((entry) => entry.realm === activeRealm);
  const entries = realmEntries.length ? realmEntries : [intro];
  chatLog.innerHTML = entries.slice(-10).map((entry) => `
    <div class="chat-message ${entry.role}">
      <strong>${entry.role === "coach" ? realmData[entry.realm || activeRealm].name : "你"}</strong>
      <span>${entry.text}</span>
    </div>
  `).join("");
  chatLog.scrollTop = chatLog.scrollHeight;
}

function addChat(role, text) {
  chatEntries = [...chatEntries, { role, text, realm: activeRealm }].slice(-24);
  saveChat();
  renderChat();
}

function handleChatMessage(text) {
  const message = text.trim();
  if (!message) return;
  addChat("user", message);
  addChat("coach", getCoachReply(message));
  chatInput.value = "";
}

function speakText(text) {
  if (!("speechSynthesis" in window)) {
    focusPrompt.textContent = "这个浏览器暂时不支持朗读，但我已经把回应留在对话间里。";
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.92;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
}

function renderStarterPlan() {
  const data = realmData[activeRealm];
  const plan = buildPlan({
    goal: goalInput.value.trim() || data.defaults.goal,
    friction: frictionInput.value.trim() || data.defaults.friction,
    minutes: timeInput.value,
    energy: energyInput.value
  });
  renderPlan(plan);
  saveActiveDraft();
}

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function setTimerFromMinutes(minutes) {
  timerTotal = Math.min(Number(minutes), 25) * 60;
  timerSeconds = timerTotal;
  updateTimer();
}

function updateTimer() {
  timerText.textContent = formatTimer(timerSeconds);
  const progress = (timerSeconds / timerTotal) * 360;
  timerRing.style.setProperty("--progress", `${progress}deg`);
}

function startTimer() {
  if (timerSeconds <= 0) {
    timerSeconds = timerTotal;
    updateTimer();
  }
  if (timerId) return;
  qs("#startTimer").textContent = "进行中";
  timerId = window.setInterval(() => {
    timerSeconds -= 1;
    if (timerSeconds <= 0) {
      timerSeconds = 0;
      window.clearInterval(timerId);
      timerId = null;
      qs("#startTimer").textContent = "再来一次";
      focusPrompt.textContent = "很好，魔法不是突然降临的，是你刚才亲手推进的。现在写下完成了什么。";
    }
    updateTimer();
  }, 1000);
}

function resetTimer() {
  window.clearInterval(timerId);
  timerId = null;
  qs("#startTimer").textContent = "开始";
  timerSeconds = timerTotal;
  updateTimer();
  if (currentPlan) {
    focusPrompt.textContent = currentPlan.focus;
  }
}

function setupSparkCanvas() {
  const canvas = qs("#sparkCanvas");
  const ctx = canvas.getContext("2d");
  const sparks = Array.from({ length: 88 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.7 + Math.random() * 2.3,
    speed: 0.0005 + Math.random() * 0.0018,
    phase: Math.random() * Math.PI * 2
  }));

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
  }

  function draw(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparks.forEach((spark) => {
      spark.y -= spark.speed;
      if (spark.y < -0.05) spark.y = 1.05;
      const x = spark.x * canvas.width + Math.sin(time * 0.0007 + spark.phase) * 18;
      const y = spark.y * canvas.height;
      const glow = 0.32 + Math.sin(time * 0.003 + spark.phase) * 0.22;
      ctx.beginPath();
      ctx.fillStyle = `rgba(244, 205, 115, ${Math.max(0.14, glow)})`;
      ctx.arc(x, y, spark.r * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
}

qsa(".realm-tab").forEach((button) => {
  button.addEventListener("click", () => {
    setRealm(button.dataset.realm);
    renderChat();
    renderTaskChecklist();
    renderGrowthBook();
  });
});

qsa(".mode-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
    renderStarterPlan();
  });
});

qs("#coachForm").addEventListener("submit", (event) => {
  event.preventDefault();
  renderStarterPlan();
  setTimerFromMinutes(timeInput.value);
  addChat("coach", `我已经按「${goalInput.value.trim()}」重新排好了今日路径。先照着行动层走，不需要一次证明全部。`);
});

timeInput.addEventListener("change", () => {
  setTimerFromMinutes(timeInput.value);
  renderStarterPlan();
});

energyInput.addEventListener("input", renderStarterPlan);
goalInput.addEventListener("input", saveActiveDraft);
frictionInput.addEventListener("input", saveActiveDraft);
qs("#startTimer").addEventListener("click", startTimer);
qs("#resetTimer").addEventListener("click", resetTimer);
qs("#saveProfile").addEventListener("click", saveProfileFromInputs);
qs("#saveTaskNote").addEventListener("click", saveTaskNote);

qsa(".ritual-button").forEach((button) => {
  button.addEventListener("click", () => completeRitualStep(button.dataset.ritual));
});

qsa(".quick-prompts button").forEach((button) => {
  button.addEventListener("click", () => handleChatMessage(button.dataset.prompt));
});

qs("#chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  handleChatMessage(chatInput.value);
});

qs("#speakLast").addEventListener("click", () => {
  const lastCoach = [...chatEntries].reverse().find((entry) => entry.role === "coach" && entry.realm === activeRealm);
  speakText(lastCoach?.text || focusPrompt.textContent);
});

qs("#sealReflection").addEventListener("click", () => {
  const done = qs("#doneInput").value.trim() || "你已经完成了一个真实的小动作";
  const tomorrow = qs("#tomorrowInput").value.trim() || "明天继续从最小一步开始";
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const reflection = `${done}；${tomorrow}`;
  archiveEntries = [
    { realm: activeRealm, done, tomorrow, date },
    ...archiveEntries
  ].slice(0, 12);
  saveArchive();
  saveActiveDraft({ reflection });
  renderArchive();
  renderDailyTrack();
  renderRitualLoop();
  renderGrowthBook();
  addChat("coach", `我已经替你封存了今天：${done}。明天我们保留「${tomorrow}」，不要从零开始。`);
  qs("#reflectionResult").textContent = `已封存：${done}。明日魔法：${tomorrow}。教母提醒你，稳定不是靠一次爆发，而是靠一次次回来。`;
});

renderProfile();
setRealm("life");
setTimerFromMinutes(timeInput.value);
renderRealmStatus();
renderArchive();
renderDailyTrack();
renderChat();
renderRitualLoop();
renderTaskChecklist();
renderGrowthBook();
setupSparkCanvas();
