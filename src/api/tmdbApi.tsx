import { ApiResponse, Genre, Movie, MovieDetails, SearchMultiResult } from "../utils/types";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const IMAGE_SIZES = {
    poster: {
        small: "w185",
        medium: "w342",
        large: "w500",
        original: "original",
    },
    backdrop: {
        small: "w300",
        medium: "w780",
        large: "w1280",
        original: "original",
    },
    profile: {
        small: "w45",
        medium: "w185",
        large: "h632",
        original: "original",
    },
};

type ImageType = "poster" | "backdrop" | "profile";
type ImageSize = "small" | "medium" | "large" | "original";
type TimeWindow = "day" | "week";

interface RequestParams {
    [key: string]: string | number | boolean | undefined | null;
}

const createUrl = (path: string, params: RequestParams = {}): string => {
    const url = new URL(`${BASE_URL}${path}`);

    Object.keys(params).forEach(key => {
        const value = params[key];
        if (value != null) {
            url.searchParams.append(key, String(value));
        }
    });

    return url.toString();
};

export const getImageUrl = (
    path: string | null,
    size: ImageSize = "medium",
    type: ImageType = "poster"
): string | null => {
    if (!path) {
        return null
    };

    return `${IMAGE_BASE_URL}/${IMAGE_SIZES[type][size]}${path}`;
};

class TmdbApi {
    private apiKey: string;
    private language: string;
    private defaultParams: RequestParams;

    constructor(apiKey: string, language: string = "fr-FR") {
        this.apiKey = apiKey;
        this.language = language;
        this.defaultParams = {
            api_key: this.apiKey,
            language: this.language,
        };
    }

    async fetchData<T>(
        endUrl: string,
        params: RequestParams = {}
    ): Promise<T> {
        try {
            const url = createUrl(endUrl, {
                ...this.defaultParams,
                ...params,
            });
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            return (await response.json()) as T;
        } catch (error) {
            console.error(`Erreur lors de la requête à ${endUrl}:`, error);
            throw error;
        }
    }

    getTrendingMovies(
        timeWindow: TimeWindow = "day",
        page: number = 1
    ): Promise<ApiResponse<Movie>> {
        return this.fetchData<ApiResponse<Movie>>(
            `/trending/movie/${timeWindow}`,
            { page }
        );
    }

    // searchbar query v1
    searchMovies(query: string, page: number = 1): Promise<ApiResponse<Movie>> {
        return this.fetchData<ApiResponse<Movie>>("/search/movie", {
            query,
            page,
        });
    }

    // searchbar query v2
    searchMulti(query: string, page: number = 1): Promise<ApiResponse<SearchMultiResult>> {
        return this.fetchData<ApiResponse<SearchMultiResult>>("/search/multi", {
            query,
            page,
        }).then(data => {
            data.results = data.results.map(result => {
                if (result.media_type === "movie") {
                    return { 
                        ...result, 
                        type: "movie",
                        displayTitle: result.title,
                        displayDate: result.release_date,
                        imagePath: result.poster_path,
                    };
                } else if (result.media_type === "tv") {
                    return { 
                        ...result, 
                        type: "tv",
                        displayTitle: result.name,
                        displayDate: result.first_air_date,
                        imagePath: result.poster_path
                    };
                
                } else {
                    return { 
                        ...result, 
                        type: "person",
                        displayTitle: result.name,
                        imagePath: result.profile_path
                    };
                }
            });
            return data;
        });
    }

    getMoviesByGenre(
        genreId: number,
        page: number = 1
    ): Promise<ApiResponse<Movie>> {
        return this.fetchData<ApiResponse<Movie>>("/discover/movie", {
            with_genres: genreId,
            page,
        });
    }

    getGenres(): Promise<{ genres: Genre[] }> {
        return this.fetchData<{ genres: Genre[] }>("/genre/movie/list");
    }

    getMovieDetails(movieId: number): Promise<MovieDetails> {
        return this.fetchData<MovieDetails>(`/movie/${movieId}`, {
            append_to_response: "credits,reviews,recommendations",
        });
    }

    getLatestMovies(page: number = 1): Promise<ApiResponse<Movie>> {
        return this.fetchData<ApiResponse<Movie>>("/movie/now_playing", {
            page,
        });
    }

    discoverMovies(options: RequestParams = {}): Promise<ApiResponse<Movie>> {
        return this.fetchData<ApiResponse<Movie>>("/discover/movie", options);
    }
}

export default TmdbApi;
