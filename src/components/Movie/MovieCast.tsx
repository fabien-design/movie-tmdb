import { getImageUrl } from "../../api/tmdbApi";
import { Cast } from "../../utils/types";

interface MovieCastProps {
    cast: Cast[];
}

const MovieCast = ({ cast }: MovieCastProps) => (
<div>
    <h3 className="text-xl font-bold mb-4">Casting principal</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {cast.slice(0, 10).map(person => (
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
    
    {cast.length > 10 && (
    <div className="mt-4 text-center">
        <button className="text-blue-500 hover:text-blue-400 font-medium">
        Voir tout le casting
        </button>
    </div>
    )}
</div>
);

export default MovieCast;