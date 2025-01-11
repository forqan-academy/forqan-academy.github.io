const subjectHeader = document.getElementById("subject-header");
const chooseSubject = document.getElementById("choose-subject");
const mediaContainer = document.getElementById("media-container");

const lessonTitle = document.getElementById('lesson-title');
const lessonButtonsDiv = document.getElementById('lesson-buttons');

const subjects = [
    "التزكية", "التفسير", "الحديث", 
    "السيرة 1", "السيرة 2", 
    "العقيدة 1", "العقيدة 2", 
    "الفقه 1", "الفقه 2", 
    "الفكر", "مقاومة الإلحاد 1", "مقاومة الإلحاد 2"
];

// إنشاء مربعات المواد
const subjectsContainer = document.getElementById('subjects-container');
subjects.forEach(subject => {
    const div = document.createElement('div');
    div.textContent = subject;
    div.className = 'grid-item';
    div.onclick = () => generateLessonButtons(subject);
    subjectsContainer.appendChild(div);
});

subjectHeader.onclick = () => {
    chooseSubject.style.display = "block";
    subjectsContainer.style.display = "grid";
    subjectHeader.style.display = "none";
    mediaContainer.style.display = "none";
    lessonTitle.style.display = "none";
    lessonButtonsDiv.style.display = "none";

    document.getElementById('video').src = "";
    document.getElementById('audio').src = "";
};

async function fetchLinks(type, subject) {
    const folder = type === "video" ? "مقاطع" : "صوت";
    const response = await fetch(`${folder}/${subject}.txt`);
    const text = await response.text();
    return text.split("\n").filter(link => link.trim() !== "");
}

async function generateLessonButtons(subject) {
    subjectHeader.textContent = subject;
    subjectHeader.style.display = "block";
    chooseSubject.style.display = "none";
    subjectsContainer.style.display = "none";

    lessonButtonsDiv.innerHTML = ""; // تفريغ الأزرار القديمة
    lessonButtonsDiv.style.display = "grid"; // إظهار مربعات الدروس
    lessonTitle.style.display = "block"; // إظهار عنوان الدروس
    mediaContainer.style.display = "none"; // إخفاء الفيديو والصوت

    // جلب الروابط من الملف
    const videoLinks = await fetchLinks("video", subject);

    // إنشاء أزرار بعدد الروابط
    videoLinks.forEach((link, index) => {
        const button = document.createElement('div');
        button.textContent = `الدرس ${index + 1}`;
        button.className = 'grid-item';
        button.onclick = () => showLesson(subject, index + 1);
        lessonButtonsDiv.appendChild(button);
    });
}

async function showLesson(subject, lesson) {
    const videoLinks = await fetchLinks("video", subject);
    const audioLinks = await fetchLinks("audio", subject);

    if (videoLinks[lesson - 1] && audioLinks[lesson - 1]) {
        const embedLink = videoLinks[lesson - 1].replace("watch?v=", "embed/") + "?rel=0";
        document.getElementById('video').src = embedLink;
        document.getElementById('audio').src = audioLinks[lesson - 1];
        mediaContainer.style.display = "block"; // إظهار الفيديو والصوت
    } else {
        alert("الدرس غير متوفر!");
    }
}


// سرعة الصوت
let audio = document.getElementById("audio");
let theSpeed = document.querySelector(".voice-speed");

let one = theSpeed.querySelector(".one");
let oneTwentyFive = theSpeed.querySelector(".one-twenty-five");
let oneFive = theSpeed.querySelector(".one-five");
let oneSeventyFive = theSpeed.querySelector(".one-seventy-five");
let two = theSpeed.querySelector(".two");

one.onclick = () => {audio.playbackRate=1;}
oneTwentyFive.onclick = () => {audio.playbackRate=1.25;}
oneFive.onclick = () => {audio.playbackRate=1.5;}
oneSeventyFive.onclick = () => {audio.playbackRate=1.75;}
two.onclick = () => {audio.playbackRate=2;}