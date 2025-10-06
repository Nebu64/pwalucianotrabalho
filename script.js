// ==================== ELEMENTOS DOM ====================
const navHome = document.getElementById('nav-home');
const navFilmes = document.getElementById('nav-filmes');
const navSeries = document.getElementById('nav-series');
const homeSection = document.getElementById('home-section');
const playerSection = document.getElementById('player-section');
const carouselLancamentos = document.getElementById('carousel-lancamentos');
const carouselPopulares = document.getElementById('carousel-populares');
const playerInfo = document.getElementById('player-info');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchAnimes = document.getElementById('search-animes');
const episodesSection = document.getElementById('episodes-section');
const episodesList = document.getElementById('episodes-list');
const closeEpisodesBtn = document.getElementById('close-episodes');
const backToHomeBtn = document.getElementById('back-to-home');
const generosSection = document.getElementById('generos-section');
const generosListDiv = document.getElementById('generos-list');
const generosAnimesResult = document.getElementById('generos-animes-result');

let navGeneros;
function criarNavGeneros() {
  if (!document.getElementById('nav-generos')) {
    const nav = document.querySelector('nav');
    navGeneros = document.createElement('a');
    navGeneros.href = "#";
    navGeneros.id = "nav-generos";
    navGeneros.className = "nav-link";
    navGeneros.textContent = "Gêneros";
    nav.appendChild(navGeneros);
  } else {
    navGeneros = document.getElementById('nav-generos');
  }
}
criarNavGeneros();

let filmesPage = 1, filmesEnd = false, carregandoFilmes = false;
let seriesPage = 1, seriesEnd = false, carregandoSeries = false;

navHome.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('home');
});
navFilmes.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('filmes');
});
navSeries.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('series');
});
navGeneros.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('generos');
  carregarGeneros();
  generosAnimesResult.innerHTML = '';
});

function showSection(section) {
  homeSection.classList.add('hidden');
  playerSection.classList.add('hidden');
  searchResults.classList.add('hidden');
  episodesSection.classList.add('hidden');
  generosSection.classList.add('hidden');
  navHome.classList.remove('active');
  navFilmes.classList.remove('active');
  navSeries.classList.remove('active');
  navGeneros.classList.remove('active');
  document.getElementById('filmes-lista')?.remove();
  document.getElementById('series-lista')?.remove();

  document.body.classList.remove('home-active');
  window.onscroll = null;

  if (section === 'home') {
    homeSection.classList.remove('hidden');
    navHome.classList.add('active');
    document.body.classList.add('home-active');
  } else if (section === 'filmes') {
    homeSection.classList.remove('hidden');
    navFilmes.classList.add('active');
    exibirListaFilmes(true);
  } else if (section === 'series') {
    homeSection.classList.remove('hidden');
    navSeries.classList.add('active');
    exibirListaSeries(true);
  } else if (section === 'generos') {
    generosSection.classList.remove('hidden');
    navGeneros.classList.add('active');
  }
}

