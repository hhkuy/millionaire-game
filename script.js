/******************************************
 * الإعدادات والمتغيرات العالمية
 ******************************************/
let questions = [];
let currentQuestionIndex = 0;      // يستخدم لحفظ فهرس السؤال الحالي عشوائيًا
let usedQuestionsIndices = [];     // الأسئلة المستعملة (كي لا تتكرر)
let currentPrize = 0;
let currentLevel = 1;

// 15 مستوى، المستوى الأخير = مليار دينار عراقي
const levelsPrizes = [
  1000,
  2000,
  3000,
  5000,
  10000,
  20000,
  40000,
  80000,
  160000,
  320000,
  640000,
  1250000,
  2500000,
  5000000,
  1000000000 // مستوى 16 (يمكن تعديله حسب رغبتك)
];

/******************************************
 * عناصر HTML
 ******************************************/
// شاشات
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const questionsScreen = document.getElementById('questions-screen');

// أزرار وحقول بالشاشة الرئيسية
const startBtn = document.getElementById('start-btn');
const showQuestionsBtn = document.getElementById('show-questions-btn');
const backToStartBtn = document.getElementById('back-to-start');

// عناصر اللعبة
const questionNumberEl = document.getElementById('question-number');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const levelEl = document.getElementById('level');
const prizeEl = document.getElementById('prize');
const resultEl = document.getElementById('result');
const resultMessageEl = document.getElementById('result-message');
const restartButton = document.getElementById('restart-button');

// وسائل المساعدة
const fiftyFiftyBtn = document.getElementById('fifty-fifty');
const phoneFriendBtn = document.getElementById('phone-friend');
const askAudienceBtn = document.getElementById('ask-audience');

// عرض جميع الأسئلة
const allQuestionsList = document.getElementById('all-questions-list');


/******************************************
 * جلب الأسئلة من ملف questions.json
 ******************************************/
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    questions = data;
    populateAllQuestionsList();
  })
  .catch(error => console.error("خطأ في جلب الأسئلة:", error));


/******************************************
 * دوال التنقل بين الشاشات
 ******************************************/
function showScreen(screenElement) {
  startScreen.classList.remove('active');
  gameScreen.classList.remove('active');
  questionsScreen.classList.remove('active');
  
  screenElement.classList.add('active');
}

/******************************************
 * تعبئة شاشة عرض جميع الأسئلة
 ******************************************/
function populateAllQuestionsList() {
  allQuestionsList.innerHTML = "";
  questions.forEach((q) => {
    const li = document.createElement('li');
    li.textContent = q.question;
    allQuestionsList.appendChild(li);
  });
}

/******************************************
 * بدء اللعبة
 ******************************************/
function startGame() {
  // تهيئة القيم الافتراضية
  currentQuestionIndex = 0;
  currentLevel = 1;
  currentPrize = 0;
  usedQuestionsIndices = [];
  resultEl.classList.add('hidden');

  // إعادة تفعيل وسائل المساعدة
  enableLifelines();

  // التوجه لشاشة اللعبة
  showScreen(gameScreen);

  // عرض السؤال الأول
  showQuestion();
}

/******************************************
 * اختيار سؤال عشوائي غير مكرر وعرضه
 ******************************************/
async function showQuestion() {
  // تحقق إذا وصلنا لمستوى أكبر من 15 (أو 16 في حالتك) أو استنفدنا الأسئلة
  if (currentLevel > 15 || usedQuestionsIndices.length === questions.length) {
    endGame(`تهانينا! ربحت ${formatPrize(currentPrize)} دينار!`);
    return;
  }

  // اختر سؤالاً عشوائياً
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * questions.length);
  } while (usedQuestionsIndices.includes(randomIndex));

  usedQuestionsIndices.push(randomIndex);
  currentQuestionIndex = randomIndex;

  // حدّد عناصر السؤال
  const currentQuestion = questions[randomIndex];
  questionNumberEl.textContent = `سؤال المستوى ${currentLevel}`;
  questionEl.textContent = currentQuestion.question;
  
  // تفريغ الأزرار القديمة
  optionsEl.innerHTML = "";

  // في البداية، إنشاء الأزرار بحالة مخفية (option-hidden)
  currentQuestion.options.forEach((optionText, i) => {
    const btn = document.createElement('button');
    btn.classList.add('option-hidden');
    btn.textContent = optionText;
    btn.onclick = () => checkAnswer(i);
    optionsEl.appendChild(btn);
  });

  // حدّث معلومات المستوى والجائزة
  levelEl.textContent = currentLevel;
  prizeEl.textContent = formatPrize(currentPrize);

  // الآن، نستخدم ميزة القراءة الصوتية + إظهار الخيارات بالتتابع
  await readQuestionAndOptions(currentQuestion);
}

