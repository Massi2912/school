// ===== Passwort =====
const PASSWÖRTER = ["Lösungen", "LÖSUNGEN", "lösungen"];

// ===== 10 Fragen =====
const fragen = [
  {
    frage: "Was ist die Hauptstadt der Schweiz?",
    antworten: ["Zürich", "Bern", "Genf"],
    richtig: 1
  },
  {
    frage: "Wie viele Kantone hat die Schweiz?",
    antworten: ["20", "26", "23"],
    richtig: 1
  },
  {
    frage: "Welcher Fluss fliesst durch St. Gallen?",
    antworten: ["Rhein", "Thur", "Sitter"],
    richtig: 2
  },
  {
    frage: "Wie viele Kontinente gibt es auf der Erde?",
    antworten: ["5", "6", "7"],
    richtig: 2
  },
  {
    frage: "Welches chemische Symbol steht für Wasser?",
    antworten: ["CO\u2082", "H\u2082O", "NaCl"],
    richtig: 1
  },
  {
    frage: "Wer schrieb das Theaterstück \u00abRomeo und Julia\u00bb?",
    antworten: ["Johann W. von Goethe", "William Shakespeare", "Friedrich Schiller"],
    richtig: 1
  },
  {
    frage: "In welchem Jahr endete der Zweite Weltkrieg?",
    antworten: ["1943", "1918", "1945"],
    richtig: 2
  },
  {
    frage: "Welches ist das grösste Organ des menschlichen Körpers?",
    antworten: ["Leber", "Haut", "Lunge"],
    richtig: 1
  },
  {
    frage: "Welches ist das schnellste Landtier der Welt?",
    antworten: ["Gepard", "Strauss", "Pronghorn-Antilope"],
    richtig: 0
  },
  {
    frage: "Welches Land hat die längste Küstenlinie der Welt?",
    antworten: ["Australien", "Russland", "Kanada"],
    richtig: 2
  }
];

// ===== Versuche pro Frage =====
// 0 = noch kein Versuch, 1 = ein Fehlversuch, 2 = gesperrt (richtig oder 2x falsch)
const versuche = new Array(10).fill(0);

// ===== Kein Scrollen auf Passwort-Screen =====
document.body.classList.add('no-scroll');

// ===== Event Listeners =====
document.getElementById("pw-btn").addEventListener("click", checkPassword);
document.getElementById("pw-input").addEventListener("keydown", function(e) {
  if (e.key === "Enter") checkPassword();
});
document.getElementById("btn-evaluate").addEventListener("click", evaluate);
document.getElementById("btn-reset").addEventListener("click", resetQuiz);
document.getElementById("btn-close-popup").addEventListener("click", closePopup);

// ===== Passwort prüfen =====
function checkPassword() {
  const input = document.getElementById("pw-input").value;
  const errorMsg = document.getElementById("pw-error");
  const card = document.getElementById("pw-card");

  if (PASSWÖRTER.includes(input)) {
    document.body.classList.remove('no-scroll');
    document.getElementById("password-screen").classList.remove("active");
    const quizScreen = document.getElementById("quiz-screen");
    quizScreen.classList.add("active");
    renderQuiz();
    window.scrollTo({ top: 0, behavior: "instant" });
  } else {
    errorMsg.classList.remove("hidden");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
    document.getElementById("pw-input").value = "";
    document.getElementById("pw-input").focus();
  }
}

// ===== Quiz rendern =====
function renderQuiz() {
  const wrapper = document.getElementById("questions-wrapper");
  wrapper.innerHTML = "";
  updateProgress(0);
  versuche.fill(0);

  fragen.forEach((f, index) => {
    const card = document.createElement("div");
    card.className = "question-card";
    card.id = `q-card-${index}`;

    const qtop = document.createElement("div");
    qtop.className = "q-top";

    const badge = document.createElement("span");
    badge.className = "q-badge";
    badge.textContent = `FRAGE ${index + 1} / ${fragen.length}`;
    qtop.appendChild(badge);

    const frageText = document.createElement("p");
    frageText.className = "question-text";
    frageText.textContent = f.frage;

    const answersDiv = document.createElement("div");
    answersDiv.className = "answers";

    f.antworten.forEach((antwort, aIndex) => {
      const label = document.createElement("label");
      label.className = "answer-label";
      label.id = `q${index}-a${aIndex}`;

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `frage-${index}`;
      radio.value = aIndex;
      radio.addEventListener("change", updateProgressFromAnswers);

      label.appendChild(radio);
      label.appendChild(document.createTextNode(antwort));
      answersDiv.appendChild(label);
    });

    const feedback = document.createElement("p");
    feedback.className = "feedback-text";
    feedback.id = `feedback-${index}`;

    card.appendChild(qtop);
    card.appendChild(frageText);
    card.appendChild(answersDiv);
    card.appendChild(feedback);
    wrapper.appendChild(card);
  });
}

// ===== Progress Bar =====
function updateProgressFromAnswers() {
  const answered = fragen.filter((_, i) =>
    document.querySelector(`input[name="frage-${i}"]:checked`)
  ).length;
  updateProgress((answered / fragen.length) * 100);
}

function updateProgress(pct) {
  document.getElementById("progress-bar").style.width = pct + "%";
}

