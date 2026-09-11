/* =========================================================
   THE FRENCH REVOLUTION
   RAPID REVISION — PRATIK ROY

   STABLE PRESENTATION CONTROLLER
   JS-01 → CORE / TIMER / NAVIGATOR
   JS-02 → ANSWER REVEAL
   JS-04 → MEDIA
   JS-05 → MCQ
   JS-03A → TESTED TEACHER STYLUS ENGINE (preserved below)
   ========================================================= */

"use strict";


/* =========================================================
   JS-01A — CORE CONTROLLER / NAVIGATOR
   ========================================================= */

const app = document.getElementById("presentation-app");
const sectionToggle = document.getElementById("section-toggle");
const sectionNavigator = document.getElementById("section-navigator");
const sectionClose = document.getElementById("section-close");
const lessonContent = document.getElementById("lesson-content");
const navItems = Array.from(document.querySelectorAll(".nav-item"));
const lessonSections = Array.from(document.querySelectorAll(".lesson-section"));

const presentationState = {
    currentSection: lessonSections[0]?.id || "intro",
    navigatorOpen: false,
    timerRunning: false,
    timerFinished: false
};

function elementExists(element) {
    return element !== null && element !== undefined;
}

function updateActiveNavigation(targetId) {
    navItems.forEach((item) => {
        const active = item.dataset.target === targetId;
        item.classList.toggle("active", active);

        if (active) {
            item.setAttribute("aria-current", "true");
        } else {
            item.removeAttribute("aria-current");
        }
    });
}

function openNavigator() {
    if (!sectionNavigator) return;

    presentationState.navigatorOpen = true;
    sectionNavigator.classList.add("open", "is-open");
    sectionNavigator.setAttribute("aria-hidden", "false");

    if (sectionToggle) {
        sectionToggle.classList.add("active");
        sectionToggle.setAttribute("aria-expanded", "true");
    }
}

function closeNavigator() {
    if (!sectionNavigator) return;

    presentationState.navigatorOpen = false;
    sectionNavigator.classList.remove("open", "is-open");
    sectionNavigator.setAttribute("aria-hidden", "true");

    if (sectionToggle) {
        sectionToggle.classList.remove("active");
        sectionToggle.setAttribute("aria-expanded", "false");
    }
}

function toggleNavigator() {
    if (presentationState.navigatorOpen) {
        closeNavigator();
    } else {
        openNavigator();
    }
}

function goToSection(targetId) {
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) {
        console.warn("Navigator target not found:", targetId);
        return;
    }

    presentationState.currentSection = targetId;
    updateActiveNavigation(targetId);

    target.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    closeNavigator();
}

if (sectionToggle) {
    sectionToggle.addEventListener("click", toggleNavigator);
}

if (sectionClose) {
    sectionClose.addEventListener("click", closeNavigator);
}

navItems.forEach((item) => {
    item.addEventListener("click", () => {
        goToSection(item.dataset.target);
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeNavigator();
    }
});

document.addEventListener("pointerdown", (event) => {
    if (!sectionNavigator?.classList.contains("open")) return;

    const inside = sectionNavigator.contains(event.target);
    const toggle = sectionToggle?.contains(event.target);

    if (!inside && !toggle) {
        closeNavigator();
    }
});

if (lessonSections.length) {
    updateActiveNavigation(lessonSections[0].id);

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (!visible.length) return;

            const best = visible[0].target;
            presentationState.currentSection = best.id;
            updateActiveNavigation(best.id);
        },
        {
            root: null,
            threshold: [0.15, 0.35, 0.55, 0.75],
            rootMargin: "-12% 0px -55% 0px"
        }
    );

    lessonSections.forEach((section) => sectionObserver.observe(section));
}


/* =========================================================
   JS-01B — 22-MINUTE PRESENTATION TIMER
   ========================================================= */

const PRESENTATION_TIME_SECONDS = 22 * 60;

let timerRemainingSeconds = PRESENTATION_TIME_SECONDS;
let timerDeadline = null;
let timerInterval = null;
let timerFinished = false;

const timerPanel = document.getElementById("timer-panel");
const timerDisplay = document.getElementById("timer-display");
const presentationClock = document.getElementById("presentation-clock");
const alarmOverlay = document.getElementById("alarm-overlay");
const dismissAlarm = document.getElementById("dismiss-alarm");

function formatTimer(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safe / 60);
    const remaining = safe % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remaining).padStart(2, "0")
    );
}

function updateTimerDisplay() {
    const formatted = formatTimer(timerRemainingSeconds);

    if (timerDisplay) timerDisplay.textContent = formatted;
    if (presentationClock) presentationClock.textContent = formatted;
}

function updateTimerState() {
    if (!timerPanel) return;

    timerPanel.classList.remove(
        "running",
        "paused",
        "warning",
        "critical",
        "finished",
        "timer-starting"
    );

    if (timerFinished) {
        timerPanel.classList.add("finished");
        return;
    }

    timerPanel.classList.add("running");

    if (timerRemainingSeconds <= 60) {
        timerPanel.classList.add("critical");
    } else if (timerRemainingSeconds <= 300) {
        timerPanel.classList.add("warning");
    }
}