async function exibirListaFilmes(reset = false) {
  if (carregandoFilmes || filmesEnd) return;
  carregandoFilmes = true;
  let container = document.getElementById('filmes-lista');
  if (reset || !container) {
    filmesPage = 1;
    filmesEnd = false;
    container?.remove();
    container = document.createElement('div');
    container.id = 'filmes-lista';
    const titulo = document.createElement('h2');
    titulo.textContent = 'Filmes';
    container.appendChild(titulo);

    const grid = document.createElement('div');
    grid.className = 'filmes-grid';
    container.appendChild(grid);

    homeSection.appendChild(container);
  }
  container.style.display = '';
  let grid = container.querySelector('.filmes-grid');
  let loader = document.createElement("p");
  loader.innerText = "Carregando...";
  loader.id = "filmes-loader";
  grid.appendChild(loader);

  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?type=movie&order_by=score&sort=desc&page=${filmesPage}&limit=24`);
    const data = await res.json();
    const lista = (data.data || []).filter(anime => !isAnimeSexual(anime));
    if (!lista.length) {
      filmesEnd = true;
      loader.innerText = filmesPage === 1 ? "Nenhum filme encontrado." : "Fim da lista.";
      carregandoFilmes = false;
      return;
    }
    lista.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'filme-serie-card';
      card.innerHTML = `
        <img src="${anime.images.webp?.image_url}" alt="${anime.title}">
        <div class="filme-serie-info">
          <h4>${anime.title}</h4>
          <span class="filme-serie-ano">${anime.aired?.prop?.from?.year || ""}</span>
        </div>
      `;
      card.addEventListener('click', () => abrirPlayerFilme(anime));
      grid.appendChild(card);
    });
    filmesPage++;
    if (data.pagination?.has_next_page === false) filmesEnd = true;
    loader.remove();
  } catch {
    loader.innerText = "Erro ao carregar filmes.";
  }
  carregandoFilmes = false;
  window.onscroll = infiniteScrollFilmes;
}

function infiniteScrollFilmes() {
  if (filmesEnd || carregandoFilmes) return;
  const container = document.getElementById('filmes-lista');
  if (!container) return;
  const grid = container.querySelector('.filmes-grid');
  if (!grid) return;
  if ((window.innerHeight + window.scrollY) >= (grid.offsetTop + grid.offsetHeight - 400)) {
    exibirListaFilmes(false);
  }
}

async function exibirListaSeries(reset = false) {
  if (carregandoSeries || seriesEnd) return;
  carregandoSeries = true;
  let container = document.getElementById('series-lista');
  if (reset || !container) {
    seriesPage = 1;
    seriesEnd = false;
    container?.remove();
    container = document.createElement('div');
    container.id = 'series-lista';
    const titulo = document.createElement('h2');
    titulo.textContent = 'Séries';
    container.appendChild(titulo);

    const grid = document.createElement('div');
    grid.className = 'filmes-grid';
    container.appendChild(grid);

    homeSection.appendChild(container);
  }
  container.style.display = '';
  let grid = container.querySelector('.filmes-grid');
  let loader = document.createElement("p");
  loader.innerText = "Carregando...";
  loader.id = "series-loader";
  grid.appendChild(loader);

  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?type=tv&order_by=score&sort=desc&page=${seriesPage}&limit=24`);
    const data = await res.json();
    const lista = (data.data || []).filter(anime => !isAnimeSexual(anime));
    if (!lista.length) {
      seriesEnd = true;
      loader.innerText = seriesPage === 1 ? "Nenhuma série encontrada." : "Fim da lista.";
      carregandoSeries = false;
      return;
    }
    lista.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'filme-serie-card';
      card.innerHTML = `
        <img src="${anime.images.webp?.image_url}" alt="${anime.title}">
        <div class="filme-serie-info">
          <h4>${anime.title}</h4>
          <span class="filme-serie-ano">${anime.aired?.prop?.from?.year || ""}</span>
        </div>
      `;
      card.addEventListener('click', () => abrirPlayerGenero(anime));
      grid.appendChild(card);
    });
    seriesPage++;
    if (data.pagination?.has_next_page === false) seriesEnd = true;
    loader.remove();
  } catch {
    loader.innerText = "Erro ao carregar séries.";
  }
  carregandoSeries = false;
  window.onscroll = infiniteScrollSeries;
}

function infiniteScrollSeries() {
  if (seriesEnd || carregandoSeries) return;
  const container = document.getElementById('series-lista');
  if (!container) return;
  const grid = container.querySelector('.filmes-grid');
  if (!grid) return;
  if ((window.innerHeight + window.scrollY) >= (grid.offsetTop + grid.offsetHeight - 400)) {
    exibirListaSeries(false);
  }
}

let generosPage = 1;
let generosEnd = false;
let generosAtivos = [];
let generosCarregando = false;

document.body.addEventListener('change', function(e) {
  if (!e.target.closest('#generos-list input[type="checkbox"]')) return;
  generosAtivos = Array.from(document.querySelectorAll('#generos-list input[type="checkbox"]:checked')).map(cb => cb.value);
  generosPage = 1;
  generosEnd = false;
  generosAnimesResult.innerHTML = '';
  if (!generosAtivos.length) {
    generosAnimesResult.innerHTML = '<p>Selecione ao menos um gênero para ver resultados.</p>';
    window.onscroll = null;
    return;
  }
  carregarAnimesGenero(true);
});

async function carregarGeneros() {
  generosListDiv.innerHTML = 'Carregando...';
  try {
    const res = await fetch("https://api.jikan.moe/v4/genres/anime");
    const data = await res.json();
    const sexualGenres = ["hentai", "ecchi", "erotico", "erótico"];
    const lista = (data.data || [])
      .filter(g => !sexualGenres.includes(g.name.toLowerCase()))
      .map(g =>
        `<label><input type="checkbox" value="${g.mal_id}"> ${g.name}</label>`
      ).join('');
    generosListDiv.innerHTML = lista;
  } catch {
    generosListDiv.innerHTML = 'Erro ao carregar gêneros.';
  }
}

