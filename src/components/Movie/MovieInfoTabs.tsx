import { useState, useEffect } from 'react';
import { useIndexedDB } from '../../hooks/useIndexedDB';
import { MovieDetails, Review } from '../../utils/types';
import MovieOverview from './MovieOverview';
import MovieCast from './MovieCast';
import MovieReviews from './MovieReviews';

interface MovieInfoTabsProps {
  movie: MovieDetails;
  api_key?: string;
}

const MovieInfoTabs = ({ movie }: MovieInfoTabsProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'vibe'>('overview');
  const { getAllValue, putValue, deleteValue, isDBConnecting } = useIndexedDB('moviesDB', ['reviews']);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[] | null>(null);
  const [displayedCommentsCount, setDisplayedCommentsCount] = useState(5);

  useEffect(() => {
    if (!isDBConnecting) {
      loadReviews();
    }
  }, [isDBConnecting, movie.id]);


  const loadReviews = async () => {
    try {
      const allReviews = await getAllValue('reviews');
      const movieId = movie.id;
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
  };

  const handleRatingFormValue = (value: number) => {
    setRating(value);
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteValue('reviews', reviewId);
      await loadReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors(null);

    const formData = new FormData(e.currentTarget);

    const movieId = parseInt(formData.get('movieId') as string);
    const rate = parseInt(formData.get('rate') as string);
    const username = formData.get('author') as string;
    const content = formData.get('content') as string;
    const errors = [];

    try {
      if (!rate || !username || !content) {
        console.error('Missing required fields');
        errors.push('Veuillez remplir tous les champs');
      }

      if (rate < 0 || rate > 10) {
        console.error('Rating must be between 0 and 10');
        errors.push('La note doit être comprise entre 0 et 10');
      }

      if (content.length < 10) {
        console.error('Review content must be at least 10 characters');
        errors.push('Votre avis doit comporter au moins 10 caractères');
      }

      if(username.length < 3) {
        console.error('Username must be at least 3 characters');
        errors.push('Votre pseudo doit comporter au moins 3 caractères');
      }

      if (errors.length > 0) {
        setFormErrors(errors);
        setSubmitting(false);
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
      };

      await putValue('reviews', review);
      await loadReviews();

      setTimeout(() => {
        setSubmitting(false);
      }, 1000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setFormErrors(['Une erreur est survenue, veuillez réessayer']);
      setSubmitting(false);
    }
  };

  return (
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
          <MovieOverview movie={movie} />
        )}
        
        {activeTab === 'cast' && movie.credits && movie.credits.cast && (
          <MovieCast cast={movie.credits.cast} />
        )}

        {activeTab === 'vibe' && (
          <MovieReviews
            movieId={movie.id}
            reviews={reviews}
            rating={rating}
            onRatingChange={handleRatingFormValue}
            onSubmitReview={handleSubmitReview}
            onDeleteReview={handleDeleteReview}
            submitting={submitting}
            errors={formErrors}
            displayedCommentsCount={displayedCommentsCount}
            onLoadMoreComments={() => setDisplayedCommentsCount(prev => prev + 5)}
          />
        )}
      </div>
    </div>
  );
};

export default MovieInfoTabs;