function timerStartFlash() {
    if (!timerPanel) return;

    timerPanel.classList.remove("timer-starting");
    void timerPanel.offsetWidth;
    timerPanel.classList.add("timer-starting");
}

function playPresentationAlarm() {
    try {
        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) return;

        const audioContext = new AudioContext();
        const now = audioContext.currentTime;

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.setValueAtTime(660, now + 0.25);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.72);
    } catch (error) {
        console.warn("Presentation alarm could not start:", error);
    }
}

function showPresentationAlarm() {
    if (!alarmOverlay) return;

    alarmOverlay.hidden = false;

    requestAnimationFrame(() => {
        alarmOverlay.classList.add("active");
        alarmOverlay.setAttribute("aria-hidden", "false");
    });

    playPresentationAlarm();
}

function hidePresentationAlarm() {
    if (!alarmOverlay) return;

    alarmOverlay.classList.remove("active", "show");
    alarmOverlay.setAttribute("aria-hidden", "true");

    window.setTimeout(() => {
        alarmOverlay.hidden = true;
    }, 350);
}

function finishPresentationTimer() {
    timerFinished = true;
    presentationState.timerFinished = true;
    presentationState.timerRunning = false;
    timerRemainingSeconds = 0;

    updateTimerDisplay();
    updateTimerState();
    updateTimerProgress();

    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    showPresentationAlarm();
}

function runTimerTick() {
    if (timerFinished || !timerDeadline) return;

    const difference = timerDeadline - Date.now();

    timerRemainingSeconds = Math.max(
        0,
        Math.ceil(difference / 1000)
    );

    updateTimerDisplay();
    updateTimerState();
    updateTimerProgress();

    if (timerRemainingSeconds <= 0) {
        finishPresentationTimer();
    }
}

function startPresentationTimer() {
    if (!timerDisplay && !presentationClock) return;

    if (timerInterval !== null) {
        clearInterval(timerInterval);
    }

    timerFinished = false;
    presentationState.timerFinished = false;
    presentationState.timerRunning = true;

    timerRemainingSeconds = PRESENTATION_TIME_SECONDS;
    timerDeadline =
        Date.now() + PRESENTATION_TIME_SECONDS * 1000;

    updateTimerDisplay();
    updateTimerState();
    timerStartFlash();
    updateTimerProgress();

    timerInterval = window.setInterval(runTimerTick, 250);
}

if (dismissAlarm) {
    dismissAlarm.addEventListener("click", hidePresentationAlarm);
}

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        alarmOverlay &&
        !alarmOverlay.hidden
    ) {
        hidePresentationAlarm();
    }
});

let timerProgress = null;
let timerProgressFill = null;

function ensureTimerProgress() {
    if (!timerPanel) return;

    timerProgress =
        timerPanel.querySelector(".timer-progress");

    if (!timerProgress) {
        timerProgress = document.createElement("div");
        timerProgress.className = "timer-progress";

        timerProgressFill = document.createElement("div");
        timerProgressFill.className = "timer-progress-fill";

        timerProgress.appendChild(timerProgressFill);
        timerPanel.appendChild(timerProgress);
    } else {
        timerProgressFill =
            timerProgress.querySelector(".timer-progress-fill");
    }
}

function updateTimerProgress() {
    if (!timerPanel) return;

    if (!timerProgressFill) {
        ensureTimerProgress();
    }

    if (!timerProgressFill || !timerDeadline) return;

    const total = PRESENTATION_TIME_SECONDS * 1000;
    const remaining = Math.max(0, timerDeadline - Date.now());
    const progress = Math.min(1, Math.max(0, remaining / total));

    timerProgressFill.style.transform =
        `scaleX(${progress})`;
}

ensureTimerProgress();
startPresentationTimer();


/* =========================================================
   JS-02 — UNIFIED QUESTION → ANSWER REVEAL ENGINE
   ========================================================= */

const answerButtons = Array.from(
    document.querySelectorAll(".answer-button")
);

const answerTypingSpeed = 18;
let activeTypingAnswer = null;
let activeTypingButton = null;
let activeTypingTimer = null;

function getAnswerElement(answerId) {
    if (!answerId) return null;
    return document.getElementById(`answer-${answerId}`);
}

function stopAnswerTyping() {
    if (activeTypingTimer !== null) {
        clearTimeout(activeTypingTimer);
        activeTypingTimer = null;
    }

    if (activeTypingButton) {
        activeTypingButton.disabled = false;

        if (
            activeTypingButton.textContent === "REVEALING..."
        ) {
            activeTypingButton.textContent =
                "REVEAL ANSWER";
        }
    }

    activeTypingAnswer = null;
    activeTypingButton = null;
}

function getAnswerSourceHtml(answer) {
    if (!answer) return "";

    if (!answer.dataset.originalHtml) {
        answer.dataset.originalHtml = answer.innerHTML;
    }

    return answer.dataset.originalHtml;
}

