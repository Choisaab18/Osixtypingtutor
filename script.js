let passages = {
    english: {
        low: [
            "Typing practice improves your speed and accuracy.",
            "The quick brown fox jumps over the lazy dog."
        ],
        medium: [
            "Consistent practice helps in building strong typing habits and muscle memory.",
            "Speed comes from accuracy and accuracy comes from practice."
        ],
        high: [
            "Professional typing involves rhythm, precision and the ability to maintain focus for long periods.",
            "Mastering typing skills increases your productivity significantly."
        ]
    },
    hindi: {
        low: [
            "टाइपिंग अभ्यास से गति और सटीकता बढ़ती है।",
            "अच्छी टाइपिंग हर छात्र के लिए जरूरी है।"
        ],
        medium: [
            "नियमित अभ्यास से आप तेज और बेहतर टाइपिस्ट बन सकते हैं।",
            "सही टाइपिंग के लिए ध्यान और धैर्य जरूरी होता है।"
        ],
        high: [
            "व्यावसायिक टाइपिंग में निरंतरता, एकाग्रता और उच्च स्तर की सटीकता की आवश्यकता होती है।",
            "तेज टाइपिंग कार्यकुशलता को कई गुना बढ़ा देती है।"
        ]
    }
};

let timer;
let timeLeft;
let originalText;

function showCreate() {
    switchScreen("signup-screen");
}

function showLogin() {
    switchScreen("login-screen");
}

function showDashboard() {
    switchScreen("dashboard");
}

function switchScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

// Dummy OTP
function sendOTP() {
    alert("OTP sent: 1234");
    document.getElementById("otpInput").style.display = "block";
    document.getElementById("verifyBtn").style.display = "block";
}

function verifyOTP() {
    let otp = document.getElementById("otpInput").value;
    if (otp === "1234") {
        showDashboard();
    } else {
        alert("Wrong OTP");
    }
}

function createAccount() {
    alert("Account created");
    showLogin();
}

function startTest() {
    let lang = document.getElementById("language").value;
    let diff = document.getElementById("difficulty").value;
    let time = document.getElementById("testTime").value;

    timeLeft = parseInt(time);
    originalText = passages[lang][diff][Math.floor(Math.random() * passages[lang][diff].length)];

    document.getElementById("timer").innerText = timeLeft;
    document.getElementById("textDisplay").innerText = originalText;
    document.getElementById("userInput").value = "";

    switchScreen("test-screen");

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = timeLeft;
        if (timeLeft <= 0) finishTest();
    }, 1000);
}

function checkInput() {
    let typed = document.getElementById("userInput").value;
    let display = "";

    for (let i = 0; i < originalText.length; i++) {
        if (typed[i] == null) {
            display += originalText[i];
        } else if (typed[i] === originalText[i]) {
            display += `<span class="correct">${originalText[i]}</span>`;
        } else {
            display += `<span class="wrong">${originalText[i]}</span>`;
        }
    }

    document.getElementById("textDisplay").innerHTML = display;
}

function finishTest() {
    clearInterval(timer);

    let typed = document.getElementById("userInput").value;
    let words = typed.trim().split(" ").length;

    let accuracy = [...typed].filter((c, i) => c === originalText[i]).length / originalText.length * 100;

    document.getElementById("wpm").innerText = `WPM: ${words}`;
    document.getElementById("accuracy").innerText = `Accuracy: ${accuracy.toFixed(2)}%`;

    switchScreen("result-screen");
}