async function carregarAnimesGenero(reset = false) {
  if (generosCarregando || generosEnd || !generosAtivos.length) return;
  generosCarregando = true;
  if (reset) generosAnimesResult.innerHTML = '';
  let grid = generosAnimesResult.querySelector('.generos-grid');
  if (!grid || reset) {
    generosAnimesResult.innerHTML = '';
    grid = document.createElement('div');
    grid.className = 'generos-grid';
    generosAnimesResult.appendChild(grid);
  }
  let loader = document.createElement('p');
  loader.innerText = 'Carregando...';
  loader.id = 'generos-loader';
  grid.appendChild(loader);

  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?genres=${generosAtivos.join(',')}&order_by=score&sort=desc&page=${generosPage}&limit=24`);
    const data = await res.json();
    const animes = (data.data || []).filter(anime => !isAnimeSexual(anime));
    loader.remove();
    if (!animes.length) {
      generosEnd = true;
      if (generosPage === 1) generosAnimesResult.innerHTML = '<p>Nenhum anime encontrado para o(s) gênero(s) selecionado(s).</p>';
      return;
    }
    animes.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'generos-anime-card';
      card.innerHTML = `
        <img src="${anime.images.webp.image_url}" alt="${anime.title}">
        <h4>${anime.title}</h4>
      `;
      card.addEventListener('click', () => abrirPlayerGenero(anime));
      grid.appendChild(card);
    });
    generosPage++;
    if (data.pagination?.has_next_page === false) generosEnd = true;
  } catch {
    loader.innerText = 'Erro ao buscar animes.';
  }
  generosCarregando = false;
  window.onscroll = infiniteScrollGeneros;
}

function infiniteScrollGeneros() {
  if (generosEnd || generosCarregando) return;
  const grid = generosAnimesResult.querySelector('.generos-grid');
  if (!grid) return;
  if ((window.innerHeight + window.scrollY) >= (grid.offsetTop + grid.offsetHeight - 400)) {
    carregarAnimesGenero(false);
  }
}

async function abrirPlayerGenero(anime) {
  esconderTudoMenosPlayer();
  let genresList = (anime.genres || []).map(g => g.name);
  let genresDisplay = genresList.length ? `<span style="font-size:0.98em;">Gêneros: <b>${genresList.join(', ')}</b></span>` : '';
  let idDisplay = anime.mal_id ? `<span style="font-size:0.98em;">ID: <b>${anime.mal_id}</b></span>` : '';
  playerInfo.innerHTML = `
    <h2>${anime.title}</h2>
    ${genresDisplay ? genresDisplay + " &nbsp; " : ""}${idDisplay}
    <p>${anime.synopsis ? `<b>Sinopse:</b> ${anime.synopsis}` : "Sem sinopse."}</p>
    <p><b>Data de Lançamento:</b> ${anime.aired?.prop?.from?.year || "?"}</p>
    <p><b>Duração:</b> ${anime.duration || "?"}</p>
    <p><b>Nota:</b> ${anime.score || "?"}</p>
    <div class="video-player"></div>
    <div id="player-episode-main"></div>
    <div id="player-episodes-list-area"></div>
  `;

  const videoPlayerDiv = document.querySelector('.video-player');
  videoPlayerDiv.innerHTML = `<p>Carregando trailer...</p>`;

  let trailerVideoId = anime.trailer?.youtube_id || null;
  if (!trailerVideoId) {
    videoPlayerDiv.innerHTML = `<p>Trailer não encontrado.</p>`;
  } else {
    videoPlayerDiv.innerHTML = `
      <iframe width="640" height="360"
        src="https://www.youtube.com/embed/${trailerVideoId}"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen>
      </iframe>
    `;
  }

  if (anime.type === 'tv' || anime.episodes > 1) {
    mostrarEpisodiosNoPlayer(anime.mal_id, anime.title);
  }
}

async function mostrarEpisodiosNoPlayer(mal_id, animeTitle) {
  const area = document.getElementById('player-episodes-list-area');
  if (!area) return;
  area.innerHTML = `<h3 style="margin-top:28px;">Episódios</h3><ul id="player-episodes-list"><li>Carregando episódios...</li></ul>`;
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${mal_id}/episodes`);
    const data = await res.json();
    const list = document.getElementById('player-episodes-list');
    if (!data.data || !data.data.length) {
      list.innerHTML = `<li>Nenhum episódio encontrado.</li>`;
      return;
    }
    list.innerHTML = "";
    data.data.forEach(ep => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div style="margin-bottom:4px;"><b>Ep. ${ep.mal_id || ep.episode_id}: ${ep.title || "Sem título"}</b></div>
        ${ep.synopsis ? `<div style="font-size:0.97em;color:#bbb;margin-bottom:4px;">${ep.synopsis}</div>` : ""}
      `;
      const btn = document.createElement('button');
      btn.textContent = "Assistir";
      btn.onclick = () => mostrarEpisodioSelecionadoNoPlayer(animeTitle, ep, mal_id);
      li.appendChild(btn);
      list.appendChild(li);
    });
  } catch {
    const list = document.getElementById('player-episodes-list');
    if (list) list.innerHTML = `<li>Erro ao carregar episódios.</li>`;
  }
}

async function mostrarEpisodioSelecionadoNoPlayer(animeTitle, ep, animeId) {
  const container = document.getElementById('player-episode-main');
  if (!container) return;
  let genresDisplay = '';
  let idDisplay = animeId ? `<span style="font-size:0.98em;">ID: <b>${animeId}</b></span>` : '';
  let genresList = [];
  let synopsisToShow = ep.synopsis;
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
    const data = await res.json();
    genresList = (data.data?.genres || []).map(g => g.name);
    if (!synopsisToShow)
      synopsisToShow = data.data?.synopsis || 'Sinopse não disponível para este episódio.';
  } catch {
    if (!synopsisToShow)
      synopsisToShow = 'Sinopse não disponível para este episódio.';
  }
  if (genresList.length) {
    genresDisplay = `<span style="font-size:0.98em;">Gêneros: <b>${genresList.join(', ')}</b></span>`;
  }

  container.innerHTML = `
    <div style="border:1px solid #e53935;padding:16px;margin-bottom:20px;border-radius:10px;">
      <h2>${animeTitle}</h2>
      <h3>Episódio: ${ep.title || ep.mal_id || ep.episode_id}</h3>
      ${genresDisplay ? genresDisplay + " &nbsp; " : ""}${idDisplay}
      <p><b>Sinopse do episódio:</b> ${synopsisToShow}</p>
      <div class="video-player-episode"></div>
    </div>
  `;

  const videoPlayerDiv = container.querySelector('.video-player-episode');
  videoPlayerDiv.innerHTML = `<p>Carregando trailer...</p>`;

  let trailerVideoId = null;
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
    const data = await res.json();
    if (data.data && data.data.trailer && data.data.trailer.youtube_id) {
      trailerVideoId = data.data.trailer.youtube_id;
    }
  } catch {}

  if (!trailerVideoId) {
    videoPlayerDiv.innerHTML = `<p>Trailer não encontrado.</p>`;
    return;
  }

  videoPlayerDiv.innerHTML = `
    <iframe width="640" height="360"
      src="https://www.youtube.com/embed/${trailerVideoId}"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen>
    </iframe>
  `;
}

let animesLancamento = [];
let animesPopulares = [];
let posLancamentos = 0;
let posPopulares = 0;
const visibleLancamentos = 2;
const visiblePopulares = 5;

function isAnimeSexual(anime) {
  if (!anime) return false;
  const sexualGenres = ["hentai", "ecchi", "erotico", "erótico"];
  const genres = (anime.genres || []).map(g => (g.name || "").toLowerCase());
  const explicitGenres = (anime.explicit_genres || []).map(g => (g.name || "").toLowerCase());
  if (genres.some(g => sexualGenres.includes(g))) return true;
  if (explicitGenres.some(g => sexualGenres.includes(g))) return true;
  if (anime.rating && ["rx - hentai", "r+ - mild nudity"].includes(anime.rating.toLowerCase())) return true;
  return false;
}

window.addEventListener('DOMContentLoaded', async () => {
  await carregarCarrosselLancamentos();
  await carregarCarrosselPopulares();
  atualizarCarrosselLancamentos();
  atualizarCarrosselPopulares();
});

async function carregarCarrosselLancamentos() {
  carouselLancamentos.innerHTML = '<p>Carregando...</p>';
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const end_date = `${year}-${month}-${day}`;
    const start_date = `${year - 2}-${month}-${day}`;
    let res = await fetch(
      `https://api.jikan.moe/v4/anime?start_date=${start_date}&end_date=${end_date}&order_by=members&sort=desc&limit=30`
    );
    let data = await res.json();
    let animes = (data.data || []).filter(anime => !isAnimeSexual(anime));
    if (!animes.length) {
      res = await fetch(`https://api.jikan.moe/v4/seasons/now`);
      data = await res.json();
      animes = (data.data || []).filter(anime => !isAnimeSexual(anime));
    }
    if (!animes.length) {
      carouselLancamentos.innerHTML = '<p>Nenhum lançamento encontrado.</p>';
      return;
    }
    animesLancamento = animes;
    posLancamentos = 0;
    atualizarCarrosselLancamentos();
  } catch {
    carouselLancamentos.innerHTML = '<p>Erro ao carregar lançamentos.</p>';
  }
}

