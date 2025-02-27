import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import './App.css'
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';

interface AppProps {
  api_key?: string;
}

function App({ api_key }: AppProps) {
  return (
    <Routes>
      <Route path="/" element={<Home api_key={api_key} />} />
      <Route path="/movies" element={<Movies api_key={api_key} />} />
      <Route path="/movie/:id" element={<MovieDetail api_key={api_key} />} />
    </Routes>
  );
}

export default App;
