import {useState, useEffect} from 'react'
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

    const loadTrendingMovies = async() =>{

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

                    <h1 className="text-gradient">Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle

                    </h1>
                </header>

                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                {trendingMovies.length > 0 && (
                    <section className="trending scroll-auto hide-scrollbar" >
                        <h2> Trending Movies</h2>
                        <ul className="trending__list">
                            {trendingMovies.map((movie,index)=>(
                                <li key={movie.$id}>
                                    <p>
                                        {index +1}
                                    </p>
                                    <img src = {movie.poster_url} alt={movie.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2 className="mt-[40px]"> All Movies</h2>
                    {loading ? (
                        <div className="text-white"><Spinner/></div>
                    ): errorMessage ? (
                        <div className="text-red-500">{errorMessage}</div>
                    ):(
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard  key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

        </main>
    )
}
export default App