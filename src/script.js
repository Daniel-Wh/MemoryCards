import { elements } from "./js/views/base";
import Axios from "../node_modules/axios";

const url = "https://memoize-su.herokuapp.com";

let state = {
  currentActiveCard: 0,
  cardsEl: [],
  courses: [],
  cards: [],
};

// Store DOM cards
let cardsEl = [];
// Store card data
const cardsData = getCardsData();
if (!state.isLoggedIn) {
  elements.courseForm.classList.add("display-none");
  elements.nav.classList.add("display-none");
}
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
    if (state.isLoggedIn) {
      elements.courseName.textContent = data.course;
      state.currentCourse = data.course;
    }
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
  elements.currentEl.innerText = `${state.currentActiveCard + 1}/${
    cardsEl.length
  }`;
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
  cardsEl[state.currentActiveCard].className = "card left";

  state.currentActiveCard = state.currentActiveCard + 1;

  if (state.currentActiveCard > cardsEl.length - 1) {
    state.currentActiveCard = cardsEl.length - 1;
  }

  cardsEl[state.currentActiveCard].className = "card active";

  updateCurrentText();
});

// Prev button
elements.prevBtn.addEventListener("click", () => {
  cardsEl[state.currentActiveCard].className = "card right";

  state.currentActiveCard = state.currentActiveCard - 1;

  if (state.currentActiveCard < 0) {
    state.currentActiveCard = 0;
  }

  cardsEl[state.currentActiveCard].className = "card active";

  updateCurrentText();
});

// Show add container
elements.showBtn.addEventListener("click", () => {
  elements.addContainer.classList.add("show");
  if (state.isLoggedIn) {
    elements.courseForm.classList.remove("display-none");
    elements.courseText.textContent = state.currentCourse;
  }
});
// Hide add container
elements.hideBtn.addEventListener("click", () =>
  elements.addContainer.classList.remove("show")
);

// Add new card
elements.addCardBtn.addEventListener("click", () => {
  const question = elements.questionEl.value;
  const answer = elements.answerEl.value;
  const course = state.isLoggedIn ? elements.courseText.value : "n/a";

  if (question.trim() && answer.trim()) {
    const newCard = { question, answer, course };

    createCard(newCard);

    elements.questionEl.value = "";
    elements.answerEl.value = "";

    elements.addContainer.classList.remove("show");

    cardsData.push(newCard);
    if (state.isLoggedIn) {
      elements.courseName.textContent = course;
      pushCardToAPI({
        question: question,
        answer: answer,
        course: course,
        owner_id: state.currentUser,
      });
    } else {
      setCardsData(cardsData);
    }
  }
});

async function pushCardToAPI(card) {
  const res = await Axios.post(`${url}/cards`, card).then((response) => {
    if (response.status == 200) {
      state.cards.push(card);
      if (
        card.course !== state.currentCourse &&
        !state.courses.includes(card.course)
      ) {
        state.courses.push(card.course);
        state.currentCourse = card.course;
        loadCoursesToNav(card.course);
        loadCardsByCourse(card.course);
      } else {
        state.currentCourse = card.course;
        loadCardsByCourse(state.currentCourse);
      }
    }
  });
}

// Clear cards button
elements.clearBtn.addEventListener("click", () => {
  if (state.isLoggedIn) {
    // figure our the current set of cards
    // then delete - can probably just send the user id and subject
    removeCards(state.currentCourse, state.currentUser);
  } else {
    localStorage.clear();
    elements.cardsContainer.innerHTML = "";
    window.location.reload();
  }
});

async function removeCards(course, user) {
  const res = await Axios.post(`${url}/deleteCards`, {
    course: course,
    owner_id: user,
  }).then((response) => {
    if (response.status == 200) {
      // update dom/nav with current cards instance
      getCardsFromAPI(state.currentUser);
    }
  });
}

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
  elements.courseList.classList.toggle("display-none");
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
      state.isLoggedIn = true;
      console.log("logged in");
      elements.header.classList.add("display-none");
      elements.loginContainer.classList.remove("show-modal");
      elements.nav.classList.add("show-nav");
      elements.nav.classList.remove("display-none");
      elements.courseForm.classList.remove("display-none");
      state.currentUser = data.user.id;

      getCardsFromAPI(state.currentUser);
    }
  });
}

async function getCardsFromAPI(userID) {
  const res = await Axios.get(`${url}/cards`, {
    params: {
      userID: userID,
    },
  }).then((response) => {
    state.cards = response.data;
    elements.cardsContainer.innerHTML = "";
    updateCourses();
    cardsEl = [];
    state.currentActiveCard = 0;
    state.cards.forEach((card, index) => {
      if (card.course == state.currentCourse) {
        createCard(card, index);
      }
    });
  });
}

function updateCourses() {
  const cards = state.cards;
  state.courses = [];
  cards.forEach((card, index) => {
    if (index == 0) {
      state.currentCourse = card.course;
      state.courses.push(card.course);
    } else {
      if (!state.courses.includes(card.course)) {
        state.courses.push(card.course);
      }
    }
  });
  loadCoursesToNav();
}

function loadCoursesToNav() {
  const myNode = elements.courseList;
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }
  const firstEl = document.createElement("li");
  firstEl.innerHTML = `<a id="courses">Courses:</a><br><br><br>`;
  elements.courseList.insertAdjacentElement("beforeend", firstEl);
  state.courses.forEach((course) => {
    const el = document.createElement("li");
    el.innerHTML = `
    <a id="${course}" data-course="${course}">${course}</a>`;
    elements.courseList.insertAdjacentElement("beforeend", el);
    el.addEventListener("click", (e) => {
      const course = e.target.dataset;
      loadCardsByCourse(course.course);
    });
  });
}

function loadCardsByCourse(course) {
  state.currentCourse = course;
  state.currentActiveCard = 0;
  cardsEl = [];
  let index = 0;
  state.cards.forEach((card) => {
    if (card.course == course) {
      createCard(card, index);
      index++;
    }
  });
}
