import { elements } from "./js/views/base";
import Axios from "../node_modules/axios";

// Keep track of current card
let currentActiveCard = 0;

// Store DOM cards
const cardsEl = [];

// Store card data
const cardsData = getCardsData();

// Create all cards
function createCards() {
  if (cardsData.length > 0) {
    cardsData.forEach((data, index) => createCard(data, index));
  }
}

// Create a single card in DOM
function createCard(data, index) {
  const card = document.createElement("div");
  card.classList.add("card");

  if (index === 0) {
    card.classList.add("active");
  }

  card.innerHTML = `
  <div class="inner-card">
  <div class="inner-card-front">
    <p>
      ${data.question}
    </p>
  </div>
  <div class="inner-card-back">
    <p>
      ${data.answer}
    </p>
  </div>
</div>
  `;

  card.addEventListener("click", () => card.classList.toggle("show-answer"));

  // Add to DOM cards
  cardsEl.push(card);

  elements.cardsContainer.appendChild(card);

  updateCurrentText();
}

// Show number of cards
function updateCurrentText() {
  elements.currentEl.innerText = `${currentActiveCard + 1}/${cardsEl.length}`;
}

// Get cards from local storage
function getCardsData() {
  const cards = JSON.parse(localStorage.getItem("cards"));
  return cards === null ? [] : cards;
}

// Add card to local storage
function setCardsData(cards) {
  localStorage.setItem("cards", JSON.stringify(cards));
  // window.location.reload();
}

createCards();

// Event listeners

// Next button
elements.nextBtn.addEventListener("click", () => {
  cardsEl[currentActiveCard].className = "card left";

  currentActiveCard = currentActiveCard + 1;

  if (currentActiveCard > cardsEl.length - 1) {
    currentActiveCard = cardsEl.length - 1;
  }

  cardsEl[currentActiveCard].className = "card active";

  updateCurrentText();
});

// Prev button
elements.prevBtn.addEventListener("click", () => {
  cardsEl[currentActiveCard].className = "card right";

  currentActiveCard = currentActiveCard - 1;

  if (currentActiveCard < 0) {
    currentActiveCard = 0;
  }

  cardsEl[currentActiveCard].className = "card active";

  updateCurrentText();
});

// Show add container
elements.showBtn.addEventListener("click", () =>
  elements.addContainer.classList.add("show")
);
// Hide add container
elements.hideBtn.addEventListener("click", () =>
  elements.addContainer.classList.remove("show")
);

// Add new card
elements.addCardBtn.addEventListener("click", () => {
  const question = elements.questionEl.value;
  const answer = elements.answerEl.value;

  if (question.trim() && answer.trim()) {
    const newCard = { question, answer };

    createCard(newCard);

    elements.questionEl.value = "";
    elements.answerEl.value = "";

    elements.addContainer.classList.remove("show");

    cardsData.push(newCard);
    setCardsData(cardsData);
  }
});

// Clear cards button
elements.clearBtn.addEventListener("click", () => {
  localStorage.clear();
  elements.cardsContainer.innerHTML = "";
  window.location.reload();
});

elements.open.addEventListener("click", () => {
  elements.modal.classList.add("show-modal");
});

elements.close.addEventListener("click", () => {
  elements.modal.classList.remove("show-modal");
});

window.addEventListener("click", (e) =>
  e.target == elements.modal
    ? elements.modal.classList.remove("show-modal")
    : false
);

elements.registerSubmit.addEventListener("click", (e) => {
  console.log("register User submitted");
  e.preventDefault();
  const emailVal = elements.emailEl.value;
  const password = elements.passwordEl.value;
  const password2 = elements.password2el.value;
  if (password === password2) {
    registerUser(emailVal, password);
  }
});

async function registerUser(email, password) {
  console.log("call has been made to register user");
  const res = await Axios.post("http://127.0.0.1:5000/register", {
    username: email,
    password: password,
  }).then(
    (response) => {
      if (response.status === 201) {
        elements.modal.classList.remove("show-modal");
        alert("Your account has been created ");
      } else {
        console.log(response.statusText);
      }
    },
    (error) => console.log(error)
  );
}
