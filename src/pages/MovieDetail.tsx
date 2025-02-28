import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useIndexedDB } from '../hooks/useIndexedDB';
import Navigation from '../components/Navigation';
import TmdbApi, { getImageUrl } from '../api/tmdbApi';
import { Movie, MovieDetails as MovieDetailsType, SearchMultiResult } from '../utils/types';
import Footer from '../components/Footer';
import MovieInfoTabs from '../components/Movie/MovieInfoTabs';

interface MovieDetailProps {
  api_key?: string;
}

function MovieDetail({ api_key }: MovieDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [searchedResult, setSearchedResult] = useState<SearchMultiResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAllValue, putValue, deleteValue, isDBConnecting } = useIndexedDB('moviesDB', ['genres', 'favorites', 'reviews']);
  const [favorites, setFavorites] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!api_key || !id) {
        setError('API key or movie ID is missing');
        setLoading(false);
        return;
      }
  
      try {
        setLoading(true);
        const api = new TmdbApi(api_key);
        const movieId = parseInt(id);

        const movieDetails = await api.getMovieDetails(movieId)
        setMovie(movieDetails);
      } catch (error) {
        console.error(error);
        setError(`Failed to fetch movie details: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [api_key, id]);

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
  }, [isDBConnecting]);

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

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return `${hours}h ${mins}min`;
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
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800/50 backdrop-blur-sm text-white p-6 rounded-lg shadow-xl max-w-lg text-center">
          <h2 className="text-xl font-bold mb-4">Film non trouvé</h2>
          <p>Le film que vous recherchez n'existe pas ou a été supprimé.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation searchMethod={getMoviesWithQuery} searchedResult={searchedResult} />

      <div className="relative">
        {movie.backdrop_path && (
          <div className="relative h-[50vh] md:h-[70vh] overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'original', 'backdrop')})` 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/30"></div>
            </div>
          </div>
        )}
        
        <div className={`container mx-auto px-4 ${movie.backdrop_path ? 'relative -mt-64 md:-mt-72' : 'pt-8'}`}>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
              <div className="rounded-lg overflow-hidden shadow-xl">
                {movie.poster_path ? (
                  <img 
                    src={getImageUrl(movie.poster_path, 'large', 'poster') || ''} 
                    alt={movie.title}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="bg-gray-800 w-full h-0 pb-[150%] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <button 
                  onClick={() => toggleFavorite(movie as unknown as Movie)}
                  className={`px-4 py-2 rounded-full border flex items-center transition duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isFavorite(movie.id) ? 'text-red-500' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  {isFavorite(movie.id) ? 'Retiré des favoris' : 'Ajouter aux favoris'}
                </button>
              </div>
            </div>
            
            <div className="md:w-2/3 lg:w-3/4">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  {movie.title}
                </h1>
                {movie.release_date && (
                  <span className="text-xl text-gray-400">
                    ({new Date(movie.release_date)?.getFullYear()})
                  </span>
                )}
              </div>
              
              {/* Date & Duration & genres */}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-300">
                {movie.release_date && (
                  <div>
                    <span className="mr-1">Date de sortie:</span>
                    <span className="text-white">{movie.release_date}</span>
                  </div>
                )}
                
                {movie.runtime > 0 && (
                  <div>
                    <span className="mr-1">Durée:</span>
                    <span className="text-white">{formatDuration(movie.runtime)}</span>
                  </div>
                )}
                
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center mt-2 w-full">
                    {movie.genres.map(genre => (
                      <Link 
                        key={genre.id} 
                        to={`/movies?genre=${genre.id}`}
                        className="bg-gray-800 hover:bg-gray-700 transition px-2 py-1 rounded-full text-xs text-gray-300"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              {movie.vote_average > 0 && (
                <div className="mt-4 flex items-center">
                  <div className="bg-gray-800 rounded-full p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-xl font-bold">{movie.vote_average.toFixed(1)}</span>
                      <span className="text-gray-400 ml-1">/ 10</span>
                    </div>
                    <span className="text-sm text-gray-400">{movie.vote_count.toLocaleString()} votes</span>
                  </div>
                </div>
              )}
              
              {/* Content tabs */}
              <MovieInfoTabs movie={movie} />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default MovieDetail;
