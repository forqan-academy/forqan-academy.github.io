const subjectHeader = document.getElementById("subject-header");
const chooseSubject = document.getElementById("choose-subject");
const mediaContainer = document.getElementById("media-container");

const lessonTitle = document.getElementById("lesson-title");
const lessonButtonsDiv = document.getElementById("lesson-buttons");

const testCont = document.querySelector(".test-cont");
let showAnswersButton = document.querySelector(".show-answers");

const subjects = [
    "التزكية", "التفسير",
    "الحديث", "الفكر",
    "السيرة 1", "السيرة 2",
    "العقيدة 1", "العقيدة 2",
    "الفقه 1", "الفقه 2",
    "مقاومة الإلحاد 1", "مقاومة الإلحاد 2"
];

// إنشاء مربعات المواد
const subjectsContainer = document.getElementById("subjects-container");
subjects.forEach(subject => {
    const div = document.createElement("div");
    div.textContent = subject;
    div.classList.add("page-button", "grid-item");
    div.onclick = () => generateLessonButtons(subject);
    subjectsContainer.appendChild(div);
});

// الضغط على اسم المادة للرجوع
subjectHeader.onclick = () => {
    // الإختبار مفتوح
    if(testCont.style.display == "block" && lessonButtonsDiv.style.display == "none") {
        // اختيار المادة
        chooseSubject.style.display = "none";
        subjectsContainer.style.display = "none";
        
        // اختيار الدرس
        lessonTitle.style.display = "block";
        lessonButtonsDiv.style.display = "grid";
    } else {
        subjectHeader.style.display = "none";

        // اختيار المادة
        chooseSubject.style.display = "block";
        subjectsContainer.style.display = "grid";
        
        // اختيار الدرس
        lessonTitle.style.display = "none";
        lessonButtonsDiv.style.display = "none";
    }

    // الدرس
    mediaContainer.style.display = "none";
    
    // الإختبار
    testCont.style.display = "none";

    document.getElementById("video").src = "";
    document.getElementById("audio").src = "";
};

async function fetchLinks(folder, subject, split = true, delete_empty = true) {
    const response = await fetch(`${folder}/${subject}.txt`);
    let text = await response.text()
    text = text.split("\r").join("");
    if(split) {
        if(delete_empty) {
            return text.split("\n").filter(link => link.trim() !== "");
        } else {
            return text.split("\n");
        }
    } else {
        return text;
    }
}

async function generateLessonButtons(subject) {
    subjectHeader.textContent = subject;
    subjectHeader.style.display = "block";
    chooseSubject.style.display = "none";
    subjectsContainer.style.display = "none";

    lessonButtonsDiv.innerHTML = ""; // تفريغ الأزرار القديمة
    lessonButtonsDiv.style.display = "grid"; // إظهار مربعات الدروس
    lessonTitle.style.display = "block"; // إظهار عنوان الدروس
    mediaContainer.style.display = "none"; // إخفاء المقطع والصوت

    // جلب الروابط من الملف
    const videoLinks = await fetchLinks("مقاطع", subject);
    let testNums = await fetchLinks("أرقام الإختبارات الشاملة", subject);
    testNums = testNums.map(num => Number(num));

    // إنشاء أزرار بعدد الروابط
    videoLinks.forEach((link, index) => {
        // عدد الإختبارات الشاملة حتى الدرس الحالي
        let tests_count = testNums.filter(number => index >= number-1).length;

        // الإختبارات الشاملة
        if(testNums.includes(index + 1)) {
            const button = document.createElement("div");
            button.innerHTML = `مراجعة<br>واختبار`;
            button.classList.add("page-button", "grid-item", "test-button");
            button.onclick = () => showTest(subject, testNums[testNums.indexOf(index + 1)], true);
            lessonButtonsDiv.appendChild(button);
        }
        
        const button = document.createElement("div");
        button.textContent = `الدرس ${index + 1}`;
        button.classList.add("page-button", "grid-item");
        button.onclick = () => showLesson(subject, index + 1, index + tests_count + 1);
        lessonButtonsDiv.appendChild(button);
    });
    
    // الإختبارات الشاملة
    if(JSON.parse(testNums[testNums.length-1]) == videoLinks.length + 2) {
        const button = document.createElement("div");
        button.innerHTML = `مراجعة<br>واختبار`;
        button.classList.add("page-button", "grid-item", "test-button");
        button.onclick = () => showTest(subject, testNums[testNums.indexOf(videoLinks.length + 2)], true);
        lessonButtonsDiv.appendChild(button);
    }
}

