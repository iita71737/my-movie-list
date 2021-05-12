const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const MOVIES_PER_PAGE = 12 
let filteredMovies = []
let showmoviebylist = false
let nowpage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input') 
const searchMsg = document.querySelector('#search-message')
const showWay = document.querySelector('#show-way-select')

//監聽表單提交事件
searchForm.addEventListener('input', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  //條件篩選
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    let msgHTML = `您輸入的關鍵字：${keyword} 沒有符合條件的電影` 
    searchMsg.innerHTML = msgHTML
  } else {
    searchMsg.innerHTML = `已比對到${filteredMovies.length}筆資料`
  }
  //重製分頁器
  renderPaginator(filteredMovies.length)  //新增這裡
  //預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1))  //修改這裡
})


function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image, id 隨著每個 item 改變
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${
          POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function renderMovieListByList(data) {
  let rawHTML = `<ul class="list-group list-container col-12">`
  data.forEach((item) => {
    // title, image, id 隨著每個 item 改變
    rawHTML += `
      <li class="list-group-item">
            <span class="col-10 movie-title" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">${item.title}</span>
            <button class="btn btn-primary btn-show-movie col-1" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite col-1" data-id="${item.id}">+</button>     
      </li>
    `
  })
  rawHTML += `</ul>`
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function getMoviesByPage(page) {

  const data = filteredMovies.length ? filteredMovies : movies
  // page 1 >>>  movies 0 - 11
  // page 2 >>>  movies 12 - 23
  // page 3 >>>  movies 24 - 35
  // ...
  //計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''
  
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  //tag <a></a>
  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  nowpage = page
  //更新畫面
  if ( showmoviebylist === true ) {
    renderMovieListByList(getMoviesByPage(page))
  }
  if (showmoviebylist !== true) {
    renderMovieList(getMoviesByPage(page))
  }
  //console.log(showmoviebylist)
})

// 監聽 data panel
dataPanel.addEventListener('click',function onPanelClicked(event){
  if (event.target.matches('.btn-show-movie')) {
    //console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
  
})

showWay.addEventListener('click', function onSelectBtnClicked (e) {
  if(e.target.matches('.show-list-link')){
    showmoviebylist = true
    renderPaginator(movies.length)
    renderMovieListByList(getMoviesByPage(nowpage))
  }
  if(e.target.matches('.show-card-link')){
    showmoviebylist = false
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(nowpage))
  }
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(6)) 
  })
  .catch((err) => console.log(err))