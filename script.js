/******************************************
 * متغيرات اللعبة والإعدادات الأساسية
 ******************************************/
let questions = [];                // سنخزن فيه بيانات الأسئلة من ملف JSON
let currentQuestionIndex = 0;      // مؤشر السؤال الحالي
let usedQuestionsIndices = [];     // لتتبع الأسئلة التي استُخدمت منعاً للتكرار
let currentPrize = 0;             // الجائزة الحالية
let currentLevel = 1;             // مستوى السؤال الحالي

// قائمة الجوائز لـ 15 مستوى (1 -> 15) بالدينار العراقي
// مع افتراض أن السؤال الـ 15 قيمته مليار دينار عراقي
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
  1000000000 // مستوى 15
];

/******************************************
 * عناصر HTML رئيسية
 ******************************************/
// شاشات
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const questionsScreen = document.getElementById('questions-screen');

// أزرار الشاشة الرئيسية
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

// قائمة عرض جميع الأسئلة
const allQuestionsList = document.getElementById('all-questions-list');

/******************************************
 * جلب الأسئلة من ملف JSON
 ******************************************/
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    questions = data;
    populateAllQuestionsList(); // تعبئة قائمة كل الأسئلة في شاشة خاصة
  })
  .catch(error => console.error("خطأ في جلب الأسئلة:", error));


/******************************************
 * دوال تحكم في الشاشات
 ******************************************/
function showScreen(screenElement) {
  // إخفاء جميع الشاشات
  startScreen.classList.remove('active');
  gameScreen.classList.remove('active');
  questionsScreen.classList.remove('active');

  // عرض الشاشة المطلوبة
  screenElement.classList.add('active');
}

/******************************************
 * دالة تعبئة شاشة "عرض جميع الأسئلة"
 ******************************************/
function populateAllQuestionsList() {
  allQuestionsList.innerHTML = "";
  questions.forEach((q, index) => {
    const li = document.createElement('li');
    li.textContent = q.question;
    allQuestionsList.appendChild(li);
  });
}

/******************************************
 * بدء اللعبة
 ******************************************/
function startGame() {
  // تهيئة المتغيرات
  currentQuestionIndex = 0;
  currentLevel = 1;
  currentPrize = 0;
  usedQuestionsIndices = [];
  resultEl.classList.add('hidden');
  
  // تمكين وسائل المساعدة مرة أخرى (إن كانت معطلة)
  enableLifelines();

  // عرض شاشة اللعبة
  showScreen(gameScreen);

  // عرض السؤال الأول
  showQuestion();
}

/******************************************
 * عرض سؤال جديد
 * - يتم اختيار سؤال عشوائي غير مكرر
 ******************************************/
function showQuestion() {
  // تحقق من انتهاء اللعبة (إذا وصلنا 15 سؤالًا أو انتهت الأسئلة)
  if (currentLevel > 15 || usedQuestionsIndices.length === questions.length) {
    endGame(`تهانينا! ربحت ${currentPrize.toLocaleString()} دينار!`);
    return;
  }

  // اختيار سؤال عشوائي غير مكرر
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * questions.length);
  } while (usedQuestionsIndices.includes(randomIndex));

  usedQuestionsIndices.push(randomIndex);
  currentQuestionIndex = randomIndex;

  // تحديث عناصر الصفحة
  const currentQuestion = questions[randomIndex];
  questionNumberEl.textContent = `سؤال المستوى ${currentLevel}`;
  questionEl.textContent = currentQuestion.question;

  // تفريغ الأزرار القديمة
  optionsEl.innerHTML = "";

  // إنشاء أزرار الإجابات
  currentQuestion.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.textContent = optionText;
    btn.addEventListener('click', () => checkAnswer(index));
    optionsEl.appendChild(btn);
  });

  // تحديث المستوى والجائزة
  levelEl.textContent = currentLevel;
  prizeEl.textContent = currentPrize.toLocaleString();
}

/******************************************
 * التحقق من الإجابة
 ******************************************/
function checkAnswer(selectedIndex) {
  const currentQuestion = questions[currentQuestionIndex];
  const correctIndex = currentQuestion.correctAnswerIndex;

  if (selectedIndex === correctIndex) {
    // إجابة صحيحة
    currentPrize = levelsPrizes[currentLevel - 1]; // لأن المستوى يبدأ من 1
    currentLevel++;
    showQuestion();
  } else {
    // إجابة خاطئة
    endGame(`للأسف، إجابة خاطئة. ربحت ${currentPrize.toLocaleString()} دينار.`);
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
 * وسائل المساعدة
 ******************************************/
function enableLifelines() {
  // إعادة تمكين الأزرار
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

  // إخفاء خيارين عشوائيين غير صحيحين
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
 * أحداث أزرار التنقل بين الشاشات
 ******************************************/
startBtn.addEventListener('click', () => {
  startGame();
});

showQuestionsBtn.addEventListener('click', () => {
  showScreen(questionsScreen);
});

backToStartBtn.addEventListener('click', () => {
  showScreen(startScreen);
});
