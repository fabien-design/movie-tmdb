import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { useIndexedDB } from '../hooks/useIndexedDB';
import Navigation from '../components/Navigation';
import TmdbApi from '../api/tmdbApi';
import { Movie, SearchMultiResult } from '../utils/types';
import GenreSection from '../components/GenreSection';
import Footer from '../components/Footer';

interface HomeProps {
  api_key?: string;
}

function Home({ api_key }: HomeProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [searchedResult, setSearchedResult] = useState<SearchMultiResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAllValue, putValue, deleteValue, isDBConnecting } = useIndexedDB('moviesDB', ['genres', 'favorites', 'reviews']);
  const [favorites, setFavorites] = useState<Movie[]>([]);

  // Fetch movies from API
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

        const [latestResponse, trendingResponse] = await Promise.all([
          api.getLatestMovies(),
          api.getTrendingMovies('week')
        ]);
        
        setMovies(latestResponse.results);
        setTrendingMovies(trendingResponse.results.slice(0, 5));
      } catch (error) {
        setError(`Failed to fetch movies: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
  }, [api_key]);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation searchMethod={getMoviesWithQuery} searchedResult={searchedResult} />
      
      {/* Hero section with trending movies */}
      <div className="relative h-[60vh] overflow-hidden">
        {trendingMovies.length > 0 && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(https://image.tmdb.org/t/p/original${trendingMovies[0].backdrop_path})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
            </div>
            <div className="absolute inset-0 flex items-end">
              <div className="container mx-auto px-4 pb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {trendingMovies[0].title}
                </h1>
                <p className="text-lg max-w-2xl line-clamp-3 mb-6">
                  {trendingMovies[0].overview}
                </p>
                <Link 
                  to={`/movie/${trendingMovies[0].id}`}
                  className="bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-full font-medium inline-flex items-center !text-gray-500"
                >
                  <span className="text-gray-100">Voir les détails</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-gray-100" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Nouveaux Films</h2>
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
        
        {/* Trending section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Films Tendance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingMovies.slice(1).map(movie => (
              <div key={movie.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  <img 
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`} 
                    alt={movie.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="p-4 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-2">{movie.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {new Date(movie.release_date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-gray-300 text-sm line-clamp-3">{movie.overview}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>
                    <Link 
                      to={`/movie/${movie.id}`}
                      className="text-blue-400 hover:text-blue-300 transition flex items-center"
                    >
                      <span>Voir plus</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <GenreSection api_key={api_key!} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />
      </main>

      <Footer />
    </div>
  );
}

export default Home;