function getAnswerSourceText(answer) {
    getAnswerSourceHtml(answer);

    return answer.textContent.trim();
}

function finishAnswerTyping(answer, button) {
    if (!answer) return;

    stopAnswerTyping();

    const originalHtml = answer.dataset.originalHtml;

    if (originalHtml) {
        answer.innerHTML = originalHtml;
    }

    answer.classList.remove("is-revealing");
    answer.classList.add("answer-found");
    answer.dataset.revealed = "true";
    answer.setAttribute("aria-live", "polite");

    if (button) {
        button.disabled = false;
        button.classList.add("active");
        button.textContent = "ANSWER REVEALED";
        button.setAttribute("aria-expanded", "true");
    }
}

function typeAnswer(answer, button) {
    if (!answer) return;

    stopAnswerTyping();

    const fullText = getAnswerSourceText(answer);

    if (!fullText) {
        finishAnswerTyping(answer, button);
        return;
    }

    activeTypingAnswer = answer;
    activeTypingButton = button || null;

    answer.innerHTML = "";
    answer.classList.remove("answer-found");
    answer.classList.add("is-revealing");

    if (button) {
        button.disabled = true;
        button.classList.add("active");
        button.textContent = "REVEALING...";
        button.setAttribute("aria-expanded", "true");
    }

    let index = 0;

    function nextCharacter() {
        if (activeTypingAnswer !== answer) return;

        if (index >= fullText.length) {
            finishAnswerTyping(answer, button);
            return;
        }

        answer.textContent += fullText.charAt(index);
        index += 1;

        activeTypingTimer =
            window.setTimeout(nextCharacter, answerTypingSpeed);
    }

    nextCharacter();
}

function revealQuestionWithTyping(answerId, button) {
    const answer = getAnswerElement(answerId);

    if (!answer) {
        console.warn("Answer target not found:", answerId);
        return;
    }

    if (
        activeTypingAnswer === answer &&
        activeTypingTimer !== null
    ) {
        return;
    }

    if (answer.dataset.revealed === "true") {
        answer.hidden = false;

        answer.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        answer.classList.remove("target-highlight");
        void answer.offsetWidth;
        answer.classList.add("target-highlight");
        return;
    }

    getAnswerSourceHtml(answer);

    answer.hidden = false;
    answer.dataset.revealed = "false";
    answer.classList.remove(
        "target-highlight",
        "answer-found",
        "is-revealing"
    );

    if (button) {
        button.setAttribute("aria-expanded", "true");
    }

    window.setTimeout(() => {
        answer.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 60);

    window.setTimeout(() => {
        typeAnswer(answer, button);
    }, 300);
}

function revealQuestionInstant(answerId, button) {
    const answer = getAnswerElement(answerId);

    if (!answer) return;

    stopAnswerTyping();
    getAnswerSourceHtml(answer);

    answer.hidden = false;
    answer.dataset.revealed = "true";
    answer.classList.remove("is-revealing");
    answer.classList.add("answer-found");

    if (button) {
        button.disabled = false;
        button.classList.add("active");
        button.textContent = "ANSWER REVEALED";
        button.setAttribute("aria-expanded", "true");
    }

    answer.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

answerButtons.forEach((button) => {
    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", () => {
        revealQuestionWithTyping(
            button.dataset.answer,
            button
        );
    });
});

function isAnswerRevealed(answerId) {
    const answer = getAnswerElement(answerId);

    return Boolean(
        answer &&
        !answer.hidden &&
        answer.dataset.revealed === "true"
    );
}

function getRevealedAnswers() {
    return Array.from(
        document.querySelectorAll(
            '.answer-reveal[data-revealed="true"]'
        )
    );
}

function getRevealCount() {
    return getRevealedAnswers().length;
}

window.lessonQuestionSystem = {
    reveal: revealQuestionWithTyping,
    revealInstant: revealQuestionInstant,
    isRevealed: isAnswerRevealed,
    getRevealedAnswers,
    getRevealCount,
    stopTyping: stopAnswerTyping
};

window.addEventListener("beforeunload", stopAnswerTyping);


/* =========================================================
   JS-04 — REUSABLE IMAGE / MEDIA SLOT SYSTEM
   Local image + URL now; Cloudinary-ready later.
   ========================================================= */
const CLOUDINARY_CLOUD_NAME = "skeq3cvt";
const CLOUDINARY_UPLOAD_PRESET = "THE FRENCH REVOLUTION";

let cloudinaryWidget = null;