async function carregarCarrosselPopulares() {
  carouselPopulares.innerHTML = '<p>Carregando...</p>';
  try {
    const res = await fetch('https://api.jikan.moe/v4/top/anime?limit=20');
    const data = await res.json();
    animesPopulares = data.data.filter(anime => !isAnimeSexual(anime));
    posPopulares = 0;
    atualizarCarrosselPopulares();
  } catch {
    carouselPopulares.innerHTML = '<p>Erro ao carregar populares.</p>';
  }
}

function atualizarCarrosselLancamentos() {
  carouselLancamentos.innerHTML = '';
  let lista = animesLancamento;
  if (!lista.length) {
    carouselLancamentos.innerHTML = '<p>Nenhum anime encontrado para esse filtro.</p>';
    return;
  }
  for (let i = 0; i < visibleLancamentos; i++) {
    if (lista.length === 0) break;
    const idx = (posLancamentos + i) % lista.length;
    const anime = lista[idx];
    const largeImg =
      anime.images.webp?.large_image_url ||
      anime.images.jpg?.large_image_url ||
      anime.images.webp?.image_url ||
      anime.images.jpg?.image_url;
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.innerHTML = `
      <img src="${largeImg}" alt="${anime.title}">
      <h3>${anime.title}</h3>
    `;
    item.addEventListener('click', () => {
      if (anime.type === 'movie') {
        abrirPlayerFilme(anime);
      } else {
        abrirPlayerGenero(anime);
      }
    });
    carouselLancamentos.appendChild(item);
  }
}

