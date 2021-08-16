const API_KEY = "94ae101f62c598679f671350f47a3771";
let moviesListMaster = [];
const tmdbBaseUrl = "https://api.themoviedb.org/3";
let moviesToDisplay = [];
/**Method to fetch movies tmdb api*/
const fetchMovies = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((movies) => {
        console.log(movies);
        return resolve(movies.results);
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      });
  });
};
/**Method to fetch genres tmdb api*/
const fetchGenres = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((movies) => {
        console.log(movies);
        return resolve(movies.genres);
      })
      .catch((err) => {
        console.log(err);
        return reject(err);
      });
  });
};
/**Generating each movie card element with given movie object returned from tmdb api*/
const getMovieCard = (movie) => {
  const moviesCard = document.createElement("article");
  moviesCard.classList.add("movie-card");
  const moviesHeader = document.createElement("section");
  moviesHeader.classList.add("movie-header");
  moviesHeader.dataset.imageUrl = movie.poster_path;
  const movieContent = document.createElement("section");
  movieContent.classList.add("movie-content");
  const movieContentHeader = document.createElement("section");
  movieContentHeader.classList.add("movie-content-header");
  const title = document.createElement("h3");
  title.classList.add("movie-title");
  title.appendChild(document.createTextNode(movie.title));
  const rating = document.createElement("section");
  rating.classList.add("rating");
  rating.appendChild(document.createTextNode(movie.vote_average));

  movieContentHeader.appendChild(title);
  movieContentHeader.appendChild(rating);

  movieContent.appendChild(movieContentHeader);
  moviesCard.appendChild(moviesHeader);
  moviesCard.appendChild(movieContent);
  return moviesCard;
};

const clearChildrenNodes = (node) => {
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }
};
const populateMovies = (movies) => {
  let container = document.querySelector(".container");
  clearChildrenNodes(container);
  let moviesCards = movies.map((movie) => getMovieCard(movie));
  let fragment = document.createDocumentFragment();
  moviesCards.forEach((movie) => fragment.appendChild(movie));
  container.appendChild(fragment);
  lazyImageObserver();
};
const populateGenreSelectList = (genreList) => {
  const genreOptionsList = genreList.map((genre) => {
    const option = document.createElement("option");
    const { id, name } = genre;
    option.value = id;
    option.text = name;
    return option;
  });
  const select = document.querySelector(".filter");
  let fragment = document.createDocumentFragment();
  genreOptionsList.forEach((genreOption) => {
    fragment.appendChild(genreOption);
  });
  select.appendChild(fragment);
};
const lazyImageObserver = () => {
  let lazyImages = document.querySelectorAll(".movie-header");
  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.style.background = `url(https://image.tmdb.org/t/p/w500${lazyImage.dataset.imageUrl})`;
          lazyImage.style.backgroundSize = "cover";
        }
      });
    });
    lazyImages.forEach((lazyImage) => {
      lazyImageObserver.observe(lazyImage);
    });
  }
};
const handleFilter = function () {
  let actionType = this.value;
  if (actionType !== "all") {
    let filteredMovies = moviesListMaster.filter((movie) => {
      return movie.genre_ids.includes(Number(actionType));
    });
    populateMovies(filteredMovies);
  } else {
    populateMovies(moviesListMaster);
  }
};
const handleSort = function () {
  let sortTerm = this.value;
  moviesListMaster.sort((a, b) => {
    switch (sortTerm) {
      case "vote_average":
        return b[sortTerm] - a[sortTerm];
        break;
      case "title":
        return a[sortTerm].localeCompare(b[sortTerm]);
        break;
      case "release_date":
        return new Date(a[sortTerm]) - new Date(b[sortTerm]);
        break;
      default:
        return b["vote_average"] - a["vote_average"];
        break;
    }
  });
  populateMovies(moviesListMaster);
};
const handleSearch = (event) => {
  let searchText = event.target.value;
  moviesToDisplay = moviesListMaster.filter((movie) => {
    return movie.title.toLowerCase().includes(searchText.toLowerCase());
  });
  populateMovies(moviesToDisplay);
};
// Event handling
window.addEventListener("DOMContentLoaded", async (event) => {
  moviesListMaster = await fetchMovies(
    `${tmdbBaseUrl}/movie/top_rated?api_key=${API_KEY}&language=en-US`
  );
  populateMovies(moviesListMaster);
  const genre = await fetchGenres(
    `${tmdbBaseUrl}/genre/movie/list?api_key=${API_KEY}&language=en-US`
  );
  populateGenreSelectList(genre);
});

document.querySelector("#searchInput").addEventListener("input", handleSearch);
document.querySelector(".sortby").addEventListener("change", handleSort);
document.querySelector(".filter").addEventListener("change", handleFilter);
