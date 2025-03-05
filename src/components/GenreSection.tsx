import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import TmdbApi from '../api/tmdbApi';
import { Genre, Movie } from '../utils/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import { useIndexedDB } from '../hooks/useIndexedDB';

// Composant pour la section des genres
const GenreSection = ({ api_key, toggleFavorite, isFavorite }: { api_key: string, toggleFavorite: (movie: Movie) => void, isFavorite: (id: number) => boolean }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const { getAllValue, putValue, isDBConnecting } = useIndexedDB('moviesDB', ['genres', 'favorites']);

  useEffect(() => {
    const fetchGenres = async () => {
      setLoadingGenres(true);
      try {
        if (!isDBConnecting) {
          const cachedGenres = await getAllValue('genres');

          if (cachedGenres && cachedGenres.length > 0) {
            setGenres(cachedGenres);
            
            if (!selectedGenre) {
              setSelectedGenre(cachedGenres[0]);
            }
            
            setLoadingGenres(false);
            return;
          }
        }

        const api = new TmdbApi(api_key);
        const response = await api.getGenres();

        setGenres(response.genres);

        if (response.genres.length > 0 && !selectedGenre) {
          setSelectedGenre(response.genres[0]);
        }
        
        if (!isDBConnecting && response.genres.length > 0) {
          const genresWithIds = response.genres.map(genre => ({
            ...genre,
            id: genre.id
          }));

          for (const genre of genresWithIds) {
            await putValue('genres', genre);
          }
        }
      } catch (error) {
        console.error('Error fetching or caching genres:', error);
      } finally {
        setLoadingGenres(false);
      }
    };

    if (api_key) {
      fetchGenres();
    }
  }, [api_key, selectedGenre, isDBConnecting]);

  useEffect(() => {
    const fetchMoviesByGenre = async () => {
      if (!selectedGenre) return;
      
      setLoading(true);
      try {
        const api = new TmdbApi(api_key);
        const response = await api.getMoviesByGenre(selectedGenre.id);
        setGenreMovies(response.results);
      } catch (error) {
        console.error(`Error fetching movies for genre ${selectedGenre.name}:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedGenre) {
      fetchMoviesByGenre();
    }
  }, [api_key, selectedGenre]);

  return (
    <div className="mt-12 pb-12">
      <h2 className="text-2xl font-bold mb-6 text-white">Explorer par genre</h2>
      
      {/* Carrousel de genres */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Scrollbar]}
          navigation
          scrollbar={{ draggable: true, hide: true }}
          slidesPerView={"auto"}
          spaceBetween={10}
          className="genres-swiper px-1"
        >
          {!loadingGenres && genres.map((genre) => (
            <SwiperSlide key={genre.id} className="w-auto">
              <button
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedGenre?.id === genre.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {genre.name}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      {/* Affichage du carrousel de films */}
      {selectedGenre && (
        <div className="mt-8">
          <h3 className="text-xl font-medium mb-4 text-white">Films {selectedGenre.name}</h3>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : genreMovies.length === 0 ? (
            <p className="text-gray-400 text-center py-12">Aucun film trouvé pour ce genre</p>
          ) : (
            <Swiper
              modules={[Navigation, Scrollbar]}
              navigation
              scrollbar={{ draggable: true, hide: true }}
              slidesPerView={1.5}
              spaceBetween={16}
              breakpoints={{
                480: { slidesPerView: 2.5 },
                640: { slidesPerView: 3.5 },
                768: { slidesPerView: 4.5 },
                1024: { slidesPerView: 5.5 },
                1280: { slidesPerView: 6.5 },
              }}
              className="movies-swiper py-4"
            >
              {genreMovies.map((movie) => (
                <SwiperSlide key={movie.id}>
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
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      )}
    </div>
  );
};

export default GenreSection;