function getCloudinaryWidget() {
    if (cloudinaryWidget) return cloudinaryWidget;

    if (!window.cloudinary) {
        console.warn("Cloudinary Upload Widget is not loaded.");
        return null;
    }

    cloudinaryWidget = window.cloudinary.createUploadWidget(
        {
            cloudName: CLOUDINARY_CLOUD_NAME,
            uploadPreset: CLOUDINARY_UPLOAD_PRESET,
            multiple: false,
            resourceType: "image",
            folder: "The-French-Revolution"
        },
        (error, result) => {
            if (error) {
                console.warn("Cloudinary upload error:", error);
                return;
            }

            if (
                result &&
                result.event === "success" &&
                result.info &&
                result.info.secure_url
            ) {
                const slot = window.__activeCloudinarySlot;

if (slot) {
    const imageUrl = result.info.secure_url;

    // Show image immediately on this device
    setMediaImage(slot, imageUrl);

    // Save the Cloudinary URL for every other device
    if (
        window.frenchRevolutionFirebase &&
        typeof window.frenchRevolutionFirebase.saveMediaState === "function"
    ) {
        window.frenchRevolutionFirebase.saveMediaState(
            slot.dataset.media,
            imageUrl
        );
    }
}

                window.__activeCloudinarySlot = null;
            }
        }
    );

    return cloudinaryWidget;
}

const mediaSlots = Array.from(
    document.querySelectorAll(".media-slot")
);

const MEDIA_STORAGE_PREFIX =
    "fr-rapid-revision-media:";

function mediaStorageKey(slot) {
    return MEDIA_STORAGE_PREFIX + (slot.dataset.media || "slot");
}

function createMediaControlButton(className, text) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    return button;
}

function clearMediaSlot(slot) {
    const media = slot.querySelector(".media-content");

    if (media) {
        media.remove();
    }

    slot.classList.remove("has-media");

    const placeholder = slot.querySelector(".media-placeholder");

    if (placeholder) {
        placeholder.hidden = false;
    }

    try {
        localStorage.removeItem(mediaStorageKey(slot));
    } catch (error) {
        console.warn("Media storage could not be cleared:", error);
    }
}

function setMediaImage(slot, source, persist = true) {
    if (!source) return;

    let image = slot.querySelector(".media-content");

    if (!image) {
        image = document.createElement("img");
        image.className = "media-content";
        image.alt =
            slot.dataset.media
                ? `French Revolution visual: ${slot.dataset.media}`
                : "French Revolution visual";

        slot.insertBefore(image, slot.firstChild);
    }

    image.src = source;
    slot.classList.add("has-media");

    const placeholder = slot.querySelector(".media-placeholder");

    if (placeholder) {
        placeholder.hidden = true;
    }

    if (persist) {
        try {
            localStorage.setItem(
                mediaStorageKey(slot),
                source
            );
        } catch (error) {
            console.warn(
                "Media could not be saved locally:",
                error
            );
        }
    }
}

function restoreStoredMedia(slot) {
    try {
        const source =
            localStorage.getItem(
                mediaStorageKey(slot)
            );

        if (source) {
            setMediaImage(slot, source, false);
        }
    } catch (error) {
        console.warn(
            "Stored media could not be restored:",
            error
        );
    }
}

function setupMediaSlot(slot) {
    if (slot.dataset.mediaReady === "true") return;

    slot.dataset.mediaReady = "true";

    const controls = document.createElement("div");
    controls.className = "media-controls";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.hidden = true;

    const uploadButton =
        createMediaControlButton(
            "media-upload-button",
            "ADD IMAGE"
        );

    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.className = "media-url-input";
    urlInput.placeholder = "Paste image URL";

    const urlButton =
        createMediaControlButton(
            "media-url-button",
            "USE URL"
        );

    const clearButton =
        createMediaControlButton(
            "media-clear-button",
            "CLEAR"
        );

    uploadButton.addEventListener("click", () => {
    window.__activeCloudinarySlot = slot;

    const widget = getCloudinaryWidget();

    if (widget) {
        widget.open();
    } else {
        fileInput.click();
    }
});

    fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            console.warn("Only image files are supported.");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                setMediaImage(slot, reader.result);
            }
        };

        reader.readAsDataURL(file);
    });

    urlButton.addEventListener("click", () => {
        const url = urlInput.value.trim();

        if (!url) return;

        setMediaImage(slot, url);
    });

    clearButton.addEventListener("click", () => {
        urlInput.value = "";
        fileInput.value = "";
        clearMediaSlot(slot);
    });

    controls.appendChild(fileInput);
    controls.appendChild(uploadButton);
    controls.appendChild(urlInput);
    controls.appendChild(urlButton);
    controls.appendChild(clearButton);

    slot.appendChild(controls);

    restoreStoredMedia(slot);
}

mediaSlots.forEach(setupMediaSlot);

mediaSlots.forEach((slot) => {
    const mediaId = slot.dataset.media;

    if (
        !mediaId ||
        !window.frenchRevolutionFirebase ||
        typeof window.frenchRevolutionFirebase.watchMediaState !== "function"
    ) {
        return;
    }

    window.frenchRevolutionFirebase.watchMediaState(
        mediaId,
        (mediaState) => {
            if (mediaState && mediaState.imageUrl) {
                setMediaImage(
                    slot,
                    mediaState.imageUrl,
                    false
                );
            }
        }
    );
});