function atualizarCarrosselPopulares() {
  carouselPopulares.innerHTML = '';
  let lista = animesPopulares;
  if (!lista.length) {
    carouselPopulares.innerHTML = '<p>Nenhum anime encontrado para esse filtro.</p>';
    return;
  }
  for (let i = 0; i < visiblePopulares; i++) {
    if (lista.length === 0) break;
    const idx = (posPopulares + i) % lista.length;
    const anime = lista[idx];
    const item = document.createElement('div');
    item.className = 'carousel-item small';
    item.innerHTML = `
      <img src="${anime.images.webp.image_url}" alt="${anime.title}">
      <h3>${anime.title}</h3>
    `;
    item.addEventListener('click', () => {
      if (anime.type === 'movie') {
        abrirPlayerFilme(anime);
      } else {
        abrirPlayerGenero(anime);
      }
    });
    carouselPopulares.appendChild(item);
  }
}

document.getElementById('carousel-lancamentos-prev').onclick = () => {
  let lista = animesLancamento;
  if (lista.length === 0) return;
  posLancamentos = (posLancamentos - 1 + lista.length) % lista.length;
  atualizarCarrosselLancamentos();
};
document.getElementById('carousel-lancamentos-next').onclick = () => {
  let lista = animesLancamento;
  if (lista.length === 0) return;
  posLancamentos = (posLancamentos + 1) % lista.length;
  atualizarCarrosselLancamentos();
};
document.getElementById('carousel-populares-prev').onclick = () => {
  let lista = animesPopulares;
  if (lista.length === 0) return;
  posPopulares = (posPopulares - 1 + lista.length) % lista.length;
  atualizarCarrosselPopulares();
};
document.getElementById('carousel-populares-next').onclick = () => {
  let lista = animesPopulares;
  if (lista.length === 0) return;
  posPopulares = (posPopulares + 1) % lista.length;
  atualizarCarrosselPopulares();
};

let searchPage = 1;
let searchQuery = '';
let searchEnd = false;
let searchLoading = false;

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  searchQuery = query;
  searchPage = 1;
  searchEnd = false;
  searchResults.classList.remove('hidden');
  episodesSection.classList.add('hidden');
  searchAnimes.innerHTML = '';
  await buscarAnimes(true);
});