/******************************************
 * دالة لتنسيق الأرقام (فواصل للألوف)
 ******************************************/
function formatPrize(value) {
  return value.toLocaleString('en-US');
}

/******************************************
 * قراءة نص باللغة العربية باستخدام Web Speech API
 * تعيد Promise للتسلسل المنطقي
 ******************************************/
function readTextAr(text) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn("متصفحك لا يدعم ميزة speechSynthesis!");
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA'; // أو ar أو أي لهجة أخرى مدعومة
    utterance.onend = () => {
      resolve(); // ينتهي النطق
    };
    speechSynthesis.speak(utterance);
  });
}

/******************************************
 * قراءة السؤال والخيارات بالتسلسل + إظهارها
 ******************************************/
async function readQuestionAndOptions(questionObj) {
  // اقرأ السؤال أولًا
  await readTextAr(questionObj.question);

  // ثم أظهر واقرأ كل خيار بالتتابع
  const optionButtons = optionsEl.querySelectorAll('button');
  for (let i = 0; i < optionButtons.length; i++) {
    // أظهر الزر (بشكل مرئي تدريجي)
    const btn = optionButtons[i];
    btn.classList.remove('option-hidden');
    btn.classList.add('option-visible');

    // انتظر قليلًا قبل البدء بقراءته (إعطاء انطباع الظهور)
    await new Promise(res => setTimeout(res, 300));

    // اقرأ نص الخيار
    await readTextAr(btn.textContent);

    // فاصلة زمنية بين ظهور/قراءة كل خيار
    await new Promise(res => setTimeout(res, 200));
  }
}

/******************************************
 * التحقق من الإجابة
 ******************************************/
function checkAnswer(selectedIndex) {
  const currentQuestion = questions[currentQuestionIndex];
  const correctIndex = currentQuestion.correctAnswerIndex;

  if (selectedIndex === correctIndex) {
    // إجابة صحيحة
    currentPrize = levelsPrizes[currentLevel - 1]; 
    currentLevel++;
    showQuestion();
  } else {
    // إجابة خاطئة
    endGame(`للأسف، إجابة خاطئة. ربحت ${formatPrize(currentPrize)} دينار.`);
  }
}

/******************************************
 * إنهاء اللعبة
 ******************************************/
function endGame(message) {
  resultEl.classList.remove('hidden');
  resultMessageEl.textContent = message;
  questionNumberEl.textContent = "";
  questionEl.textContent = "";
  optionsEl.innerHTML = "";
}

/******************************************
 * إعادة البدء
 ******************************************/
restartButton.addEventListener('click', () => {
  startGame();
});

/******************************************
 * تفعيل/تعطيل وسائل المساعدة
 ******************************************/
function enableLifelines() {
  [fiftyFiftyBtn, phoneFriendBtn, askAudienceBtn].forEach(btn => {
    btn.disabled = false;
    btn.style.visibility = 'visible';
  });
}

// 50:50
fiftyFiftyBtn.addEventListener('click', () => {
  const currentQuestion = questions[currentQuestionIndex];
  const correctIndex = currentQuestion.correctAnswerIndex;
  const buttons = optionsEl.querySelectorAll('button');

  let hiddenCount = 0;
  for (let i = 0; i < buttons.length; i++) {
    if (i !== correctIndex && hiddenCount < 2) {
      buttons[i].style.visibility = 'hidden';
      hiddenCount++;
    }
  }
  fiftyFiftyBtn.disabled = true;
});

// اتصال بصديق
phoneFriendBtn.addEventListener('click', () => {
  const currentQuestion = questions[currentQuestionIndex];
  const correctIndex = currentQuestion.correctAnswerIndex;
  const correctOption = currentQuestion.options[correctIndex];
  alert(`صديقك يعتقد أن الإجابة الصحيحة هي: "${correctOption}"`);
  phoneFriendBtn.disabled = true;
});

// استشارة الجمهور
askAudienceBtn.addEventListener('click', () => {
  const currentQuestion = questions[currentQuestionIndex];
  const correctIndex = currentQuestion.correctAnswerIndex;
  const correctOption = currentQuestion.options[correctIndex];
  alert(`الجمهور يصوت بنسبة عالية للخيار: "${correctOption}"`);
  askAudienceBtn.disabled = true;
});

/******************************************
 * أزرار التنقل (الشاشة الرئيسية)
 ******************************************/
startBtn.addEventListener('click', () => {
  // بعض المتصفحات تمنع التشغيل الصوتي إلا بعد تفاعل المستخدم
  // هذا الحدث (click) يوفر التفاعل المطلوب، فيسمح ببدء القراءة الصوتية
  startGame();
});

showQuestionsBtn.addEventListener('click', () => {
  showScreen(questionsScreen);
});

backToStartBtn.addEventListener('click', () => {
  showScreen(startScreen);
});