window.frenchRevolutionMedia = {
    slots: mediaSlots,

    setImage(mediaId, source) {
        const slot =
            document.querySelector(
                `.media-slot[data-media="${CSS.escape(mediaId)}"]`
            );

        if (slot) {
            setMediaImage(slot, source);
        }
    },

    clear(mediaId) {
        const slot =
            document.querySelector(
                `.media-slot[data-media="${CSS.escape(mediaId)}"]`
            );

        if (slot) {
            clearMediaSlot(slot);
        }
    }
};


/* =========================================================
   JS-05 — MCQ CHALLENGE
   Wrong = red, correct = green, reveal = correct answer.
   ========================================================= */

const mcqCards = Array.from(
    document.querySelectorAll(".mcq-card")
);

let mcqCorrectCount = 0;
let mcqAnsweredCount = 0;

const mcqScoreDisplay =
    document.getElementById("mcq-score");

function updateMcqScore() {
    if (!mcqScoreDisplay) return;

    mcqScoreDisplay.textContent =
        `${mcqCorrectCount} / ${mcqCards.length}`;
}

function clearMcqOptionState(card) {
    card.querySelectorAll(".mcq-options button").forEach((button) => {
        button.classList.remove(
            "selected",
            "mcq-correct",
            "mcq-wrong"
        );
    });
}

function markMcqSelection(card, optionButton) {
    const correctAnswer =
        String(card.dataset.answer || "").toUpperCase();

    const selected =
        String(optionButton.dataset.option || "").toUpperCase();

    const wasScored =
        card.dataset.scored === "true";

    const wasAnswered =
        card.dataset.answered === "true";

    clearMcqOptionState(card);

    optionButton.classList.add("selected");

    if (selected === correctAnswer) {
        optionButton.classList.add("mcq-correct");

        if (!wasScored) {
            mcqCorrectCount += 1;
            card.dataset.scored = "true";
        }

        if (!wasAnswered) {
            mcqAnsweredCount += 1;
            card.dataset.answered = "true";
        }

        const feedback =
            card.querySelector(".mcq-feedback");

        if (feedback) {
            feedback.textContent = "✓ CORRECT ANSWER";
        }
    } else {
        optionButton.classList.add("mcq-wrong");

        if (!wasAnswered) {
            mcqAnsweredCount += 1;
            card.dataset.answered = "true";
        }

        const feedback =
            card.querySelector(".mcq-feedback");

        if (feedback) {
            feedback.textContent =
                "✕ NOT CORRECT — REVEAL THE ANSWER.";
        }
    }

    updateMcqScore();
}

function revealMcqAnswer(card) {
    const correctAnswer =
        String(card.dataset.answer || "").toUpperCase();

    const options =
        Array.from(
            card.querySelectorAll(".mcq-options button")
        );

    options.forEach((button) => {
        const option =
            String(button.dataset.option || "").toUpperCase();

        button.classList.remove(
            "mcq-correct",
            "mcq-wrong"
        );

        if (option === correctAnswer) {
            button.classList.add("mcq-correct");
        }
    });

    const feedback =
        card.querySelector(".mcq-feedback");

    if (feedback) {
        const correctButton =
            options.find(
                (button) =>
                    String(button.dataset.option || "").toUpperCase() ===
                    correctAnswer
            );

        feedback.textContent =
            correctButton
                ? `✓ CORRECT: ${correctButton.textContent.trim()}`
                : "✓ CORRECT ANSWER REVEALED";
    }

    card.dataset.revealed = "true";
}

mcqCards.forEach((card) => {
    const options =
        Array.from(
            card.querySelectorAll(".mcq-options button")
        );

    const revealButton =
        card.querySelector(".mcq-reveal");

    options.forEach((optionButton) => {
        optionButton.addEventListener("click", () => {
            markMcqSelection(card, optionButton);
        });
    });

    if (revealButton) {
        revealButton.addEventListener("click", () => {
            revealMcqAnswer(card);

            const id = card.dataset.mcqId;

            const firebaseBridge =
                window.frenchRevolutionFirebase;

            if (
                firebaseBridge &&
                typeof firebaseBridge.saveMCQAttempt === "function"
            ) {
                firebaseBridge.saveMCQAttempt({
                    questionId: id || null,
                    selectedOption:
                        card.querySelector(
                            ".mcq-options button.selected"
                        )?.dataset.option || null,
                    correctOption:
                        card.dataset.answer || null,
                    correct:
                        card.querySelector(
                            ".mcq-options button.selected"
                        )?.dataset.option ===
                        card.dataset.answer
                }).catch((error) => {
                    console.warn(
                        "MCQ cloud save skipped:",
                        error
                    );
                });
            }
        });
    }
});

updateMcqScore();

window.frenchRevolutionMcq = {
    cards: mcqCards,

    getScore() {
        return {
            correct: mcqCorrectCount,
            answered: mcqAnsweredCount,
            total: mcqCards.length
        };
    },

    revealAll() {
        mcqCards.forEach(revealMcqAnswer);
    },

    reset() {
        mcqCorrectCount = 0;
        mcqAnsweredCount = 0;

        mcqCards.forEach((card) => {
            card.dataset.scored = "false";
            card.dataset.answered = "false";
            card.dataset.revealed = "false";

            clearMcqOptionState(card);

            const feedback =
                card.querySelector(".mcq-feedback");

            if (feedback) {
                feedback.textContent = "";
            }
        });

        updateMcqScore();
    }
};