async function showLesson(subject, lesson = 1, test = 1) {
    const videoLinks = await fetchLinks("مقاطع", subject);
    const audioLinks = await fetchLinks("صوت", subject);
    
    if (videoLinks[lesson - 1] && audioLinks[lesson - 1]) {
        const embedLink = videoLinks[lesson - 1].replace("watch?v=", "embed/") + "?rel=0";
        document.querySelector("#video").src = embedLink;
        document.querySelector("#audio").src = audioLinks[lesson - 1];
        mediaContainer.style.display = "block"; // إظهار المقطع والصوت
        testCont.style.display = "none"; // إظهار المقطع والصوت
        showTest(subject, test); // إظهار الإختبار
    } else {
        alert("الدرس غير متوفر!");
    }
}

async function showTest(subject, lesson = 1, hide_media = false) {
    // تحويل إلى عرض الإجابات
    if(testCont.classList.contains("show-answers")) {
        showAnswersButton.click();
    }

    const mediaLinks = await fetchLinks("تفريغ", subject, true, false); // تفريغ
    if(mediaLinks[lesson - 1] == "") {
        document.querySelector(".media").style.display = "none";
    } else {
        document.querySelector(".media").style.display = "block";
    }

    document.querySelector(".media").href = mediaLinks[lesson - 1];

    make_test(subject, lesson);
    testCont.style.display = "block"; // إظهار الإختبار
    lessonTitle.style.display = "none";
    if(hide_media) {// إخفاء المقطع والصوت
        lessonButtonsDiv.style.display = "none";
        mediaContainer.style.display = "none";
    }
}

function spliceArr(arr, fromNum = 0, toNum = undefined) {
    if(toNum == undefined) {
        toNum = arr.length - 1;
    }
    
    let res = [];
    for(let i = fromNum; i <= toNum; i++) {
        res.push(arr[i]);
    }

    return res
}

async function make_test(sub, lesson = 1) {
    testCont.querySelectorAll(".quest-cont").forEach((e) => {
        e.remove();
    });

    // مصفوفة الأسئلة
    questions = {};
    let text = await fetchLinks("اختبارات", sub, false);
    text = text.split("\n------------\n")[lesson - 1];
    text = text.split("\n\n").forEach((e) => {
        quest = e.split("\n")[0];

        i = 0;
        ansIndex = [];
        let choices = spliceArr(e.split("\n"), 1);
        choices.forEach((choice) => {
            if(choice.includes("✅")) {
                ansIndex.push(i);
                choices[i] = choices[i].replace("✅", "");
            }
            i++;
        });
        questions[quest] = {"choices": choices, "answer_index": ansIndex};
    });

    // العناصر
    for(let quest in questions) {
        let questCont = document.createElement("div");
        questCont.classList.add("quest-cont");

        let quest_p = document.createElement("p");
        quest_p.classList.add("quest");
        quest_p.innerText = quest;
        questCont.appendChild(quest_p);
        
        let choicesCont = document.createElement("div");
        choicesCont.classList.add("choices-cont");
        questCont.appendChild(choicesCont);
        
        for(let choice_i in questions[quest]["choices"]) {
            let choice = questions[quest]["choices"][choice_i];

            let choice_div = document.createElement("div");
            choice_div.classList.add("choice");
            questions[quest]["answer_index"].includes(JSON.parse(choice_i))? choice_div.classList.add("correct") : "";
            choice_div.innerText = choice;
            choicesCont.appendChild(choice_div);
        }

        if(questions[quest]["answer_index"].length > 1) {
            questCont.style.backgroundColor = "#e5ffe8";
        }

        testCont.appendChild(questCont);
    }

    testCont.onclick = (eo) => {
        if(Array.from(eo.target.classList).includes("correct")) {
            eo.target.style.backgroundColor = "#7eff7e";
            eo.target.style.borderColor = "#67e667";
        } else if(Array.from(eo.target.classList).includes("choice")) {
            eo.target.style.backgroundColor = "#ff7e7e";
            eo.target.style.borderColor = "#e66767";
        }
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

// الإختبارات
showAnswersButton.onclick = () => {
    testCont.classList.toggle("show-answers");
    if(testCont.classList.contains("show-answers")) {
        showAnswersButton.textContent = "إخفاء الإجابات";
    } else {
        showAnswersButton.textContent = "عرض الإجابات";
    }
}