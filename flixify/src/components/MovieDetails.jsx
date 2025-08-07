import { useState, useEffect } from 'react';

const MovieDetails = ({ movie, isOpen, onClose }) => {
    const [movieDetails, setMovieDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const API_OPTION = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${API_KEY}`
        }
    };

    const fetchMovieDetails = async (movieId) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/movie/${movieId}?append_to_response=videos,credits`,
                API_OPTION
            );
            if (response.ok) {
                const data = await response.json();
                setMovieDetails(data);
            }
        } catch (error) {
            console.error('Failed to fetch movie details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && movie) {
            fetchMovieDetails(movie.id);
        }
    }, [isOpen, movie]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getTrailerKey = () => {
        if (movieDetails?.videos?.results) {
            const trailer = movieDetails.videos.results.find(
                video => video.type === 'Trailer' && video.site === 'YouTube'
            );
            return trailer?.key;
        }
        return null;
    };

    const formatRuntime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getProductionCompanies = () => {
        return movieDetails?.production_companies?.map(company => company.name).join(' • ') || 'N/A';
    };

    const getGenres = () => {
        return movieDetails?.genres?.map(genre => genre.name) || [];
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content hide-scrollbar">
                <button className="modal-close" onClick={onClose}>
                    ✕
                </button>

                {loading ? (
                    <div className="modal-loading">
                        <div className="text-white text-center">Loading movie details...</div>
                    </div>
                ) : movieDetails ? (
                    <div className="movie-details">
                        {/* Header Section */}
                        <div className="movie-header">
                            <div className="movie-header__content">
                                <h1 className="movie-title">{movieDetails.title}</h1>
                                <div className="movie-meta">
                                    <span>{new Date(movieDetails.release_date).getFullYear()}</span>
                                    <span>•</span>
                                    <span>PG-13</span>
                                    <span>•</span>
                                    <span>{formatRuntime(movieDetails.runtime)}</span>
                                </div>
                                <div className="movie-rating">
                                    <span className="rating-star">★</span>
                                    <span>{movieDetails.vote_average?.toFixed(1)}/10</span>
                                    <span className="rating-count">({movieDetails.vote_count?.toLocaleString()})</span>
                                </div>
                            </div>
                            {movieDetails.homepage && (
                                <button
                                    className="visit-homepage"
                                    onClick={() => window.open(movieDetails.homepage, '_blank')}
                                >
                                    Visit Homepage →
                                </button>
                            )}
                        </div>

                        <div className="movie-main">
                            <div className="movie-poster-large">
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`}
                                    alt={movieDetails.title}
                                />
                            </div>

                            <div className="movie-trailer">
                                {getTrailerKey() ? (
                                    <div className="trailer-container">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${getTrailerKey()}`}
                                            title={`${movieDetails.title} Trailer`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="trailer-iframe"
                                        ></iframe>
                                        <div className="trailer-overlay">
                                            <button className="play-button">▶</button>
                                            <span className="trailer-text">Trailer • 00:31</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-trailer">
                                        <img
                                            src={`https://image.tmdb.org/t/p/w780${movieDetails.backdrop_path}`}
                                            alt={movieDetails.title}
                                        />
                                        <div className="no-trailer-overlay">
                                            <span>No trailer available</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Genres */}
                        <div className="movie-genres">
                            <span className="genres-label">Genres</span>
                            <div className="genres-list">
                                {getGenres().map((genre) => (
                                    <span key={genre} className="genre-tag">{genre}</span>
                                ))}
                            </div>
                        </div>

                        {/* Movie Details Grid */}
                        <div className="movie-info-grid">
                            <div className="info-section">
                                <h3>Overview</h3>
                                <p>{movieDetails.overview || 'No overview available.'}</p>
                            </div>

                            <div className="info-section">
                                <h3>Release date</h3>
                                <p>{new Date(movieDetails.release_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })} (Worldwide)</p>
                            </div>

                            <div className="info-section">
                                <h3>Countries</h3>
                                <p>{movieDetails.production_countries?.map(country => country.name).join(' • ') || 'N/A'}</p>
                            </div>

                            <div className="info-section">
                                <h3>Status</h3>
                                <p>{movieDetails.status}</p>
                            </div>

                            <div className="info-section">
                                <h3>Language</h3>
                                <p>{movieDetails.spoken_languages?.map(lang => lang.english_name).join(' • ') || 'N/A'}</p>
                            </div>

                            {movieDetails.budget > 0 && (
                                <div className="info-section">
                                    <h3>Budget</h3>
                                    <p>{formatMoney(movieDetails.budget)}</p>
                                </div>
                            )}

                            {movieDetails.revenue > 0 && (
                                <div className="info-section">
                                    <h3>Revenue</h3>
                                    <p>{formatMoney(movieDetails.revenue)}</p>
                                </div>
                            )}

                            <div className="info-section">
                                <h3>Tagline</h3>
                                <p>{movieDetails.tagline || 'N/A'}</p>
                            </div>

                            <div className="info-section">
                                <h3>Production Companies</h3>
                                <p>{getProductionCompanies()}</p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default MovieDetails;