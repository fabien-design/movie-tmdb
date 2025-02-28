import { getImageUrl } from '../../api/tmdbApi';
import { MovieDetails } from '../../utils/types';

interface MovieOverviewProps {
  movie: MovieDetails;
}

const MovieOverview = ({ movie }: MovieOverviewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div>
      {movie.overview ? (
        <>
          <h3 className="text-xl font-bold mb-4">Synopsis</h3>
          <p className="text-gray-300 leading-relaxed">
            {movie.overview}
          </p>
          
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
  );
};

export default MovieOverview;