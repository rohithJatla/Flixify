import {useState, useEffect, useRef, useMemo} from 'react'
import {useDebounce} from 'react-use';
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx';
import MovieCard from "./components/MovieCard.jsx";
import {getTrendingMovies, updateSearchCount} from "./appwrite.js";

const API_BASE_URL = 'https://api.themoviedb.org/3'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTION = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [searchTerm,setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [trendingMovies, setTrendingMovies] = useState([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const moviesPerPage = 8; // 4 columns x 2 rows as shown in your image

    const scrollRef = useRef(null);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    // Calculate pagination
    const totalPages = Math.ceil(movieList.length / moviesPerPage);
    const startIndex = (currentPage - 1) * moviesPerPage;
    const currentMovies = useMemo(() =>
            movieList.slice(startIndex, startIndex + moviesPerPage),
        [movieList, startIndex]
    );

    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta);
             i <= Math.min(totalPages - 1, currentPage + delta);
             i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const loadTrendingMovies = async() => {
        try{
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        }
        catch(error){
            console.log(error)
        }
    }

    const fetchMovies = async (query = '') => {
        setLoading(true);
        setErrorMessage(''); // Clear previous errors
        setCurrentPage(1); // Reset to first page on new search

        try{
            const endPoint =
                query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                    :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response =  await fetch(endPoint, API_OPTION)
            if(!response.ok){
                throw new Error("Failed to fetch movies from API");
            }
            const data = await response.json()

            if(data.Response === 'False'){
                setErrorMessage(data.Error || 'Failed to fetch movies from API');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);

            if(query && data.results.length > 0){
                await updateSearchCount(query,data.results[0]);
            }
        }
        catch(err){
            setErrorMessage("Error fetching movies: " + err.message)
            setMovieList([]);
        }
        finally {
            setLoading(false);
        }
    }

    useDebounce(() => {
        setDebouncedSearchTerm(searchTerm);
    },800, [searchTerm]);

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    },  [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    },[])

    return (
        <main className="App">
            <div className="pattern"></div>
            <div className="wrapper">
                <header >
                    <img src="/hero.png" alt="hero" />
                    <h1 className="text-gradient">Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
                </header>

                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                {trendingMovies.length > 0 && (
                    <section className="trending scroll-auto hide-scrollbar">
                        <h2>Trending Movies</h2>
                        <div className="trending__container">
                            <button
                                className="scroll-button scroll-button--left"
                                onClick={scrollLeft}
                                aria-label="Scroll left"
                            >
                                &#8249;
                            </button>

                            <ul className="trending__list" ref={scrollRef}>
                                {trendingMovies.map((movie, index) => (
                                    <li key={movie.$id}>
                                        <p>{index + 1}</p>
                                        <img src={movie.poster_url} alt={movie.title} />
                                    </li>
                                ))}
                            </ul>

                            <button
                                className="scroll-button scroll-button--right"
                                onClick={scrollRight}
                                aria-label="Scroll right"
                            >
                                &#8250;
                            </button>
                        </div>
                    </section>
                )}

                <section className="all-movies">
                    <h2 className="mt-[40px]"> All Movies</h2>
                    {loading ? (
                        <div className="text-white"><Spinner/></div>
                    ): errorMessage ? (
                        <div className="text-red-500">{errorMessage}</div>
                    ):(
                        <>
                            <ul className="movie-grid">
                                {currentMovies.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie}/>
                                ))}
                            </ul>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div>
                                <div className="pagination">
                                    <button
                                        className="pagination__arrow pagination__arrow--left"
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        aria-label="Previous page"
                                    >
                                        &#8249;
                                    </button>

                                    <div className="pagination__pages">
                                        {getVisiblePages().map((page, index) => (
                                            page === '...' ? (
                                                <span key={`dots-${index}`} className="pagination__dots">
                                                    ...
                                                </span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    className={`pagination__page ${currentPage === page ? 'pagination__page--active' : ''}`}
                                                    onClick={() => goToPage(page)}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        ))}
                                    </div>

                                    <button
                                        className="pagination__arrow pagination__arrow--right"
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        aria-label="Next page"
                                    >
                                        &#8250;
                                    </button>
                                </div>
                                <div className="pagination__info">
                                <span>{currentPage} / {totalPages}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    )
}

export default App