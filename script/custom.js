let movieBoard = document.querySelector("#movieBoard");
let apikey = "56e4c11af3a58be9818d461a54ab6e64";

//---------------------------------------------
// movie 함수(api연결,데이터 선택,render호출)
//---------------------------------------------
let page = 1;
let currentPage = "now_palying";
let movie = async (lists, page = 1) => {
  //   console.log(lists);
  let url = `
https://api.themoviedb.org/3/movie/${lists}?api_key=${apikey}&language=ko-KR&page=${page}`;

  let morePage = document.querySelector("#more");
  morePage.addEventListener("click", async () => {
    page++;
    let url = `
https://api.themoviedb.org/3/movie/${lists}?api_key=${apikey}&language=ko-KR&page=${page}`;
    console.log(page);
    let response = await fetch(url);
    //json형태는 객체
    let data = await response.json();
    console.log(data);
    let movieList = data.results;
    render(movieList);
  });

  let response = await fetch(url);
  //json형태는 객체
  let data = await response.json();
  console.log(data);

  let movieList = data.results;
  render(movieList);
};

//---------------------------------------------
// render함수(화면에 보이기)
//---------------------------------------------

let render = (movieList) => {
  movieBoard.innerHTML = "";
  movieList.forEach((movie) => {
    // console.log(movie.title);
    // console.log(movie.poster_path);
    let card = `<div class="card"><img src="https://image.tmdb.org/t/p/w500${
      movie.poster_path
    }"</img>
    <h3>${movie.title}</h3>
    <div class="movieDetail">
    <h4 class="overview">${over(movie.overview, 100)}</h4>
    <h4 class="vote">평점:${movie.vote_average.toFixed(1)}</h4>
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
  return text.length > limit ? text.slice(0, limit) + "..." : text;
}
movie("now_playing");
//---------------------------------------------
// 검색
//---------------------------------------------

let searchInput = document.querySelector("#searchInput");
let searchBtn = document.querySelector("#searchBtn");
searchBtn.addEventListener("click", async () => {
  let keyword = searchInput.value.trim(); //trim=앞뒤공백 제거
  //   console.log(keyword);

  //유효성검사
  if (keyword == "") {
    alert("검색어를 입력하세요");
    return;
  }

  //   console.log(lists);
  let url = `
https://api.themoviedb.org/3/search/movie?query=${keyword}&api_key=${apikey}&language=ko-KR`;
  let response = await fetch(url);
  //json형태는 객체
  let data = await response.json();
  //   console.log(data);
  let movieList = data.results;
  //   console.log(movieList);
  render(movieList);
});

//1.검색어 띄어쓰기 무시하고 검색되게
//2. 현재 1페이지에 20개의 영화 렌딩 -> 더보기 누르면 더 나오게
//3.Overview, 평점 나오게 하기

//---------------------------------------------
// 더보기
//---------------------------------------------
