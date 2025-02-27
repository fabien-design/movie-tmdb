export interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    release_date: string;
    overview: string;
    genre_ids?: number[];
    genres?: Genre[];
    runtime?: number;
    vote_count?: number;
    popularity?: number;
}

export interface MovieDetails {
    adult: boolean;
    backdrop_path: string | null;
    belongs_to_collection: any | null;
    budget: number;
    genres: Genre[];
    homepage: string | null;
    id: number;
    imdb_id: string | null;
    original_language: string;
    original_title: string;
    overview: string | null;
    popularity: number;
    poster_path: string | null;
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    release_date: string;
    revenue: number;
    runtime: number;
    spoken_languages: SpokenLanguage[];
    status: string;
    tagline: string | null;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    credits?: {
        cast: Cast[];
        crew: Crew[];
    };
    reviews?: {
        results: Review[];
    };
    recommendations?: {
        results: Movie[];
    };
}

export interface Genre {
    id: number;
    name: string;
}

export interface ProductionCompany {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
}

export interface ProductionCountry {
    iso_3166_1: string;
    name: string;
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1: string;
    name: string;
}

export interface Cast {
    adult: boolean;
    gender: number | null;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
    cast_id: number;
    character: string;
    credit_id: string;
    order: number;
}

export interface Crew {
    adult: boolean;
    gender: number | null;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
    credit_id: string;
    department: string;
    job: string;
}

export interface Review {
    id: string;
    author: string;
    author_details: {
        name: string|null;
        username: string;
        avatar_path: string | null;
        rating: number | null;
    }| null;
    content: string;
    created_at: string;
    updated_at: string;
    url: string|null;
}

export interface Genre {
    id: number;
    name: string;
}

export interface Person {
    id: number;
    name: string;
    profile_path: string | null;
    known_for_department: string;
}

export interface TvShow {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    first_air_date: string;
    overview: string;
}

export interface SearchResult {
    id: number;
    media_type: "movie" | "tv" | "person";
    title?: string;
    name?: string;
    poster_path?: string | null;
    profile_path?: string | null;
    release_date?: string;
    first_air_date?: string;
}

export interface ApiResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}
