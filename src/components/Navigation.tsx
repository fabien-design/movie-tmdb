import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { SearchMultiResult } from "../utils/types";

const TMDB_BASE_URL = "https://www.themoviedb.org";

interface NavigationProps {
    searchMethod: (query: string) => void;
    searchedResult: SearchMultiResult[];
}

const Navigation: React.FC<NavigationProps> = ({
    searchMethod,
    searchedResult,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const location = useLocation();
    const [showResults, setShowResults] = useState(false);
    const [loadingMovies, setLoadingMovies] = useState(true);

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenus = () => {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
    };

    const handleSearchRequest = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const query = event.target.value;
        setSearchQuery(query);

        const trimmedQuery = query.trim();
        setShowResults(trimmedQuery !== "");

        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        if (trimmedQuery) {
            setLoadingMovies(true);

            searchTimerRef.current = setTimeout(() => {
                searchMethod(query);
            }, 500);
        }
    };

    useEffect(() => {
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setLoadingMovies(false);
    }, [searchedResult]);

    const pages = [
        { name: "Accueil", path: "/" },
        { name: "Films", path: "/movies" },
    ];

    const userSettings = [
        { name: "Profil", path: "/profile" },
        { name: "Paramètres", path: "/settings" },
        { name: "Déconnexion", path: "/logout" },
    ];

    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            {/* Logo */}
                            <Link
                                to="/"
                                className="flex items-center"
                                onClick={closeMenus}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-blue-500"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M19.952,2.051c-1.539-1.539-4.034-1.539-5.573,0L9.622,6.807L2.876,0.061c-0.39-0.39-1.024-0.39-1.414,0s-0.39,1.024,0,1.414l6.746,6.746L2.052,14.38c-1.539,1.539-1.539,4.034,0,5.572c0.769,0.77,1.58,1.155,2.786,1.155s2.017-0.384,2.786-1.155l6.746-6.746l6.746,6.746c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293c0.39-0.39,0.39-1.024,0-1.414l-6.746-6.746l4.756-4.756c1.539-1.539,1.539-4.034,0-5.573 M13.166,4.879l2.758-2.758c0.769-0.769,2.018-0.769,2.786,0c0.769,0.77,0.769,2.018,0,2.786l-2.758,2.758 M4.879,12.166l-2.758,2.758c-0.769,0.769-0.769,2.018,0,2.786c0.769,0.77,2.018,0.77,2.786,0l2.758-2.758"></path>
                                </svg>
                                <span className="ml-2 text-xl font-bold text-white hidden sm:block">
                                    MovieDB
                                </span>
                            </Link>
                        </div>

                        {/* Desktop menu */}
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            {pages.map((page) => (
                                <Link
                                    key={page.name}
                                    to={page.path}
                                    className={`${
                                        location.pathname === page.path
                                            ? "border-blue-500 text-white"
                                            : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                >
                                    {page.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center flex-1 justify-between ml-3">
                        {/* Search box */}
                        <div className="relative search-container w-full max-w-[450px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="bg-gray-800 block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                onChange={handleSearchRequest}
                                onFocus={() =>
                                    setShowResults(searchQuery.trim() !== "")
                                }
                                value={searchQuery}
                            />

                            {showResults && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto search-results">
                                    {searchedResult.length > 0 ? (
                                        <>
                                            <div className="p-2 border-b border-gray-700">
                                                <h3 className="text-gray-300 text-sm font-semibold">
                                                    Résultats (
                                                    {searchedResult.length})
                                                </h3>
                                            </div>
                                            <ul>
                                                {searchedResult
                                                    .slice(0, 5)
                                                    .map((result) => (
                                                        <li
                                                            key={result.id}
                                                            className="border-b border-gray-700 last:border-b-0"
                                                        >
                                                            <Link
                                                                to={
                                                                    result.type ===
                                                                    "movie"
                                                                        ? `/movie/${result.id}`
                                                                        : result.type ===
                                                                          "tv"
                                                                        ? `${TMDB_BASE_URL}/tv/${result.id}`
                                                                        : `${TMDB_BASE_URL}/person/${result.id}`
                                                                }
                                                                className="flex items-center p-2 hover:bg-gray-700"
                                                                onClick={() =>
                                                                    setShowResults(
                                                                        false
                                                                    )
                                                                }
                                                                {...(result.type !== "movie" ? {
                                                                        target: "_blank",
                                                                        rel: "noopener noreferrer",
                                                                      }
                                                                    : {})}
                                                            >
                                                                <div className="flex-shrink-0 h-16 w-12 mr-3">
                                                                    {result.imagePath ? (
                                                                        <img
                                                                            src={`https://image.tmdb.org/t/p/w92${result.imagePath}`}
                                                                            alt={
                                                                                result.displayTitle
                                                                            }
                                                                            className="h-full w-full object-cover rounded"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-full w-full bg-gray-700 flex items-center justify-center rounded">
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                className="h-8 w-8 text-gray-500"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                                />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-white text-sm font-medium truncate">
                                                                        {
                                                                            result.displayTitle
                                                                        }
                                                                    </h4>
                                                                    <p className="text-gray-400 text-xs">
                                                                        {result.displayDate && new Date(result.displayDate).getFullYear()}
                                                                        {result.known_for && (
                                                                            <div className="flex items-center max-w-[90%] overflow-hidden truncate">
                                                                                <p className="bold m-0 pr-0.5">
                                                                                    {
                                                                                        result.known_for_department
                                                                                    }{" "}
                                                                                    :{" "}
                                                                                </p>
                                                                                {result.known_for
                                                                                    .slice(0,3)
                                                                                    .map(
                                                                                        (
                                                                                            knownFor,
                                                                                            i
                                                                                        ) => (
                                                                                            <span
                                                                                                key={
                                                                                                    knownFor.id
                                                                                                }
                                                                                                className="ml-2"
                                                                                            >
                                                                                                {i !==
                                                                                                    0 &&
                                                                                                    "- "}
                                                                                                {knownFor.title ||
                                                                                                    knownFor.name}
                                                                                            </span>
                                                                                        )
                                                                                    )}
                                                                            </div>
                                                                        )}
                                                                        {result.vote_average !== undefined && result.vote_average > 0 && (
                                                                          <span className="ml-2 flex items-center">
                                                                              <svg
                                                                                  xmlns="http://www.w3.org/2000/svg"
                                                                                  className="h-3 w-3 text-yellow-400 mr-1"
                                                                                  viewBox="0 0 20 20"
                                                                                  fill="currentColor"
                                                                              >
                                                                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                              </svg>
                                                                              {result.vote_average.toFixed(
                                                                                  1
                                                                              )}
                                                                          </span>
                                                                          )}
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                {searchedResult.length > 5 && (
                                                    <li className="p-2 text-center">
                                                        <Link
                                                            to={`${TMDB_BASE_URL}/search?query=${encodeURIComponent(
                                                                searchQuery
                                                            )}`}
                                                            className="text-blue-400 text-sm hover:text-blue-300"
                                                            onClick={() =>
                                                                setShowResults(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            Voir tous les
                                                            résultats
                                                        </Link>
                                                    </li>
                                                )}
                                            </ul>
                                        </>
                                    ) : (
                                        <div className="p-4 text-center text-gray-400">
                                            {loadingMovies &&
                                            searchQuery.trim() !== ""
                                                ? "Recherche en cours..."
                                                : searchQuery.trim() !== ""
                                                ? `Aucun résultat trouvé pour "${searchQuery}"`
                                                : "Commencez à taper pour rechercher"}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mobile-container flex">
                            <div className="ml-3 relative">
                                {isUserMenuOpen && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu-button"
                                    >
                                        {userSettings.map((setting) => (
                                            <Link
                                                key={setting.name}
                                                to={setting.path}
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                                role="menuitem"
                                                onClick={closeMenus}
                                            >
                                                {setting.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <div className="flex items-center md:hidden ml-3">
                                <button
                                    type="button"
                                    className="inline-flex h-full items-center justify-center p-2 rounded-md text-gray-400 hover:text-white !hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                    aria-expanded="false"
                                    onClick={toggleMenu}
                                >
                                    <span className="sr-only">
                                        Open main menu
                                    </span>
                                    {isMenuOpen ? (
                                        <svg
                                            className="block h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="block h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {pages.map((page) => (
                            <Link
                                key={page.name}
                                to={page.path}
                                className={`${
                                    location.pathname === page.path
                                        ? "bg-gray-800 text-white"
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                } block px-3 py-2 rounded-md text-base font-medium`}
                                onClick={closeMenus}
                            >
                                {page.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
