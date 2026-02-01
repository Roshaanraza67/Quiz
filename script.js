document.addEventListener('DOMContentLoaded', () => {

const SUBJECT_TO_CATEGORY_ID = { HTML:18, CSS:18, JavaScript:18 };
const LEVEL_SETTINGS = { easy:120, medium:90, hard:60 };

const screens = document.querySelectorAll('.screen');
const loader = document.getElementById('loader-overlay');
const quizTimerBox = document.querySelector('.quiz-timer');

let questions=[], index=0, score=0, timer;
let subject='', level='';

const qText = document.getElementById('question-text');
const answersEl = document.getElementById('answer-buttons');
const nextBtn = document.getElementById('next-question-btn');
const timeEl = document.getElementById('quiz-time-left');
const progressFill = document.getElementById('progress-fill');
const scoreCounter = document.getElementById('final-score-counter');
const correctEl = document.getElementById('correct-answers-count');
const resultText = document.getElementById('results-details-text');

const confettiCanvas = document.getElementById('confetti-canvas');
const confettiInstance = confetti.create(confettiCanvas,{resize:true});

function showScreen(id){
    screens.forEach(s=>s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

async function fetchQuestions(){
    const res = await fetch(`https://opentdb.com/api.php?amount=10&category=18&difficulty=${level}&type=multiple`);
    const data = await res.json();
    return data.results.map(q=>{
        const answers=[...q.incorrect_answers.map(a=>({t:a,c:false})),{t:q.correct_answer,c:true}];
        answers.sort(()=>Math.random()-0.5);
        return { q:decode(q.question), a:answers };
    });
}

function startQuiz(){
    index=0; score=0;
    showScreen('quiz-screen');
    startTimer();
    showQuestion();
}

function startTimer(){
    let t=LEVEL_SETTINGS[level];
    clearInterval(timer);
    timer=setInterval(()=>{
        t--;
        timeEl.textContent=`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
        if(t<=15) quizTimerBox.classList.add('timer-warning');
        if(t<=0){ clearInterval(timer); showResult(); }
    },1000);
}

function showQuestion(){
    answersEl.innerHTML='';
    nextBtn.classList.add('hidden');

    const q=questions[index];
    qText.textContent=q.q;
    progressFill.style.width=`${((index+1)/questions.length)*100}%`;

    q.a.forEach((ans,i)=>{
        const btn=document.createElement('button');
        btn.className='btn answer-button';
        btn.textContent=decode(ans.t);
        btn.style.animationDelay=`${i*0.1}s`;
        btn.onclick=e=>selectAnswer(e,ans.c);
        btn.addEventListener('click',ripple);
        answersEl.appendChild(btn);
    });
}

function selectAnswer(e,correct){
    if(correct) score++;
    [...answersEl.children].forEach(b=>b.classList.add('disabled'));
    e.target.classList.add(correct?'correct':'incorrect');
    nextBtn.classList.remove('hidden');
}

function showResult(){
    showScreen('results-screen');
    correctEl.textContent=score;
    resultText.innerHTML=`Results for <strong>${subject}</strong> (${level})`;
    let c=0;
    const percent=Math.round((score/questions.length)*100);
    const int=setInterval(()=>{
        scoreCounter.textContent=c++;
        if(c>percent) clearInterval(int);
    },20);
    if(percent>70) confettiInstance({particleCount:180,spread:100});
}

function ripple(e){
    const r=document.createElement('span');
    r.className='ripple';
    e.target.appendChild(r);
    setTimeout(()=>r.remove(),600);
}

function decode(t){
    const x=document.createElement('textarea');
    x.innerHTML=t;
    return x.value;
}

/* EVENTS */
document.getElementById('start-btn').onclick=()=>showScreen('subject-selection-screen');
document.querySelectorAll('.subject-card').forEach(c=>c.onclick=()=>{
    subject=c.dataset.subject;
    showScreen('level-selection-screen');
});
document.querySelectorAll('.level-card').forEach(c=>c.onclick=async()=>{
    level=c.dataset.level;
    loader.classList.remove('hidden');
    questions=await fetchQuestions();
    loader.classList.add('hidden');
    startQuiz();
});
nextBtn.onclick=()=>{ index++; index<questions.length?showQuestion():showResult(); };
document.getElementById('play-again-btn').onclick=()=>showScreen('subject-selection-screen');

showScreen('home-screen');
});
