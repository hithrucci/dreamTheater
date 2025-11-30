// ---------------------------------------------
// header search icon (검색창 열기)
// ---------------------------------------------
let mag = document.querySelector("header #search i");

$(function () {
  $(mag).on("click", function () {
    $("#search input").toggleClass("is-on");
  });

  $("header").on("mouseenter", function () {
    $(".gnb li a")
      .stop(true)
      .animate({ paddingLeft: 40, paddingRight: 40 }, 300);
  });

  $("header").on("mouseleave", function () {
    $(".gnb li a")
      .stop(true)
      .animate({ paddingLeft: 10, paddingRight: 10 }, 300);
  });
});

// ---------------------------------------------
// 전역 변수
// ---------------------------------------------
let movieBoard = document.querySelector("#movieBoard");
let slideList = document.querySelector("#slide .slide-list");
let apikey = "56e4c11af3a58be9818d461a54ab6e64";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w400";

let totalSlides = 0;
let currentSlideIndex = 0;
let autoTimer = null;
let resumeTimer = null;
const SLIDE_INTERVAL = 4000; // 자동 슬라이드 간격(ms)

// ---------------------------------------------
// popular 영화 슬라이드 (visual용)
// ---------------------------------------------
async function loadPopularSlide() {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}&language=ko-KR&page=1`;

  const response = await fetch(url);
  const data = await response.json();
  const movieList = data.results;

  renderSlide(movieList);
}

function renderSlide(movieList) {
  const list = movieList.slice(0, 10);

  slideList.innerHTML = list
    .map(
      (movie, index) => `
      <li class="slide-item" data-rank="${index + 1}">
        <img
          src="${IMAGE_BASE_URL}${movie.poster_path}"
          alt="${movie.title}"
        />

        <div class="slide-overlay">
          <div>
            <h3 class="slide-title">${movie.title}</h3>
            <p class="slide-overview">${over(movie.overview || "", 120)}</p>
          </div>
        </div>

        <div class="bottomWrap">
          <div class="detail">
            <img src="../images/info.png" alt="영화정보" />
            영화정보
          </div>
          <div class="score">
            <img src="../images/star.png" alt="별점" />
            ${movie.vote_average.toFixed(1)}
          </div>
        </div>
      </li>
    `
    )
    .join("");

  totalSlides = list.length;

  const slideItems = document.querySelectorAll("#slide .slide-item");
  slideItems.forEach((item, index) => {
    if (index % 2 === 1) item.classList.add("down");
  });

  initVisualSlider();
}

// ---------------------------------------------
// visual 슬라이더 – 무한 캐러셀 + 진행바
// ---------------------------------------------
function initVisualSlider() {
  const $list = $("#slide .slide-list");
  let $items = $list.children(".slide-item");
  const $progressBar = $(".visual-progress-bar");
  const $prevBtn = $(".visual-arrow.prev");
  const $nextBtn = $(".visual-arrow.next");

  if ($items.length === 0) return;

  // li 하나의 전체 너비(패딩 + 보더 + margin-right 포함)
  const itemWidth = $items.outerWidth(true);

  // 카드 클릭 시 오버레이 토글
  $list.off("click", ".slide-item").on("click", ".slide-item", function () {
    $(this).toggleClass("on");
  });

  // 진행바 업데이트 (슬라이드 인덱스 기준)
  function updateProgress() {
    if (totalSlides <= 1) {
      $progressBar.css("width", "100%");
      return;
    }

    const idx = ((currentSlideIndex % totalSlides) + totalSlides) % totalSlides;
    const ratio = idx / (totalSlides - 1);
    $progressBar.css("width", ratio * 100 + "%");
  }

  // 무한 캐러셀 이동
  function slideNext() {
    $list.stop().animate({ marginLeft: -itemWidth }, 600, function () {
      $(this).children().first().appendTo(this);
      $(this).css({ marginLeft: 0 });
      $items = $list.children(".slide-item");
    });

    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    updateProgress();
  }

  function slidePrev() {
    $list.children().last().prependTo($list);
    $list.css({ marginLeft: -itemWidth });
    $list.stop().animate({ marginLeft: 0 }, 600, function () {
      $items = $list.children(".slide-item");
    });

    currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    updateProgress();
  }

  // 자동 슬라이드
  function startAuto() {
    clearInterval(autoTimer);
    clearTimeout(resumeTimer);

    autoTimer = setInterval(() => {
      slideNext();
    }, SLIDE_INTERVAL);
  }

  function pauseAutoThenResume() {
    clearInterval(autoTimer);
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAuto, 8000);
  }

  // 화살표 버튼
  $prevBtn.off("click").on("click", function () {
    slidePrev();
    pauseAutoThenResume();
  });

  $nextBtn.off("click").on("click", function () {
    slideNext();
    pauseAutoThenResume();
  });

  // 초기 시작
  currentSlideIndex = 0;
  updateProgress();
  startAuto();
}

// visual 슬라이드 로드
loadPopularSlide();

// ---------------------------------------------
// 영화 목록 불러오기 (현재상영작 등)
// ---------------------------------------------
let page = 1;

let movie = async (lists, page = 1) => {
  let url = `https://api.themoviedb.org/3/movie/${lists}?api_key=${apikey}&language=ko-KR&page=${page}`;

  let morePage = document.querySelector("#more");

  morePage.addEventListener("click", async () => {
    page++;
    let url = `https://api.themoviedb.org/3/movie/${lists}?api_key=${apikey}&language=ko-KR&page=${page}`;
    let response = await fetch(url);
    let data = await response.json();
    let movieList = data.results;
    render(movieList);
  });

  let response = await fetch(url);
  let data = await response.json();
  let movieList = data.results;
  render(movieList);
};

// ---------------------------------------------
// 리스트 렌더링
// ---------------------------------------------
let render = (movieList) => {
  movieBoard.innerHTML = "";
  movieList.forEach((movie) => {
    let card = `
      <div class="card">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" />
        <h3>${movie.title}</h3>
        <div class="movieDetail">
          <h4 class="overview">${over(movie.overview, 100)}</h4>
          <h4 class="vote">평점: ${movie.vote_average.toFixed(1)}</h4>
        </div>
      </div>`;

    movieBoard.innerHTML += card;

    let cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.classList.add("on");
      });
      card.addEventListener("mouseleave", () => {
        card.classList.remove("on");
      });
    });
  });
};

function over(text, limit) {
  if (!text) return "";
  return text.length > limit ? text.slice(0, limit) + "..." : text;
}

// 기본: 현재 상영작 로드
movie("now_playing");

// ---------------------------------------------
// 검색
// ---------------------------------------------
let searchInput = document.querySelector("#searchInput");
let searchBtn = document.querySelector("#searchBtn"); // 없어도 에러 안 나게 처리할 거임

async function handleSearch() {
  if (!searchInput) return;

  let keyword = searchInput.value.trim();

  if (keyword === "") {
    alert("검색어를 입력하세요");
    return;
  }

  let url = `https://api.themoviedb.org/3/search/movie?query=${keyword}&api_key=${apikey}&language=ko-KR`;
  let response = await fetch(url);
  let data = await response.json();
  let movieList = data.results;

  render(movieList);

  // 검색 후 화면을 visual 아래로 이동 (100vh)
  window.scrollTo({
    top: window.innerHeight,
    behavior: "smooth",
  });
}

// 버튼이 실제로 있다면 클릭으로도 검색 가능
if (searchBtn) {
  searchBtn.addEventListener("click", handleSearch);
}

// Enter로 검색
if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });
}