/* =========================================================
   DEVELOPMENT SAFETY CHECKS
   ========================================================= */

(function runPresentationChecks() {
    const missingTargets = navItems
        .map((item) => item.dataset.target)
        .filter((target) => !document.getElementById(target));

    if (missingTargets.length) {
        console.warn(
            "Navigator targets missing:",
            missingTargets
        );
    }

    const answerTargets = answerButtons
        .map((button) => button.dataset.answer)
        .filter((id) => !getAnswerElement(id));

    if (answerTargets.length) {
        console.warn(
            "Answer targets missing:",
            answerTargets
        );
    }
})();


/* =========================================================
   PUBLIC CORE API
   ========================================================= */

window.frenchRevolutionPresentation = {
    state: presentationState,
    openNavigator,
    closeNavigator,
    toggleNavigator,
    goToSection,
    startPresentationTimer,
    hidePresentationAlarm
};


/* =========================================================
   JS-03A — TESTED TEACHER STYLUS / DRAWING ENGINE
   The complete tested engine follows unchanged.
   ========================================================= */

/* =========================================================
   JS-03A — TEACHER STYLUS / DRAWING ENGINE
========================================================= */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     DOM REFERENCES
  --------------------------------------------------------- */

  const stylusToggle = document.getElementById("stylus-toggle");
  const stylusOff = document.getElementById("stylus-off");

  const colourOptions = document.querySelectorAll(
    ".colour-option"
  );

  const brushSize = document.getElementById("brush-size");

  const undoDrawing = document.getElementById(
    "undo-drawing"
  );

const redoDrawing = document.getElementById(
  "redo-drawing"
);

  const eraserToggle = document.getElementById(
    "eraser-toggle"
  );

  const clearDrawing = document.getElementById(
    "clear-drawing"
  );

  const drawingCanvas = document.getElementById(
    "drawing-canvas"
  );
const drawingScrollButton =
  document.getElementById(
    "drawing-scroll-button"
  );
  /* ---------------------------------------------------------
     SAFETY CHECK
  --------------------------------------------------------- */

  if (
    !stylusToggle ||
    !stylusOff ||
    !drawingCanvas
  ) {
    console.warn(
      "JS-03A: Teacher drawing tools could not initialise."
    );

    return;
  }

  const ctx = drawingCanvas.getContext("2d");

  if (!ctx) {
    console.warn(
      "JS-03A: Canvas 2D context unavailable."
    );

    return;
  }

  /* ---------------------------------------------------------
     DRAWING STATE
  --------------------------------------------------------- */

  const drawingState = {
    enabled: false,
    drawing: false,

    colour: "red",
    size: Number(brushSize?.value || 6),

    erasing: false,

    activePointerId: null,

strokes: [],
redoStrokes: [],
currentStroke: null

  };

  /* ---------------------------------------------------------
     COLOUR MAP
  --------------------------------------------------------- */

  const drawingColours = {
    red: "#ff3b30",
    gold: "#ffd166",
    white: "#ffffff",
    blue: "#4da3ff"
  };

  /* ---------------------------------------------------------
     CANVAS SIZE
  --------------------------------------------------------- */

  function getCanvasScale() {
    return window.devicePixelRatio || 1;
  }

  function resizeCanvas() {
    const rect = drawingCanvas.getBoundingClientRect();
    const scale = getCanvasScale();

    const oldWidth = drawingCanvas.width;
    const oldHeight = drawingCanvas.height;

    const newWidth = Math.max(
      1,
      Math.round(rect.width * scale)
    );

    const newHeight = Math.max(
      1,
      Math.round(rect.height * scale)
    );

    if (
      oldWidth === newWidth &&
      oldHeight === newHeight
    ) {
      return;
    }

    drawingCanvas.width = newWidth;
    drawingCanvas.height = newHeight;

    ctx.setTransform(
      scale,
      0,
      0,
      scale,
      0,
      0
    );

    redrawAllStrokes();
  }

  /* ---------------------------------------------------------
     CANVAS COORDINATES
  --------------------------------------------------------- */
function getPointerPosition(event) {
  const rect = drawingCanvas.getBoundingClientRect();

  const scrollX =
    window.scrollX ||
    document.documentElement.scrollLeft ||
    0;

  const scrollY =
    window.scrollY ||
    document.documentElement.scrollTop ||
    0;

  return {
    x: event.clientX - rect.left + scrollX,
    y: event.clientY - rect.top + scrollY
  };
}

  /* ---------------------------------------------------------
     STROKE DRAWING
  --------------------------------------------------------- */
