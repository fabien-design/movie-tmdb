import { getImageUrl } from "../../api/tmdbApi";
import { Review } from "../../utils/types";

interface ReviewItemProps {
    review: Review;
    onDelete: () => void;
}

const ReviewItem = ({ review, onDelete }: ReviewItemProps) => (
<div className="bg-gray-800 p-4 rounded-lg mb-4">
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
    <div className="flex items-center">
        <span className="text-gray-400 text-sm mr-4">{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
        <button 
        onClick={onDelete}
        className="text-red-500 hover:text-red-400 transition"
        title="Supprimer cet avis"
        >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        </button>
    </div>
    </div>
    <p className="mt-2 text-gray-300">{review.content}</p>
</div>
);

  export default ReviewItem;