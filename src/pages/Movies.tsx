import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { useIndexedDB } from '../hooks/useIndexedDB';
import Navigation from '../components/Navigation';
import TmdbApi from '../api/tmdbApi';
import { Movie, SearchMultiResult } from '../utils/types';
import Footer from '../components/Footer';

interface MoviesProps {
  api_key?: string;
}

function Movies({ api_key }: MoviesProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchedResult, setSearchedResult] = useState<SearchMultiResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAllValue, putValue, deleteValue, isDBConnecting } = useIndexedDB('moviesDB', ['genres', 'favorites']);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam));
    } else {
      setCurrentPage(1);
    }

    const genreParam = searchParams.get('genre');
    if (genreParam) {
      setSelectedGenre(parseInt(genreParam));
    }

    const sortParam = searchParams.get('sort');
    if (sortParam) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchGenres = async () => {
      if (!api_key) {
        setError('API key is required');
        return;
      }

      try {
        const api = new TmdbApi(api_key);
        const genresData = await api.getGenres();
        setGenres(genresData.genres);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };

    fetchGenres();
  }, [api_key]);

  useEffect(() => {
    const fetchData = async () => {
      if (!api_key) {
        setError('API key is required');
        setLoading(false);
        return;
      }
  
      try {
        setLoading(true);
        const api = new TmdbApi(api_key);

        const options: { [key: string]: any } = {
          page: currentPage,
          sort_by: sortBy
        };

        if (selectedGenre) {
          options.with_genres = selectedGenre;
        }

        const response = await api.discoverMovies(options);
        
        setMovies(response.results);
        setTotalPages(Math.min(response.total_pages, 100));
      } catch (error) {
        setError(`Failed to fetch movies: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
  }, [api_key, currentPage, sortBy, selectedGenre]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isDBConnecting) {
        try {
          const favoritesFromDB = await getAllValue('favorites');
          setFavorites(favoritesFromDB);
        } catch (err) {
          console.error('Error loading favorites:', err);
        }
      }
    };
    
    loadFavorites();
  }, [getAllValue, isDBConnecting]);

  const isFavorite = (movieId: number) => {
    return favorites.some(fav => fav.id === movieId);
  };

  const toggleFavorite = async (movie: Movie) => {
    try {
      if (isFavorite(movie.id)) {
        await deleteValue('favorites', movie.id);
      } else {
        await putValue('favorites', movie);
      }

      const updatedFavorites = await getAllValue('favorites');
      setFavorites(updatedFavorites);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prevParams => {
      const newParams = new URLSearchParams(prevParams);
      newParams.set('page', page.toString());
      return newParams;
    });
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = event.target.value;
    setSortBy(sort);
    setSearchParams(prevParams => {
      const newParams = new URLSearchParams(prevParams);
      newParams.set('sort', sort);
      newParams.set('page', '1');
      return newParams;
    });
  };

  const handleGenreChange = (genreId: number | null) => {
    setSelectedGenre(genreId);
    setSearchParams(prevParams => {
      const newParams = new URLSearchParams(prevParams);
      if (genreId !== null) {
        newParams.set('genre', genreId.toString());
      } else {
        newParams.delete('genre');
      }
      newParams.set('page', '1');
      return newParams;
    });
  };

  const getMoviesWithQuery = (query: string) => {
    if (!api_key) {
      setError('API key is required');
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      const api = new TmdbApi(api_key);
      
      const searchedResult = (await api.searchMulti(query)).results;
      setSearchedResult(searchedResult);
    }

    fetchData();
  }

  // Generate pagination buttons
  const renderPagination = () => {
    const pagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    
    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1);
    }
    
    const pages = [];
    
    // "Previous" button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md ${currentPage === 1 
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
          : 'bg-gray-800 text-white hover:bg-gray-700'}`}
      >
        &laquo;
      </button>
    );

    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-2 text-gray-400">...</span>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded-md ${currentPage === i 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          {i}
        </button>
      );
    }
    
    // Last page if not in range
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-2 text-gray-400">...</span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
        >
          {totalPages}
        </button>
      );
    }
    
    // "Next" button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-md ${currentPage === totalPages 
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
          : 'bg-gray-800 text-white hover:bg-gray-700'}`}
      >
        &raquo;
      </button>
    );
    
    return pages;
  };

  if (loading || isDBConnecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/50 backdrop-blur-sm text-white p-6 rounded-lg shadow-xl max-w-lg">
          <h2 className="text-xl font-bold mb-4">Erreur</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation searchMethod={getMoviesWithQuery} searchedResult={searchedResult} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Explorer les Films</h1>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <div className="relative">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-gray-800 text-white border border-gray-700 rounded-md px-4 py-2 appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
              >
                <option value="popularity.desc">Populaires</option>
                <option value="vote_average.desc">Mieux notés</option>
                <option value="primary_release_date.desc">Récents</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            <button
              onClick={() => handleGenreChange(null)}
              className={`py-1 px-3 rounded-full whitespace-nowrap ${
                selectedGenre === null 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Tous les genres
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreChange(genre.id)}
                className={`py-1 px-3 rounded-full whitespace-nowrap ${
                  selectedGenre === genre.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <p className="text-gray-400 text-lg">Aucun film trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map(movie => (
              <div key={movie.id} className="relative group">
                <Link to={`/movie/${movie.id}`} className="block">
                  <MovieCard movie={movie} />
                </Link>
                <button 
                  onClick={() => toggleFavorite(movie)}
                  className={`absolute top-3 right-3 p-2 rounded-full bg-gray-800/70 hover:bg-gray-700/90 transition-all duration-200 ${
                    isFavorite(movie.id) ? 'text-red-500' : 'text-gray-300'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center space-x-2">
          {renderPagination()}
        </div>
        
        <div className="mt-4 text-center text-gray-400">
          Page {currentPage} sur {totalPages}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Movies;