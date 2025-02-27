import React from 'react';

interface MovieProps {
  movie: {
    id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
    release_date?: string;
  };
}

const MovieCard: React.FC<MovieProps> = ({ movie }) => {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : '/placeholder-poster.png';
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  return (
    <div className="w-full max-w-[240px] mx-auto rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1">
      <div className="relative h-[360px] overflow-hidden">
        <img 
          src={posterUrl} 
          alt={`Affiche du film ${movie.title}`} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded font-bold text-sm">
          {movie.vote_average.toFixed(1)}
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-800 mb-2 line-clamp-2 h-15">
          {movie.title}
        </h3>
        {movie.release_date && (
          <p className="text-sm text-gray-600">
            {formatDate(movie.release_date)}
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