async function buscarAnimes(reset = false) {
  if (searchLoading || searchEnd || !searchQuery) return;
  searchLoading = true;
  if (reset) searchAnimes.innerHTML = '';
  let loader = document.createElement('p');
  loader.innerText = 'Buscando...';
  loader.id = 'search-loader';
  searchAnimes.appendChild(loader);

  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&page=${searchPage}&limit=24`);
    const data = await res.json();
    const cleanData = (data.data || []).filter(anime => !isAnimeSexual(anime));
    loader.remove();
    if (!cleanData.length) {
      searchEnd = true;
      if (searchPage === 1) searchAnimes.innerHTML = '<p>Nenhum anime encontrado.</p>';
      return;
    }
    let grid = searchAnimes.querySelector('.search-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'search-grid';
      searchAnimes.appendChild(grid);
    }
    cleanData.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'search-anime-card';
      card.innerHTML = `
        <img src="${anime.images.webp.image_url}" alt="${anime.title}">
        <h4>${anime.title}</h4>
      `;
      card.addEventListener('click', () => {
        if (anime.type === 'movie') {
          abrirPlayerFilme(anime);
        } else {
          abrirPlayerGenero(anime);
        }
      });
      grid.appendChild(card);
    });
    searchPage++;
    if (data.pagination?.has_next_page === false) searchEnd = true;
  } catch {
    loader.innerText = '<p>Erro ao buscar animes.</p>';
  }
  searchLoading = false;
  window.onscroll = infiniteScrollBusca;
}

function infiniteScrollBusca() {
  if (searchEnd || searchLoading) return;
  if (searchResults.classList.contains('hidden')) return;
  const grid = searchAnimes.querySelector('.search-grid');
  if (!grid) return;
  if ((window.innerHeight + window.scrollY) >= (grid.offsetTop + grid.offsetHeight - 400)) {
    buscarAnimes(false);
  }
}

async function exibirEpisodiosAnime(mal_id, animeTitle) {
  episodesSection.classList.remove('hidden');
  searchResults.classList.add('hidden');
  episodesList.innerHTML = `<li>Carregando episódios...</li>`;
  document.querySelector("#episodes-section h3").textContent = `Episódios de ${animeTitle}`;
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${mal_id}/episodes`);
    const data = await res.json();
    if (!data.data || !data.data.length) {
      episodesList.innerHTML = `<li>Nenhum episódio encontrado.</li>`;
      return;
    }
    episodesList.innerHTML = "";
    data.data.forEach(ep => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div style="margin-bottom:4px;"><b>Ep. ${ep.mal_id || ep.episode_id}: ${ep.title || "Sem título"}</b></div>
        ${ep.synopsis ? `<div style="font-size:0.97em;color:#bbb;margin-bottom:4px;">${ep.synopsis}</div>` : ""}
      `;
      const btn = document.createElement('button');
      btn.textContent = "Assistir";
      btn.onclick = () => abrirPlayerEpisodio(animeTitle, ep.title, ep.mal_id, ep.synopsis || null, mal_id);
      li.appendChild(btn);
      episodesList.appendChild(li);
    });
  } catch {
    episodesList.innerHTML = `<li>Erro ao carregar episódios.</li>`;
  }
}

function esconderTudoMenosPlayer() {
  homeSection.classList.add('hidden');
  searchResults.classList.add('hidden');
  episodesSection.classList.add('hidden');
  generosSection.classList.add('hidden');
  playerSection.classList.remove('hidden');
  navHome.classList.remove('active');
  navFilmes.classList.remove('active');
  navSeries.classList.remove('active');
  if (typeof navGeneros !== "undefined") navGeneros.classList.remove('active');
}

closeEpisodesBtn.onclick = () => {
  episodesSection.classList.add('hidden');
  searchResults.classList.add('hidden');
};

backToHomeBtn.onclick = () => {
  showSection('home');
  episodesSection.classList.add('hidden');
};

async function abrirPlayerEpisodio(animeTitle, epTitle, epId, epSynopsis, animeId) {

  esconderTudoMenosPlayer();
  let genresDisplay = '';
  let idDisplay = animeId ? `<span style="font-size:0.98em;">ID: <b>${animeId}</b></span>` : '';
  let genresList = [];
  let synopsisToShow = epSynopsis;
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
    const data = await res.json();
    genresList = (data.data?.genres || []).map(g => g.name);
    if (!synopsisToShow)
      synopsisToShow = data.data?.synopsis || 'Sinopse não disponível para este episódio.';
  } catch {
    if (!synopsisToShow)
      synopsisToShow = 'Sinopse não disponível para este episódio.';
  }
  if (genresList.length) {
    genresDisplay = `<span style="font-size:0.98em;">Gêneros: <b>${genresList.join(', ')}</b></span>`;
  }

  playerInfo.innerHTML = `
    <h2>${animeTitle}</h2>
    <h3>Episódio: ${epTitle || epId}</h3>
    ${genresDisplay ? genresDisplay + " &nbsp; " : ""}${idDisplay}
    <p><b>Sinopse do episódio:</b> ${synopsisToShow}</p>
  `;

  const videoPlayerDiv = document.querySelector('.video-player');
  videoPlayerDiv.innerHTML = `<p>Carregando trailer...</p>`;

  let trailerVideoId = null;
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
    const data = await res.json();
    if (data.data && data.data.trailer && data.data.trailer.youtube_id) {
      trailerVideoId = data.data.trailer.youtube_id;
    }
  } catch {}

  if (!trailerVideoId) {
    videoPlayerDiv.innerHTML = `
      <p>Trailer não encontrado.</p>
    `;
    return;
  }

  videoPlayerDiv.innerHTML = `
    <iframe width="640" height="360"
      src="https://www.youtube.com/embed/${trailerVideoId}"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen>
    </iframe>
  `;
}

async function mostrarEpisodioSelecionadoNoPlayer(animeTitle, ep, animeId) {
  const container = document.getElementById('player-episode-main');
  if (!container) return;
  let genresDisplay = '';
  let idDisplay = animeId ? `<span style="font-size:0.98em;">ID: <b>${animeId}</b></span>` : '';
  let genresList = [];
  let synopsisToShow = ep.synopsis;
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
    const data = await res.json();
    genresList = (data.data?.genres || []).map(g => g.name);
    if (!synopsisToShow)
      synopsisToShow = data.data?.synopsis || 'Sinopse não disponível para este episódio.';
  } catch {
    if (!synopsisToShow)
      synopsisToShow = 'Sinopse não disponível para este episódio.';
  }
  if (genresList.length) {
    genresDisplay = `<span style="font-size:0.98em;">Gêneros: <b>${genresList.join(', ')}</b></span>`;
  }

  container.innerHTML = `
    <div style="border:1px solid #e53935;padding:16px;margin-bottom:20px;border-radius:10px;">
      <h2>${animeTitle}</h2>
      <h3>Episódio: ${ep.title || ep.mal_id || ep.episode_id}</h3>
      ${genresDisplay ? genresDisplay + " &nbsp; " : ""}${idDisplay}
      <p><b>Sinopse do episódio:</b> ${synopsisToShow}</p>
      <div class="video-player-episode"></div>
    </div>
  `;

  const videoPlayerDiv = container.querySelector('.video-player-episode');
  videoPlayerDiv.innerHTML = `<p>Carregando trailer...</p>`;

  let trailerVideoId = null;
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
    const data = await res.json();
    if (data.data && data.data.trailer && data.data.trailer.youtube_id) {
      trailerVideoId = data.data.trailer.youtube_id;
    }
  } catch {}

  if (!trailerVideoId) {
    videoPlayerDiv.innerHTML = `<p>Trailer não encontrado.</p>`;
    return;
  }

  videoPlayerDiv.innerHTML = `
    <iframe width="640" height="360"
      src="https://www.youtube.com/embed/${trailerVideoId}"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen>
    </iframe>
  `;
}

async function abrirPlayerFilme(anime) {
  esconderTudoMenosPlayer();
  let genresList = (anime.genres || []).map(g => g.name);
  let genresDisplay = genresList.length ? `<span style="font-size:0.98em;">Gêneros: <b>${genresList.join(', ')}</b></span>` : '';
  let idDisplay = anime.mal_id ? `<span style="font-size:0.98em;">ID: <b>${anime.mal_id}</b></span>` : '';
  playerInfo.innerHTML = `
    <h2>${anime.title}</h2>
    ${genresDisplay ? genresDisplay + " &nbsp; " : ""}${idDisplay}
    <p>${anime.synopsis ? `<b>Sinopse:</b> ${anime.synopsis}` : "Sem sinopse."}</p>
    <p><b>Data de Lançamento:</b> ${anime.aired?.prop?.from?.year || "?"}</p>
    <p><b>Duração:</b> ${anime.duration || "?"}</p>
    <p><b>Nota:</b> ${anime.score || "?"}</p>
    <div class="video-player"></div>
  `;
  const videoPlayerDiv = document.querySelector('.video-player');
  videoPlayerDiv.innerHTML = `<p>Carregando trailer...</p>`;

  let trailerVideoId = anime.trailer?.youtube_id || null;
  if (!trailerVideoId) {
    videoPlayerDiv.innerHTML = `<p>Trailer não encontrado.</p>`;
    return;
  }
  videoPlayerDiv.innerHTML = `
    <iframe width="640" height="360"
      src="https://www.youtube.com/embed/${trailerVideoId}"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen>
    </iframe>
  `;
}

navFilmes.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('filmes');
});
navSeries.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('series');
});

function showSection(section) {
  homeSection.classList.add('hidden');
  playerSection.classList.add('hidden');
  searchResults.classList.add('hidden');
  episodesSection.classList.add('hidden');
  generosSection.classList.add('hidden');
  document.getElementById('filmes-section').classList.add('hidden');
  document.getElementById('series-section').classList.add('hidden');
  navHome.classList.remove('active');
  navFilmes.classList.remove('active');
  navSeries.classList.remove('active');
  navGeneros.classList.remove('active');

  if (section === 'home') {
    homeSection.classList.remove('hidden');
    navHome.classList.add('active');
  } else if (section === 'filmes') {
    document.getElementById('filmes-section').classList.remove('hidden');
    navFilmes.classList.add('active');
    carregarFilmes('');
  } else if (section === 'series') {
    document.getElementById('series-section').classList.remove('hidden');
    navSeries.classList.add('active');
    carregarSeries('');
  } else if (section === 'generos') {
    generosSection.classList.remove('hidden');
    navGeneros.classList.add('active');
  }
}

async function carregarFilmes(query) {
  const lista = document.getElementById('filmes-lista');
  lista.innerHTML = '<p>Carregando...</p>';
  let url = 'https://api.jikan.moe/v4/anime?type=movie&order_by=score&sort=desc&limit=24';
  if (query) url += `&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const filmes = (data.data || []).filter(anime => !isAnimeSexual(anime));
    if (!filmes.length) {
      lista.innerHTML = '<p>Nenhum filme encontrado.</p>';
      return;
    }
    lista.innerHTML = '<div class="filmes-grid"></div>';
    const grid = lista.querySelector('.filmes-grid');
    filmes.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'filme-serie-card';
      card.innerHTML = `
        <img src="${anime.images.webp?.image_url}" alt="${anime.title}">
        <div class="filme-serie-info">
          <h4>${anime.title}</h4>
          <span class="filme-serie-ano">${anime.aired?.prop?.from?.year || ""}</span>
        </div>
      `;
      card.addEventListener('click', () => abrirPlayerFilme(anime));
      grid.appendChild(card);
    });
  } catch {
    lista.innerHTML = '<p>Erro ao carregar filmes.</p>';
  }
}

