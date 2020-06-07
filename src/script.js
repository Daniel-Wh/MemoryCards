import { elements } from "./js/views/base";
import Axios from "../node_modules/axios";

const url = "https://memoize-su.herokuapp.com";
// Keep track of current card
let currentActiveCard = 0;
let isLoggedIn = false;
let currentUser;

// Store DOM cards
let cardsEl = [];

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
    if (isLoggedIn) {
      pushCardToAPI({
        question: question,
        answer: answer,
        course: "computer science",
        owner_id: currentUser,
      });
    } else {
      setCardsData(cardsData);
    }
  }
});

async function pushCardToAPI(card) {
  const res = await Axios.post(`${url}/cards`, card).then((response) => {
    console.log(response);
  });
}

// Clear cards button
elements.clearBtn.addEventListener("click", () => {
  localStorage.clear();
  elements.cardsContainer.innerHTML = "";
  window.location.reload();
});

elements.login.addEventListener("click", () => {
  elements.loginContainer.classList.add("show-modal");
});
elements.loginModalClose.addEventListener("click", () => {
  elements.loginContainer.classList.remove("show-modal");
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

elements.navToggle.addEventListener("click", () => {
  document.body.classList.toggle("show-nav");
});

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
  const res = await Axios.post(`${url}/register`, {
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

elements.loginSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  const email = elements.loginEmail.value;
  const password = elements.loginPassword.value;
  if (email && password) {
    loginUser(email, password);
  }
});

async function loginUser(email, password) {
  const res = await Axios.post(`${url}/login`, {
    username: email,
    password: password,
  }).then((response) => {
    const data = response.data;
    if (response.status === 200) {
      // if user successfully logs in - jwt token also received
      isLoggedIn = true;
      elements.loginContainer.classList.remove("show-modal");
      elements.nav.classList.add("show-nav");
      currentUser = data.user.id;
      console.log(response);
      console.log(currentUser);
      getCardsFromAPI(currentUser);
    }
  });
}

async function getCardsFromAPI(userID) {
  const res = await Axios.get(`${url}/cards`, {
    params: {
      userID: userID,
    },
  }).then((response) => {
    const cards = response.data;
    elements.cardsContainer.innerHTML = "";
    cardsEl = [];
    currentActiveCard = 0;
    cards.forEach((card, index) => {
      createCard(card, index);
    });
  });
}