function drawStroke(stroke) {
  if (!stroke || stroke.points.length < 1) return;

  const scrollX =
    window.scrollX ||
    document.documentElement.scrollLeft ||
    0;

  const scrollY =
    window.scrollY ||
    document.documentElement.scrollTop ||
    0;

  ctx.save();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.size;

  if (stroke.eraser) {
    ctx.globalCompositeOperation = "destination-out";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = stroke.colour;
  }

  const points = stroke.points;

  ctx.beginPath();

  const firstX = points[0].x - scrollX;
  const firstY = points[0].y - scrollY;

  ctx.moveTo(firstX, firstY);

  if (points.length === 1) {
    ctx.lineTo(firstX + 0.01, firstY + 0.01);
  } else {
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(
        points[i].x - scrollX,
        points[i].y - scrollY
      );
    }
  }

  ctx.stroke();
  ctx.restore();
}

  

  function redrawAllStrokes() {
    const rect =
      drawingCanvas.getBoundingClientRect();

    const scale = getCanvasScale();

    ctx.setTransform(
      scale,
      0,
      0,
      scale,
      0,
      0
    );

    ctx.clearRect(
      0,
      0,
      rect.width,
      rect.height
    );

    drawingState.strokes.forEach(
      drawStroke
    );
  }

  /* ---------------------------------------------------------
     POINTER DOWN
  --------------------------------------------------------- */
function startDrawing(event) {
  if (!drawingState.enabled) {
    return;
  }

  /* Ignore non-primary mouse buttons */
  if (
    event.pointerType === "mouse" &&
    event.button !== 0
  ) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  drawingState.drawing = true;

  drawingState.activePointerId =
    event.pointerId;

  const point =
    getPointerPosition(event);

  drawingState.currentStroke = {
    colour:
      drawingColours[
        drawingState.colour
      ] || drawingColours.red,

    size:
      drawingState.size,

    eraser:
      drawingState.erasing,

    points: [point]
  };

  try {
    drawingCanvas.setPointerCapture(
      event.pointerId
    );
  } catch (error) {
    console.warn(
      "Pointer capture unavailable:",
      error
    );
  }

  /* Draw the initial point */
  drawStroke(
    drawingState.currentStroke
  );
}


  /* ---------------------------------------------------------
     POINTER MOVE
  --------------------------------------------------------- */

  function continueDrawing(event) {
  if (
    !drawingState.drawing ||
    drawingState.activePointerId !==
      event.pointerId
  ) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const point =
    getPointerPosition(event);

  drawingState.currentStroke.points.push(
    point
  );

  drawStroke(
    drawingState.currentStroke
  );
}

  /* ---------------------------------------------------------
     POINTER UP
  --------------------------------------------------------- */

  function finishDrawing(event) {
    if (
      !drawingState.drawing ||
      drawingState.activePointerId !==
        event.pointerId
    ) {
      return;
    }

    event.preventDefault();

    if (
      drawingState.currentStroke &&
      drawingState.currentStroke.points.length
    ) {
      
      drawingState.strokes.push(
  drawingState.currentStroke
);

drawingState.redoStrokes = [];
      
    }

    drawingState.currentStroke = null;
    drawingState.drawing = false;
    drawingState.activePointerId = null;

    try {
      drawingCanvas.releasePointerCapture(
        event.pointerId
      );
    } catch (error) {
      // Pointer capture may already be released.
    }

    updateToolStates();
  }

  /* ---------------------------------------------------------
     CANCEL DRAWING
  --------------------------------------------------------- */

  function cancelDrawing(event) {
    if (
      drawingState.activePointerId !==
      event.pointerId
    ) {
      return;
    }

    drawingState.currentStroke = null;
    drawingState.drawing = false;
    drawingState.activePointerId = null;
  }

/* ---------------------------------------------------------
   TEACHING SCROLL
--------------------------------------------------------- */

function scrollLessonDown() {
  if (!drawingState.enabled) {
    return;
  }

  window.scrollBy({
    top: 180,
    left: 0,
    behavior: "smooth"
  });
}
  /* ---------------------------------------------------------
     STYLUS ON
  --------------------------------------------------------- */
function enableStylus() {
  drawingState.enabled = true;

  drawingCanvas.classList.add("active");

  drawingCanvas.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "drawing-mode"
  );

  updateToolStates();
}

  

  /* ---------------------------------------------------------
     STYLUS OFF
  --------------------------------------------------------- */
function disableStylus() {
  drawingState.enabled = false;

  drawingState.drawing = false;
  drawingState.currentStroke = null;
  drawingState.activePointerId = null;

  drawingCanvas.classList.remove("active");

  drawingCanvas.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "drawing-mode"
  );

  updateToolStates();
}

  /* ---------------------------------------------------------
     COLOUR SELECTION
  --------------------------------------------------------- */

  function selectColour(colour) {
    if (
      !drawingColours[colour]
    ) {
      return;
    }

    drawingState.colour = colour;
    drawingState.erasing = false;

    colourOptions.forEach(
      (button) => {
        button.classList.toggle(
          "active",
          button.dataset.colour ===
            colour
        );
      }
    );

    updateToolStates();
  }

  /* ---------------------------------------------------------
     BRUSH SIZE
  --------------------------------------------------------- */

  function updateBrushSize() {
    if (!brushSize) {
      return;
    }

    const value =
      Number(brushSize.value);

    if (
      Number.isFinite(value)
    ) {
      drawingState.size =
        Math.max(
          2,
          Math.min(
            18,
            value
          )
        );
    }
  }

  /* ---------------------------------------------------------
     ERASER
  --------------------------------------------------------- */

  function toggleEraser() {
    drawingState.erasing =
      !drawingState.erasing;

    updateToolStates();
  }

  /* ---------------------------------------------------------
     UNDO
  --------------------------------------------------------- */
