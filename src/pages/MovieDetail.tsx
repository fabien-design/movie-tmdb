import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useIndexedDB } from '../hooks/useIndexedDB';
import Navigation from '../components/Navigation';
import TmdbApi, { getImageUrl } from '../api/tmdbApi';
import { Movie, MovieDetails as MovieDetailsType, Review, SearchMultiResult } from '../utils/types';
import RatingStars from '../components/Form/RatingStars';

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'vibe'>('overview');
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [displayedCommentsCount, setDisplayedCommentsCount] = useState(5);

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

  // Format currency codepens
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
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

  const handleRatingFormValue = (value: number) => {
    setRating(value);
  }

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const movieId = parseInt(formData.get('movieId') as string);
    const rate = parseInt(formData.get('rate') as string);
    const username = formData.get('author') as string;
    const content = formData.get('content') as string;

    try {
      if (!rate || !username || !content) {
        console.error('Missing required fields');
        return;
      }

      if (rate < 0 || rate > 10) {
        console.error('Rating must be between 0 and 10');
        return;
      }

      if (content.length < 10) {
        console.error('Review content must be at least 10 characters');
        return;
      }

      if(username.length < 3) {
        console.error('Username must be at least 3 characters');
        return;
      }

      const review: Review = {
        id: `${movieId}-${username}-${Date.now()}`,
        author: username,
        author_details: {
          name: username,
          username: username,
          rating: rate,
          avatar_path: null
        },
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: null
      }

      await putValue('reviews', review);
      const updatedReviews = await getAllValue('reviews');
      setReviews(updatedReviews);

      setTimeout(() => {
        setSubmitting(false);
      }
      , 1000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitting(false);
    }

  }

  const loadReviews = async () => {
    if (!isDBConnecting && id) {
      try {
        const allReviews = await getAllValue('reviews');
        
        const movieId = parseInt(id);
        const movieReviews = allReviews.filter(review => {
          return review.id.startsWith(`${movieId}-`);
        });

        movieReviews.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        setReviews(movieReviews);
      } catch (err) {
        console.error('Error loading reviews:', err);
      }
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

  loadReviews();

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
              <div className="mt-8">
                <div className="border-b border-gray-800">
                  <nav className="flex -mb-px space-x-8">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'overview'
                          ? 'border-blue-500 text-blue-500'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      Synopsis
                    </button>
                    
                    {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
                      <button
                        onClick={() => setActiveTab('cast')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'cast'
                            ? 'border-blue-500 text-blue-500'
                            : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                        }`}
                      >
                        Casting
                      </button>
                    )}

                    
                    <button
                      onClick={() => setActiveTab('vibe')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'vibe'
                          ? 'border-blue-500 text-blue-500'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      Donnez votre avis
                    </button>
                  </nav>
                </div>

                <div className="py-6">
                  {activeTab === 'overview' && (
                    <div>
                      {movie.overview ? (
                        <>
                          <h3 className="text-xl font-bold mb-4">Synopsis</h3>
                          <p className="text-gray-300 leading-relaxed">
                            {movie.overview}
                          </p>
                          
                          {/* Additional movie info */}
                          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {movie.budget > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-400">Budget</h4>
                                <p className="mt-1">{formatCurrency(movie.budget)}</p>
                              </div>
                            )}
                            
                            {movie.revenue > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-400">Recette</h4>
                                <p className="mt-1">{formatCurrency(movie.revenue)}</p>
                              </div>
                            )}
                            
                            {movie.status && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-400">Statut</h4>
                                <p className="mt-1">{movie.status}</p>
                              </div>
                            )}
                            
                            {movie.original_language && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-400">Langue originale</h4>
                                <p className="mt-1">{movie.original_language.toUpperCase()}</p>
                              </div>
                            )}
                            
                            {movie.production_companies && movie.production_companies.length > 0 && (
                              <div className="md:col-span-2">
                                <h4 className="text-sm font-medium text-gray-400">Sociétés de production</h4>
                                <div className="mt-1 flex flex-wrap gap-4">
                                  {movie.production_companies.map(company => (
                                    <div key={company.id} className="flex items-center">
                                      {company.logo_path ? (
                                        <img 
                                          src={getImageUrl(company.logo_path, 'small', 'profile') || ''} 
                                          alt={company.name}
                                          className="h-8 mr-2 bg-white rounded p-1"
                                        />
                                      ) : null}
                                      <span>{company.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-400">
                          Aucun synopsis disponible pour ce film.
                        </p>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'cast' && movie.credits && movie.credits.cast && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Casting principal</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {movie.credits.cast.slice(0, 10).map(person => (
                          <div key={person.id} className="bg-gray-800 rounded-lg overflow-hidden shadow">
                            <div className="h-48 overflow-hidden">
                              {person.profile_path ? (
                                <img 
                                  src={getImageUrl(person.profile_path, 'medium', 'profile') || ''} 
                                  alt={person.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <h4 className="font-bold truncate">{person.name}</h4>
                              <p className="text-sm text-gray-400 truncate">{person.character}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {movie.credits.cast.length > 10 && (
                        <div className="mt-4 text-center">
                          <button className="text-blue-500 hover:text-blue-400 font-medium">
                            Voir tout le casting
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'vibe' && (
                    <>
                      <div>
                        <h3 className="text-xl font-bold mb-6">Votre avis nous intéresse !</h3>
                        <form onSubmit={handleSubmitReview} className="mt-4">
                          <input type='hidden' name='movieId' value={movie.id} />
                          <input type='hidden' name='rate' value={rating} />
                          <RatingStars ratingHandle={handleRatingFormValue} className={'mb-2'} readOnly={submitting} />
                          <input 
                            type='text'
                            name='author'
                            placeholder="Votre pseudo"
                            className="w-full bg-gray-700 text-gray-100 p-3 rounded-lg mb-2"
                            required
                            {...(submitting ? { disabled: true } : {})}
                          />
                          <textarea
                            name='content'
                            placeholder="Partagez votre avis sur ce film..."
                            className="w-full bg-gray-700 text-gray-100 p-3 rounded-lg mt-2"
                            required
                            {...(submitting ? { disabled: true } : {})}
                          ></textarea>
                          <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg mt-4"
                            {...(submitting ? { disabled: true } : {})}
                          >
                            {submitting ? 'Envoi en cours': 'Envoyer'}
                          </button>
                        </form>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mt-8 mb-6">Avis des spectateurs</h3>
                        {reviews.length > 0 ? (
                          <div>
                            {reviews.slice(0, displayedCommentsCount).map(review => (
                              <div key={review.id} className="bg-gray-800 p-4 rounded-lg mb-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 bg-gray-700 rounded-full overflow-hidden flex justify-center items-center">
                                      {review.author_details?.avatar_path ? (
                                        <img 
                                          src={getImageUrl(review.author_details.avatar_path, 'small', 'profile') || ''} 
                                          alt={review.author}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="ml-4">
                                      <h4 className="font-bold">{review.author}</h4>
                                      <div className="flex items-center">
                                        <span className="text-gray-400 ml-2">{review.author_details?.rating || 0} / 10</span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-gray-400 text-sm">{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <p className="mt-2 text-gray-300">{review.content}</p>
                              </div>
                            ))}
                            
                            {reviews.length > displayedCommentsCount && (
                              <div className="text-center mt-4">
                                <button 
                                  onClick={() => setDisplayedCommentsCount(prev => prev + 5)}
                                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm font-medium transition"
                                >
                                  Voir plus de commentaires ({reviews.length - displayedCommentsCount} restants)
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-800 p-6 rounded-lg text-center">
                            <p className="text-gray-400">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">© 2025 MovieDB - Tous droits réservés</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                À propos
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                Contact
              </a>  
              <a href="#" className="text-gray-400 hover:text-white transition">
                Politique de confidentialité
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MovieDetail;