async function carregarSeries(query) {
  const lista = document.getElementById('series-lista');
  lista.innerHTML = '<p>Carregando...</p>';
  let url = 'https://api.jikan.moe/v4/anime?type=tv&order_by=score&sort=desc&limit=24';
  if (query) url += `&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const series = (data.data || []).filter(anime => !isAnimeSexual(anime));
    if (!series.length) {
      lista.innerHTML = '<p>Nenhuma série encontrada.</p>';
      return;
    }
    lista.innerHTML = '<div class="filmes-grid"></div>';
    const grid = lista.querySelector('.filmes-grid');
    series.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'filme-serie-card';
      card.innerHTML = `
        <img src="${anime.images.webp?.image_url}" alt="${anime.title}">
        <div class="filme-serie-info">
          <h4>${anime.title}</h4>
          <span class="filme-serie-ano">${anime.aired?.prop?.from?.year || ""}</span>
        </div>
      `;
      card.addEventListener('click', () => abrirPlayerGenero(anime));
      grid.appendChild(card);
    });
  } catch {
    lista.innerHTML = '<p>Erro ao carregar séries.</p>';
  }
}

document.getElementById('filmes-search-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const query = document.getElementById('filmes-search-input').value.trim();
  carregarFilmes(query);
});
document.getElementById('series-search-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const query = document.getElementById('series-search-input').value.trim();
  carregarSeries(query);
});
document.getElementById('filmes-search-form').addEventListener('submit', function(e) {
  e.preventDefault();
  document.getElementById('filmes-section').classList.remove('hidden');
  document.getElementById('series-section').classList.add('hidden');
  document.getElementById('home-section').classList.add('hidden');
  const query = document.getElementById('filmes-search-input').value.trim();
  carregarFilmes(query);
});

document.getElementById('series-search-form').addEventListener('submit', function(e) {
  e.preventDefault();
  document.getElementById('series-section').classList.remove('hidden');
  document.getElementById('filmes-section').classList.add('hidden');
  document.getElementById('home-section').classList.add('hidden');
  const query = document.getElementById('series-search-input').value.trim();
  carregarSeries(query);
});
document.getElementById('search-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const query = document.getElementById('search-input').value.trim();
  if (query) {
    fetchAnimes(query, 'general');
  }
});

// Buscar Filmes
document.getElementById('filmes-search-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const query = document.getElementById('filmes-search-input').value.trim();
  if (query) {
    fetchAnimes(query, 'filmes');
  }
});

// Buscar Séries
document.getElementById('series-search-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const query = document.getElementById('series-search-input').value.trim();
  if (query) {
    fetchAnimes(query, 'series');
  }
});

// Função para buscar animes (Filmes ou Séries)
function fetchAnimes(query, type) {
  let apiUrl = '/api/search?q=' + query;

  // Adapte a URL com base no tipo de pesquisa (Filmes ou Séries)
  if (type === 'filmes') {
    apiUrl = '/api/filmes?q=' + query;
  } else if (type === 'series') {
    apiUrl = '/api/series?q=' + query;
  }

  // Fazendo a requisição para a API (ou uma URL fictícia)
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (type === 'general') {
        displaySearchResults(data, 'search-animes');
      } else if (type === 'filmes') {
        displaySearchResults(data, 'filmes-lista');
      } else if (type === 'series') {
        displaySearchResults(data, 'series-lista');
      }
    })
    .catch(error => {
      console.error('Erro ao buscar animes:', error);
    });
}

// Função para exibir resultados da busca
function displaySearchResults(data, resultContainerId) {
  const container = document.getElementById(resultContainerId);
  container.innerHTML = '';  // Limpar resultados anteriores

  if (data.length === 0) {
    container.innerHTML = '<p>Nenhum resultado encontrado.</p>';
  } else {
    data.forEach(anime => {
      const animeCard = document.createElement('div');
      animeCard.classList.add('anime-card');
      animeCard.innerHTML = `
        <img src="${anime.image}" alt="${anime.title}">
        <h3>${anime.title}</h3>
        <p>${anime.description}</p>
      `;
      container.appendChild(animeCard);
    });
  }
}