// ===== Auswerten =====
function evaluate() {
  let richtigCount = 0;
  let alleRichtig = true;
  let erstesOffenes = null;

  fragen.forEach((f, index) => {
    const card = document.getElementById(`q-card-${index}`);
    const feedback = document.getElementById(`feedback-${index}`);

    // Bereits korrekt beantwortet – überspringen
    if (versuche[index] === 2 && card.classList.contains("correct")) {
      richtigCount++;
      return;
    }

    // Bereits 2x falsch und gesperrt – prüfen ob inzwischen richtig geklickt
    if (versuche[index] === 2 && card.classList.contains("wrong")) {
      const selected = document.querySelector(`input[name="frage-${index}"]:checked`);
      if (selected && parseInt(selected.value) === f.richtig) {
        // Richtige Antwort gewählt – als korrekt markieren
        versuche[index] = 2;
        richtigCount++;
        card.classList.remove("wrong");
        card.classList.add("correct");
        f.antworten.forEach((_, aIndex) => {
          document.getElementById(`q${index}-a${aIndex}`).classList.remove("highlight-correct", "highlight-wrong");
        });
        document.getElementById(`q${index}-a${f.richtig}`).classList.add("highlight-correct");
        const feedback = document.getElementById(`feedback-${index}`);
        feedback.textContent = "\u2713 Richtig!";
        feedback.className = "feedback-text ok";
        card.querySelectorAll("input[type='radio']").forEach(r => r.disabled = true);
        card.querySelectorAll(".answer-label").forEach(l => l.style.cursor = "default");
      } else {
        alleRichtig = false;
      }
      return;
    }

    const selected = document.querySelector(`input[name="frage-${index}"]:checked`);

    if (!selected) {
      alleRichtig = false;
      card.classList.remove("correct");
      card.classList.add("wrong");
      feedback.textContent = "\u26A0 Bitte eine Antwort auswählen!";
      feedback.className = "feedback-text bad";
      if (!erstesOffenes) erstesOffenes = card;
      return;
    }

    const gewählt = parseInt(selected.value);

    // Reset Highlights
    f.antworten.forEach((_, aIndex) => {
      document.getElementById(`q${index}-a${aIndex}`)
        .classList.remove("highlight-correct", "highlight-wrong");
    });
    card.classList.remove("correct", "wrong");
    feedback.textContent = "";
    feedback.className = "feedback-text";

    if (gewählt === f.richtig) {
      // ✓ Richtig – sperren
      versuche[index] = 2;
      richtigCount++;
      card.classList.add("correct");
      document.getElementById(`q${index}-a${gewählt}`).classList.add("highlight-correct");
      feedback.textContent = "\u2713 Richtig!";
      feedback.className = "feedback-text ok";
      // Radio-Buttons deaktivieren
      card.querySelectorAll("input[type='radio']").forEach(r => r.disabled = true);
      card.querySelectorAll(".answer-label").forEach(l => l.style.cursor = "default");
    } else {
      alleRichtig = false;
      versuche[index]++;

      if (versuche[index] === 1) {
        // Erster Fehlversuch – noch ein Versuch, keine Lösung zeigen
        card.classList.add("wrong");
        document.getElementById(`q${index}-a${gewählt}`).classList.add("highlight-wrong");
        feedback.textContent = "\u2717 Falsch – du hast noch einen Versuch!";
        feedback.className = "feedback-text bad";
        // Falsch gewählte Antwort deselektieren und sperren
        selected.checked = false;
        selected.disabled = true;
        document.getElementById(`q${index}-a${gewählt}`).style.pointerEvents = "none";
        document.getElementById(`q${index}-a${gewählt}`).style.cursor = "default";
        if (!erstesOffenes) erstesOffenes = card;
      } else {
        // Zweiter Fehlversuch – Lösung zeigen, nur falsche Antworten sperren
        versuche[index] = 2;
        card.classList.add("wrong");
        document.getElementById(`q${index}-a${gewählt}`).classList.add("highlight-wrong");
        document.getElementById(`q${index}-a${f.richtig}`).classList.add("highlight-correct");
        feedback.textContent = `\u2717 Falsch! W\u00e4hle die gr\u00fcne Antwort um fortzufahren.`;
        feedback.className = "feedback-text bad";
        // Nur die falschen Antworten sperren, richtige bleibt anwählbar
        f.antworten.forEach((_, aIndex) => {
          if (aIndex !== f.richtig) {
            const radio = card.querySelector(`input[name="frage-${index}"][value="${aIndex}"]`);
            if (radio) radio.disabled = true;
            document.getElementById(`q${index}-a${aIndex}`).style.cursor = "default";
            document.getElementById(`q${index}-a${aIndex}`).style.pointerEvents = "none";
          }
        });
        if (!erstesOffenes) erstesOffenes = card;
      }
    }
  });

  // Fortschritt: nur gesperrte richtige Antworten zählen
  const gesperrtRichtig = fragen.filter((f, i) => {
    const card = document.getElementById(`q-card-${i}`);
    return versuche[i] === 2 && card.classList.contains("correct");
  }).length;
  updateProgress((gesperrtRichtig / fragen.length) * 100);

  // Alle korrekt?
  const alleGesperrt = versuche.every(v => v === 2);
  if (alleGesperrt && gesperrtRichtig === fragen.length) {
    setTimeout(() => {
      document.getElementById("popup-overlay").classList.remove("popup-hidden");
    }, 500);
  } else if (erstesOffenes) {
    erstesOffenes.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function closePopup() {
  document.getElementById("popup-overlay").classList.add("popup-hidden");
  location.reload();
}

function resetQuiz() {
  renderQuiz();
  window.scrollTo({ top: 0, behavior: "smooth" });
}