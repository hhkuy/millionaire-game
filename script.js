let questions = [];
let currentQuestionIndex = 0;
let currentPrize = 0;
let currentLevel = 1;
const levelsPrizes = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];

// عناصر HTML
const questionNumberEl = document.getElementById('question-number');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const levelEl = document.getElementById('level');
const prizeEl = document.getElementById('prize');
const resultEl = document.getElementById('result');
const resultMessageEl = document.getElementById('result-message');
const restartButton = document.getElementById('restart-button');

const fiftyFiftyBtn = document.getElementById('fifty-fifty');
const phoneFriendBtn = document.getElementById('phone-friend');
const askAudienceBtn = document.getElementById('ask-audience');

// جلب الأسئلة من الملف questions.json
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    questions = data;
    // بدء اللعبة بعد جلب الأسئلة
    startGame();
  })
  .catch(error => {
    console.error("خطأ في جلب الأسئلة:", error);
  });

function startGame() {
  currentQuestionIndex = 0;
  currentPrize = 0;
  currentLevel = 1;
  resultEl.classList.add('hidden');
  showQuestion();
}

// عرض السؤال الحالي
function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    // لا توجد أسئلة أخرى، اللاعب فاز أو أنتهت الأسئلة
    endGame("تهانينا! ربحت " + currentPrize + " ريال!");
    return;
  }
  
  let currentQuestion = questions[currentQuestionIndex];
  
  questionNumberEl.textContent = "سؤال رقم: " + (currentQuestionIndex + 1);
  questionEl.textContent = currentQuestion.question;
  
  // تفريغ الخيارات القديمة
  optionsEl.innerHTML = "";
  
  // إنشاء أزرار الخيارات
  currentQuestion.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.textContent = optionText;
    btn.addEventListener('click', () => checkAnswer(index));
    optionsEl.appendChild(btn);
  });
  
  // عرض المستوى والجائزة الحالية
  levelEl.textContent = currentLevel;
  prizeEl.textContent = currentPrize;
}

// التحقق من الإجابة
function checkAnswer(selectedIndex) {
  const correctIndex = questions[currentQuestionIndex].correctAnswerIndex;
  
  if (selectedIndex === correctIndex) {
    // إجابة صحيحة
    currentPrize = levelsPrizes[currentQuestionIndex];
    currentLevel++;
    currentQuestionIndex++;
    showQuestion();
  } else {
    // إجابة خاطئة
    endGame("للأسف، إجابة خاطئة. ربحت " + currentPrize + " ريال.");
  }
}

// إنهاء اللعبة
function endGame(message) {
  resultEl.classList.remove('hidden');
  resultMessageEl.textContent = message;
  questionNumberEl.textContent = "";
  questionEl.textContent = "";
  optionsEl.innerHTML = "";
}

// إعادة البدء
restartButton.addEventListener('click', () => {
  startGame();
});

// تعامل مع وسائل المساعدة (50:50)
fiftyFiftyBtn.addEventListener('click', () => {
  // مثال بسيط: إخفاء خيارين عشوائيين غير صحيحين
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
  // تعطيل الزر بعد الاستخدام
  fiftyFiftyBtn.disabled = true;
});

// تعامل مع اتصال بصديق
phoneFriendBtn.addEventListener('click', () => {
  alert("تواصلت مع صديقك ويعتقد أن الإجابة هي: " + questions[currentQuestionIndex].options[questions[currentQuestionIndex].correctAnswerIndex]);
  phoneFriendBtn.disabled = true;
});

// تعامل مع استشارة الجمهور
askAudienceBtn.addEventListener('click', () => {
  alert("صوت الجمهور يتجه نحو الخيار: " + questions[currentQuestionIndex].options[questions[currentQuestionIndex].correctAnswerIndex]);
  askAudienceBtn.disabled = true;
});