function undoLastStroke() {
  if (
    drawingState.strokes.length === 0
  ) {
    return;
  }

  const lastStroke =
    drawingState.strokes.pop();

  drawingState.redoStrokes.push(
    lastStroke
  );

  redrawAllStrokes();

  updateToolStates();
}

  function redoLastStroke() {
  if (
    drawingState.redoStrokes.length === 0
  ) {
    return;
  }

  const restoredStroke =
    drawingState.redoStrokes.pop();

  drawingState.strokes.push(
    restoredStroke
  );

  redrawAllStrokes();

  updateToolStates();
}

  /* ---------------------------------------------------------
     CLEAR
  --------------------------------------------------------- */

  function clearAllDrawing() {
  drawingState.strokes = [];
  drawingState.redoStrokes = [];
  drawingState.currentStroke = null;

  redrawAllStrokes();

  updateToolStates();
}

  /* ---------------------------------------------------------
     TOOL UI STATE
  --------------------------------------------------------- */

  function updateToolStates() {
    stylusToggle.classList.toggle(
      "stylus-on",
      drawingState.enabled
    );

    stylusOff.classList.toggle(
      "stylus-off-active",
      !drawingState.enabled
    );

    if (eraserToggle) {
      eraserToggle.classList.toggle(
        "eraser-active",
        drawingState.erasing
      );
    }

    if (undoDrawing) {
      undoDrawing.disabled =
        drawingState.strokes.length === 0;
    }
if (redoDrawing) {
  redoDrawing.disabled =
    drawingState.redoStrokes.length === 0;
}

    stylusToggle.setAttribute(
      "aria-pressed",
      String(
        drawingState.enabled
      )
    );

    if (eraserToggle) {
      eraserToggle.setAttribute(
        "aria-pressed",
        String(
          drawingState.erasing
        )
      );
    }
  }

  /* ---------------------------------------------------------
     EVENT LISTENERS
  --------------------------------------------------------- */

  stylusToggle.addEventListener(
    "click",
    enableStylus
  );

  stylusOff.addEventListener(
    "click",
    disableStylus
  );

  colourOptions.forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          selectColour(
            button.dataset.colour
          );
        }
      );
    }
  );

  if (brushSize) {
    brushSize.addEventListener(
      "input",
      updateBrushSize
    );
  }

  if (eraserToggle) {
    eraserToggle.addEventListener(
      "click",
      toggleEraser
    );
  }

  if (undoDrawing) {
    undoDrawing.addEventListener(
      "click",
      undoLastStroke
    );
  }
  
  if (redoDrawing) {
  redoDrawing.addEventListener(
    "click",
    redoLastStroke
  );
}

  if (clearDrawing) {
    clearDrawing.addEventListener(
      "click",
      clearAllDrawing
    );
  }
if (drawingScrollButton) {
  drawingScrollButton.addEventListener(
    "click",
    scrollLessonDown
  );
}

  drawingCanvas.addEventListener(
    "pointerdown",
    startDrawing
  );

  drawingCanvas.addEventListener(
    "pointermove",
    continueDrawing
  );

  drawingCanvas.addEventListener(
    "pointerup",
    finishDrawing
  );

  drawingCanvas.addEventListener(
    "pointercancel",
    cancelDrawing
  );

  drawingCanvas.addEventListener(
    "pointerleave",
    (event) => {
      if (
        event.pointerType === "mouse" &&
        drawingState.drawing
      ) {
        continueDrawing(event);
      }
    }
  );

let redrawFrame = null;

function scheduleRedraw() {
  if (redrawFrame !== null) return;

  redrawFrame = requestAnimationFrame(() => {
    redrawFrame = null;
    redrawAllStrokes();
  });
}

window.addEventListener("scroll", scheduleRedraw, {
  passive: true
});

  window.addEventListener(
    "resize",
    resizeCanvas
  );

  /* ---------------------------------------------------------
     INITIALISE
  --------------------------------------------------------- */

  resizeCanvas();
  updateBrushSize();
  updateToolStates();

  /* ---------------------------------------------------------
     PUBLIC TEACHER-TOOLS API
  --------------------------------------------------------- */

  window.teacherDrawingSystem = {

    enable: enableStylus,

    disable: disableStylus,

    undo: undoLastStroke,

    redo: redoLastStroke,

    clear: clearAllDrawing,

    scrollDown: scrollLessonDown,

    getState: () => ({

      enabled:
        drawingState.enabled,

      colour:
        drawingState.colour,

      size:
        drawingState.size,

      erasing:
        drawingState.erasing,

      strokeCount:
        drawingState.strokes.length

    })

  };

})();
