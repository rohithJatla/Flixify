import {useState, useEffect} from 'react'
import Search from './components/Search.jsx'

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

    const fetchMovies = async () => {
        setLoading(true);
        setErrorMessage(''); // Clear previous errors
        try{
            const endPoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response =  await fetch(endPoint, API_OPTION)
            if(!response.ok){
                throw new Error("Failed to fetch movies from API");
            }
            const data = await response.json()


            if(data.results && data.results.length > 0){
                setMovieList(data.results);
                setErrorMessage('');
            } else {
                setErrorMessage('No movies found');
                setMovieList([]);
            }

            console.log(data)
        }
        catch(err){
            console.log(err);
            setErrorMessage("Error fetching movies: " + err.message)
            setMovieList([]);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMovies()
    },  [])

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
                <section className="all-movies">
                    <h2> All Movies</h2>
                    {loading ? (
                        <p className="text-white">Loading...</p>
                    ): errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ):(
                        <ul>
                            {movieList.map((movie) => (
                                <li key={movie.id} className="text-white">{movie.title}</li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

        </main>
    )
}
export default App