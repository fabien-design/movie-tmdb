import RatingStars from '../Form/RatingStars';
import { Review } from '../../utils/types';
import ReviewItem from './ReviewItem';

interface MovieReviewsProps {
  movieId: number;
  reviews: Review[];
  rating: number;
  onRatingChange: (value: number) => void;
  onSubmitReview: (e: React.FormEvent<HTMLFormElement>) => void;
  onDeleteReview: (reviewId: string) => void;
  submitting: boolean;
  errors: string[] | null;
  displayedCommentsCount: number;
  onLoadMoreComments: () => void;
}

const MovieReviews = ({
  movieId,
  reviews,
  rating,
  onRatingChange,
  onSubmitReview,
  onDeleteReview,
  submitting,
  errors,
  displayedCommentsCount,
  onLoadMoreComments
}: MovieReviewsProps) => (
  <>
    <div>
      <h3 className="text-xl font-bold mb-6">Votre avis nous intéresse !</h3>
      <form onSubmit={onSubmitReview} className="mt-4">
        <input type='hidden' name='movieId' value={movieId} />
        <input type='hidden' name='rate' value={rating} />
        <RatingStars ratingHandle={onRatingChange} className={'mb-2'} readOnly={submitting} />
        <input 
          type='text'
          name='author'
          placeholder="Votre pseudo"
          className="w-full bg-gray-700 text-gray-100 p-3 rounded-lg mb-2"
          required
          disabled={submitting}
        />
        <textarea
          name='content'
          placeholder="Partagez votre avis sur ce film..."
          className="w-full bg-gray-700 text-gray-100 p-3 rounded-lg mt-2"
          required
          disabled={submitting}
        ></textarea>
        {errors && (
          <div className="mt-2">
            {errors.map((error) => (
              <p className="text-red-500 text-sm" key={`error-${error}-${Math.random().toString(36).substring(2, 9)}`}>{error}</p>
            ))}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg mt-4"
          disabled={submitting}
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
            <ReviewItem 
              key={review.id} 
              review={review} 
              onDelete={() => onDeleteReview(review.id)}
            />
          ))}
          
          {reviews.length > displayedCommentsCount && (
            <div className="text-center mt-4">
              <button 
                onClick={onLoadMoreComments}
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
);

export default MovieReviews;
