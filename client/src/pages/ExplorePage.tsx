import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useLocation, useNavigate, Link } from "react-router-dom";
import {
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Star,
  Plus,
  Check,
  Play,
} from "lucide-react";
import {
  useDiscoverMovies,
  usePopularMovies,
  useTopRatedMovies,
  useUpcomingMovies,
  useGenres,
} from "../hooks/useMovies";
import { TrailerModal } from "../components/TrailerModal";
import { getPosterUrl, formatMovieMetadata } from "../utils/tmdb";
import { useWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from "../hooks/usePersonal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiClient } from "../api/client";
import type { MovieFilterQuery, MovieSummary } from "@watchbox/shared";

type SortByOption = NonNullable<MovieFilterQuery["sortBy"]>;

interface ExplorePageProps {
  defaultContentType?: "all" | "movies" | "tv";
  pageTitle?: string;
  eyebrow?: string;
}

// Visual genres matching the reference screenshot carousel
interface VisualGenreCard {
  id: number | null;
  label: string;
  image?: string;
}

const VISUAL_GENRES: VisualGenreCard[] = [
  { id: null, label: "All Movies" },
  {
    id: 28,
    label: "Action",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: 35,
    label: "Comedy",
    image: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: 18,
    label: "Drama",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: 878,
    label: "Sci-Fi",
    image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: 53,
    label: "Thriller",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: 27,
    label: "Horror",
    image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: 10749,
    label: "Romance",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: 14,
    label: "Fantasy",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: 16,
    label: "Animation",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80",
  },
];

// Curated Popular Movies matching the exact titles & cards from reference screenshot
const CURATED_POPULAR_MOVIES: MovieSummary[] = [
  {
    id: 693134,
    title: "Dune: Part Two",
    posterPath: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdropPath: "/xOMo8BRK7PfcJv9JCnx7s5200bm.jpg",
    releaseDate: "2024-03-01",
    voteAverage: 8.7,
    voteCount: 4800,
    genreIds: [878, 12],
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge.",
  },
  {
    id: 533535,
    title: "Deadpool & Wolverine",
    posterPath: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    backdropPath: "/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
    releaseDate: "2024-07-26",
    voteAverage: 8.0,
    voteCount: 4200,
    genreIds: [28, 35, 878],
    overview: "A listless Wade Wilson toils away in civilian life when the TVA pulls him into an existential mission.",
  },
  {
    id: 1022789,
    title: "Inside Out 2",
    posterPath: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    backdropPath: "/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg",
    releaseDate: "2024-06-14",
    voteAverage: 7.9,
    voteCount: 4200,
    genreIds: [16, 35, 10751],
    overview: "Riley's mind headquarters undergoes a sudden demolition to make room for new Emotions.",
  },
  {
    id: 157336,
    title: "Interstellar",
    posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdropPath: "/rAiYTsqJiOEZnh0nZ2qraEMqHd.jpg",
    releaseDate: "2014-11-05",
    voteAverage: 8.6,
    voteCount: 34000,
    genreIds: [878, 18],
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  },
  {
    id: 414906,
    title: "The Batman",
    posterPath: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdropPath: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    releaseDate: "2022-03-04",
    voteAverage: 7.8,
    voteCount: 9200,
    genreIds: [28, 80],
    overview: "In his second year of fighting crime, Batman uncovers corruption in Gotham City.",
  },
  {
    id: 872585,
    title: "Oppenheimer",
    posterPath: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdropPath: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    releaseDate: "2023-07-21",
    voteAverage: 8.4,
    voteCount: 8100,
    genreIds: [36, 18],
    overview: "The story of American scientist J. Robert Oppenheimer and his role in the Manhattan Project.",
  },
  {
    id: 634649,
    title: "Spider-Man: No Way Home",
    posterPath: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    backdropPath: "/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
    releaseDate: "2021-12-17",
    voteAverage: 8.0,
    voteCount: 19400,
    genreIds: [28, 12, 878],
    overview: "Peter Parker is unmasked and no longer able to separate his normal life from superhero stakes.",
  },
  {
    id: 823464,
    title: "Godzilla x Kong: The New Empire",
    posterPath: "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",
    backdropPath: "/xOMo8BRK7PfcJv9JCnx7s5200bm.jpg",
    releaseDate: "2024-03-29",
    voteAverage: 6.4,
    voteCount: 3600,
    genreIds: [28, 878],
    overview: "Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world.",
  },
];

// Curated Top Rated Movies matching the exact titles from reference screenshot
const CURATED_TOP_RATED_MOVIES: MovieSummary[] = [
  {
    id: 278,
    title: "The Shawshank Redemption",
    posterPath: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
    backdropPath: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    releaseDate: "1994-09-23",
    voteAverage: 9.3,
    voteCount: 26000,
    genreIds: [18, 80],
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption.",
  },
  {
    id: 238,
    title: "The Godfather",
    posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdropPath: "/tmU7GeKVybMWF9YOCagmsrn2XYQ.jpg",
    releaseDate: "1972-03-14",
    voteAverage: 9.2,
    voteCount: 20000,
    genreIds: [18, 80],
    overview: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son.",
  },
  {
    id: 155,
    title: "The Dark Knight",
    posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdropPath: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    releaseDate: "2008-07-16",
    voteAverage: 9.0,
    voteCount: 32000,
    genreIds: [28, 80, 18],
    overview: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
  },
  {
    id: 389,
    title: "12 Angry Men",
    posterPath: "/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg",
    backdropPath: "/qqHQsStV6Z9uhxMMSDvsgRAxLDQ.jpg",
    releaseDate: "1957-04-10",
    voteAverage: 9.0,
    voteCount: 8400,
    genreIds: [18],
    overview: "The defense and the prosecution have rested, and the jury is filing into the jury room.",
  },
  {
    id: 424,
    title: "Schindler's List",
    posterPath: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
    backdropPath: "/zb6fM1CX41D9rF9hdYAv0W4UTrL.jpg",
    releaseDate: "1993-11-30",
    voteAverage: 8.9,
    voteCount: 15500,
    genreIds: [18, 36, 10752],
    overview: "In German-occupied Poland during World War II, Oskar Schindler gradually becomes concerned for his Jewish workforce.",
  },
  {
    id: 122,
    title: "The Lord of the Rings: The Return of the King",
    posterPath: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
    backdropPath: "/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg",
    releaseDate: "2003-12-17",
    voteAverage: 8.9,
    voteCount: 23800,
    genreIds: [12, 14, 28],
    overview: "Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor.",
  },
  {
    id: 680,
    title: "Pulp Fiction",
    posterPath: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdropPath: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    releaseDate: "1994-09-10",
    voteAverage: 8.8,
    voteCount: 27000,
    genreIds: [53, 80],
    overview: "A burger-loving hit man, his philosophical partner, and a washed-up boxer converge in four tales of violence and redemption.",
  },
  {
    id: 550,
    title: "Fight Club",
    posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdropPath: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    releaseDate: "1999-10-15",
    voteAverage: 8.8,
    voteCount: 28500,
    genreIds: [18],
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
  },
];

// Curated Upcoming / New Releases
const CURATED_UPCOMING_MOVIES: MovieSummary[] = [
  {
    id: 558449,
    title: "Gladiator II",
    posterPath: "/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    backdropPath: "/euYIwmwkmz95mnXvufEmbL6ovhA.jpg",
    releaseDate: "2024-11-22",
    voteAverage: 7.8,
    voteCount: 2100,
    genreIds: [28, 12, 18],
    overview: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum.",
  },
  {
    id: 889737,
    title: "Joker: Folie à Deux",
    posterPath: "/aciP8Km0waTLGEYfLHn04flGPyQ.jpg",
    backdropPath: "/uGmYVI8QWJ6itjZp1P97sJz9x4h.jpg",
    releaseDate: "2024-10-04",
    voteAverage: 6.2,
    voteCount: 1900,
    genreIds: [18, 80, 53],
    overview: "Arthur Fleck institutionalized at Arkham awaiting trial for his crimes as Joker.",
  },
  {
    id: 1241982,
    title: "Moana 2",
    posterPath: "/4YZpsylmjHbqeWzjKpUEF8gcLUV.jpg",
    backdropPath: "/tElnmtQ6yszej5G9vAdtc49cBEr.jpg",
    releaseDate: "2024-11-27",
    voteAverage: 7.2,
    voteCount: 1200,
    genreIds: [16, 12, 10751],
    overview: "After receiving an unexpected call from her wayfinding ancestors, Moana journeys to the far seas of Oceania.",
  },
  {
    id: 786892,
    title: "Furiosa: A Mad Max Saga",
    posterPath: "/iADOJ8Zymht2JPMoy3R7xUMZqaC.jpg",
    backdropPath: "/wNAhuOZ3Zf84jCI5TeTVlYUFQg9.jpg",
    releaseDate: "2024-05-24",
    voteAverage: 7.7,
    voteCount: 3400,
    genreIds: [28, 12, 878],
    overview: "As the world fell, young Furiosa is snatched from the Green Place of Many Mothers.",
  },
  {
    id: 945961,
    title: "Alien: Romulus",
    posterPath: "/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg",
    backdropPath: "/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg",
    releaseDate: "2024-08-16",
    voteAverage: 7.3,
    voteCount: 2600,
    genreIds: [27, 878],
    overview: "While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form.",
  },
  {
    id: 917496,
    title: "Beetlejuice Beetlejuice",
    posterPath: "/kKgQzkUCUm00q4q1JzLhN45xT2y.jpg",
    backdropPath: "/1wP1phHo2CRNVNywnVKh4ZJ15Q7.jpg",
    releaseDate: "2024-09-06",
    voteAverage: 7.1,
    voteCount: 2300,
    genreIds: [35, 14, 27],
    overview: "After a family tragedy, three generations of the Deetz family return home to Winter River.",
  },
  {
    id: 653346,
    title: "Kingdom of the Planet of the Apes",
    posterPath: "/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
    backdropPath: "/fqv8v6A9PnIvsvslje379OHYGhp.jpg",
    releaseDate: "2024-05-10",
    voteAverage: 7.2,
    voteCount: 2900,
    genreIds: [878, 12],
    overview: "Several generations in the future following Caesar's reign, a young ape embarks on a journey.",
  },
  {
    id: 718821,
    title: "Twisters",
    posterPath: "/pjnD08FlMAIXsfOLKQbvmO0f0MD.jpg",
    backdropPath: "/58D32974v0L2z1WfI5p9Z5H5J7z.jpg",
    releaseDate: "2024-07-19",
    voteAverage: 7.0,
    voteCount: 1900,
    genreIds: [28, 12],
    overview: "As storm season intensifies, terrifying phenomena never seen before are unleashed.",
  },
];

// Curated TV Shows Showcase
const CURATED_POPULAR_TV: MovieSummary[] = [
  {
    id: 1396,
    title: "Breaking Bad",
    posterPath: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    backdropPath: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    releaseDate: "2008-01-20",
    voteAverage: 9.5,
    voteCount: 14000,
    genreIds: [18, 80],
    overview: "Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and begins producing methamphetamine.",
  },
  {
    id: 1399,
    title: "Game of Thrones",
    posterPath: "/1XS11ku8MPaOp67BMF379WllACQ.jpg",
    backdropPath: "/2OMB0ynKlyIen9SuWs0qK1p5hN.jpg",
    releaseDate: "2011-04-17",
    voteAverage: 9.2,
    voteCount: 22000,
    genreIds: [10765, 18, 10759],
    overview: "Seven noble families fight for control of the mythical land of Westeros.",
  },
  {
    id: 66732,
    title: "Stranger Things",
    posterPath: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdropPath: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    releaseDate: "2016-07-15",
    voteAverage: 8.7,
    voteCount: 17000,
    genreIds: [10765, 18, 9648],
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments and terrifying supernatural forces.",
  },
  {
    id: 100088,
    title: "The Last of Us",
    posterPath: "/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg",
    backdropPath: "/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    releaseDate: "2023-01-15",
    voteAverage: 8.8,
    voteCount: 5200,
    genreIds: [18, 10759],
    overview: "Twenty years after modern civilization has been destroyed, Joel is hired to smuggle Ellie out of an oppressive quarantine zone.",
  },
  {
    id: 76331,
    title: "Succession",
    posterPath: "/7HW473ahJOh0qXFqLz8s8N3vH3i.jpg",
    backdropPath: "/wvdWb5iIPz669al1vdSg9897N.jpg",
    releaseDate: "2018-06-03",
    voteAverage: 8.9,
    voteCount: 3900,
    genreIds: [18],
    overview: "The Roy family is known for controlling the biggest media and entertainment company in the world.",
  },
  {
    id: 95557,
    title: "Severance",
    posterPath: "/p7Y2Yh5Yp8A61n7oG9o1e5Y4H6i.jpg",
    backdropPath: "/k479b0X1iG6UvXj6gM37u5i4P.jpg",
    releaseDate: "2022-02-18",
    voteAverage: 8.7,
    voteCount: 2800,
    genreIds: [18, 10765, 9648],
    overview: "Mark leads a team of office workers whose memories have been surgically divided between work and personal lives.",
  },
  {
    id: 126308,
    title: "Shōgun",
    posterPath: "/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg",
    backdropPath: "/yHqW4oVv04l7aL2Wf1zLp8v5Y7i.jpg",
    releaseDate: "2024-02-27",
    voteAverage: 8.7,
    voteCount: 2400,
    genreIds: [18, 10768],
    overview: "When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets.",
  },
  {
    id: 106379,
    title: "Fallout",
    posterPath: "/ansXDqWf6gHk5rJ6oYx5eX7aL1u.jpg",
    backdropPath: "/5zmiLijz9QjJ1E9x4b97qH2fQ6e.jpg",
    releaseDate: "2024-04-10",
    voteAverage: 8.4,
    voteCount: 2900,
    genreIds: [10765, 10759],
    overview: "In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers.",
  },
];

// Single Movie Card component tailored strictly to the reference design
interface ShowcaseMovieCardProps {
  movie: MovieSummary;
  onPlayTrailer?: (tmdbId: number, title: string) => void;
}

const ShowcaseMovieCard: React.FC<ShowcaseMovieCardProps> = ({ movie, onPlayTrailer }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: watchlistData } = useWatchlist();
  const addWatchlist = useAddToWatchlist();
  const removeWatchlist = useRemoveFromWatchlist();

  const inWatchlist = Boolean(
    watchlistData?.items.some((item) => item.tmdbId === movie.id)
  );

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast("Sign in to save titles to your list", "info");
      return;
    }
    if (inWatchlist) {
      removeWatchlist.mutate(movie.id);
      showToast("Removed from My List", "info");
    } else {
      addWatchlist.mutate(movie.id);
      showToast("Saved to My List", "success");
    }
  };

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPlayTrailer) {
      onPlayTrailer(movie.id, movie.title);
    }
  };

  return (
    <div className="group relative flex flex-col transition-all duration-300">
      {/* Poster Container */}
      <Link
        to={`/movies/${movie.id}`}
        className="block relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#0A0D0D] border border-white/5 group-hover:border-[#E4B85A]/60 group-hover:shadow-lg group-hover:shadow-black/70 transition-all duration-300"
      >
        <img
          src={getPosterUrl(movie.posterPath, "w500")}
          alt={movie.title}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Trailer Overlay */}
        {onPlayTrailer && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <button
              onClick={handleTrailerClick}
              title="Watch Trailer"
              className="pointer-events-auto p-2.5 rounded-full bg-[#050707]/85 border border-[#E4B85A]/70 text-[#E4B85A] hover:bg-[#E4B85A] hover:text-[#050707] shadow-lg transform transition-all group-hover:scale-110 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </div>
        )}
      </Link>

      {/* Under Poster Info */}
      <div className="pt-2 px-0.5 flex flex-col">
        {/* Rating & Circular + Watchlist Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#E4B85A]">
            <Star className="w-3 h-3 fill-[#E4B85A] text-[#E4B85A]" />
            <span>{movie.voteAverage > 0 ? movie.voteAverage.toFixed(1) : "NR"}</span>
          </div>

          <button
            onClick={handleWatchlistClick}
            title={inWatchlist ? "Remove from My List" : "Add to My List"}
            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              inWatchlist
                ? "border-[#E4B85A] bg-[#E4B85A]/20 text-[#E4B85A]"
                : "border-[#282B27] bg-[#101414] text-[#A7A69F] hover:border-[#E4B85A] hover:text-[#E4B85A] hover:bg-[#171B1A]"
            }`}
          >
            {inWatchlist ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </button>
        </div>

        {/* Movie Title */}
        <Link
          to={`/movies/${movie.id}`}
          className="text-xs font-semibold text-[#F5F0E6] truncate group-hover:text-[#FFD985] transition-colors mt-1"
          title={movie.title}
        >
          {movie.title}
        </Link>

        {/* Year & Genre */}
        <p className="text-[10px] text-[#A7A69F] truncate mt-0.5">
          {formatMovieMetadata(movie.releaseDate, movie.genreIds)}
        </p>
      </div>
    </div>
  );
};

export const ExplorePage: React.FC<ExplorePageProps> = ({
  defaultContentType = "all",
  pageTitle,
  eyebrow,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const genreRowRef = useRef<HTMLDivElement>(null);

  // Read initial params
  const initialSearch = searchParams.get("search") || "";
  const initialGenre = searchParams.get("genre")
    ? Number(searchParams.get("genre"))
    : undefined;
  const initialYear = searchParams.get("year")
    ? Number(searchParams.get("year"))
    : undefined;
  const initialSortBy = (searchParams.get("sortBy") as SortByOption) || "popularity.desc";
  const initialPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  // Content type from route
  const contentType: "all" | "movies" | "tv" =
    location.pathname === "/movies"
      ? "movies"
      : location.pathname.startsWith("/tv")
      ? "tv"
      : (searchParams.get("type") as "all" | "movies" | "tv") || defaultContentType;

  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(initialGenre);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(initialYear);
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [maxRuntime, setMaxRuntime] = useState<number>(300);
  const [sortBy, setSortBy] = useState<SortByOption>(initialSortBy);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [forcedFilteredSection, setForcedFilteredSection] = useState<string | null>(null);

  // Trailer modal state
  const [selectedTrailer, setSelectedTrailer] = useState<{
    id: number;
    title: string;
    key: string | null;
  } | null>(null);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  // Data fetching queries
  const { data: genresData } = useGenres();
  const { data: popularData } = usePopularMovies(1);
  const { data: topRatedData } = useTopRatedMovies(1);
  const { data: upcomingData } = useUpcomingMovies(1);

  // Reset pagination cleanly on route change
  useEffect(() => {
    setCurrentPage(1);
    setForcedFilteredSection(null);
  }, [location.pathname]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (initialSearch) params.set("search", initialSearch);
    if (selectedGenre) params.set("genre", String(selectedGenre));
    if (selectedYear) params.set("year", String(selectedYear));
    if (sortBy && sortBy !== "popularity.desc") params.set("sortBy", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));
    if (contentType && contentType !== "all" && location.pathname === "/explore") {
      params.set("type", contentType);
    }
    setSearchParams(params, { replace: true });
  }, [
    initialSearch,
    selectedGenre,
    selectedYear,
    sortBy,
    currentPage,
    contentType,
    location.pathname,
    setSearchParams,
  ]);

  // Check if any filter is active (triggers Filtered Catalog Grid instead of multi-row showcase)
  const isFilterActive = Boolean(
    initialSearch ||
      selectedGenre !== undefined ||
      selectedYear !== undefined ||
      selectedRating !== "all" ||
      selectedLanguage !== "all" ||
      maxRuntime < 300 ||
      forcedFilteredSection !== null ||
      sortBy !== "popularity.desc"
  );

  // Discover query used when filters are active
  const { data: discoverData, isLoading: isDiscoverLoading } = useDiscoverMovies({
    page: currentPage,
    genre: selectedGenre,
    year: selectedYear,
    sortBy: forcedFilteredSection === "top-rated" ? "vote_average.desc" : sortBy,
    search: initialSearch || undefined,
    type: contentType === "tv" ? "tv" : contentType === "movies" ? "movie" : undefined,
  });

  const handleResetFilters = () => {
    setSelectedGenre(undefined);
    setSelectedYear(undefined);
    setSelectedRating("all");
    setSelectedLanguage("all");
    setMaxRuntime(300);
    setSortBy("popularity.desc");
    setForcedFilteredSection(null);
    setCurrentPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleGenreSelect = (genreId: number | null) => {
    setSelectedGenre(genreId === null ? undefined : genreId);
    setForcedFilteredSection(null);
    setCurrentPage(1);
  };

  const handleSeeAll = (sectionKey: string) => {
    setForcedFilteredSection(sectionKey);
    if (sectionKey === "popular") setSortBy("popularity.desc");
    else if (sectionKey === "top-rated") setSortBy("vote_average.desc");
    else if (sectionKey === "upcoming") setSortBy("primary_release_date.desc");
    setCurrentPage(1);
  };

  const handlePlayTrailer = async (tmdbId: number, title: string) => {
    try {
      const vidData = await apiClient<{ primaryTrailer: { key: string } | null }>(
        `/movies/${tmdbId}/videos`
      );
      setSelectedTrailer({ id: tmdbId, title, key: vidData.primaryTrailer?.key || null });
    } catch {
      setSelectedTrailer({ id: tmdbId, title, key: null });
    }
    setTrailerModalOpen(true);
  };

  const scrollGenres = (direction: "left" | "right") => {
    if (genreRowRef.current) {
      genreRowRef.current.scrollBy({
        left: direction === "right" ? 280 : -280,
        behavior: "smooth",
      });
    }
  };

  // Filtered movies calculation
  const displayedFilteredMovies = useMemo(() => {
    const list = discoverData?.results && discoverData.results.length > 0
      ? discoverData.results
      : CURATED_POPULAR_MOVIES;

    let res = list;
    if (selectedRating !== "all") {
      const min = Number(selectedRating);
      res = res.filter((m) => m.voteAverage >= min);
    }
    return res;
  }, [discoverData, selectedRating]);

  // Curated 8-card showcase rows
  const popularShowcase = useMemo(() => {
    if (contentType === "tv") return CURATED_POPULAR_TV;
    if (popularData?.results && popularData.results.length >= 8) {
      return popularData.results.slice(0, 8);
    }
    return CURATED_POPULAR_MOVIES;
  }, [popularData, contentType]);

  const topRatedShowcase = useMemo(() => {
    if (topRatedData?.results && topRatedData.results.length >= 8) {
      return topRatedData.results.slice(0, 8);
    }
    return CURATED_TOP_RATED_MOVIES;
  }, [topRatedData]);

  const upcomingShowcase = useMemo(() => {
    if (upcomingData?.results && upcomingData.results.length >= 8) {
      return upcomingData.results.slice(0, 8);
    }
    return CURATED_UPCOMING_MOVIES;
  }, [upcomingData]);

  // Dynamic Eyebrow & Hero Copy
  const activeEyebrow =
    eyebrow ||
    (contentType === "tv"
      ? "TV SHOWS"
      : contentType === "movies"
      ? "MOVIES"
      : "EXPLORE");

  const heroHeadline =
    pageTitle ||
    (contentType === "tv" ? "Television\nStories Await" : "Cinematic\nWorlds Await");

  const heroSubtitle =
    contentType === "tv"
      ? "Explore a universe of series across every genre, era, and emotion. From timeless classics to the latest television blockbusters — there's always a story for you."
      : "Explore a universe of movies across every genre, era, and emotion. From timeless classics to the latest blockbusters — there's always a story for you.";

  // Active genre name for header when filtering by genre
  const activeGenreName = useMemo(() => {
    if (!selectedGenre) return null;
    const match = genresData?.genres?.find((g) => g.id === selectedGenre);
    return match ? match.name : "Genre";
  }, [selectedGenre, genresData]);

  return (
    <div className="min-h-screen bg-[#050707] text-[#F5F0E6] pb-24 selection:bg-[#E4B85A] selection:text-[#050707]">
      {/* ------------------------------------------------------------------
          1. CINEMATIC HERO SECTION (Exact Reference Design Match)
         ------------------------------------------------------------------ */}
      <section className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] lg:h-[520px] overflow-hidden">
        {/* Background Artwork: Traveler overlooking glowing sci-fi metropolis */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage:
              contentType === "tv"
                ? "url('/tv-hero.jpg')"
                : contentType === "movies"
                ? "url('/astronaut-hero.jpg')"
                : "url('/movies-hero.jpg')",
            backgroundPosition: "center 28%",
          }}
        />

        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050707] via-transparent to-transparent opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050707]/90 via-[#050707]/30 to-transparent max-w-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#050707]/80" />

        {/* Hero Content Grid: Left Title + Right Calligraphy */}
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          {/* Left Title & Description */}
          <div className="max-w-xl space-y-3 sm:space-y-4">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#E4B85A] uppercase">
              {activeEyebrow}
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-[#F5F0E6] leading-[1.08] tracking-tight whitespace-pre-line">
              {heroHeadline}
            </h1>

            <p className="text-xs sm:text-sm text-[#A7A69F] leading-relaxed max-w-lg">
              {heroSubtitle}
            </p>
          </div>

          {/* Right Editorial Calligraphy: "Good Movies Better Humans" */}
          <div className="hidden lg:flex flex-col items-end justify-center select-none pr-4">
            <p className="font-serif italic text-3xl xl:text-4xl font-light text-[#E4B85A]/90 tracking-wide text-right leading-tight drop-shadow-[0_2px_15px_rgba(228,184,90,0.35)]">
              Good<br />
              {contentType === "tv" ? "Series" : "Movies"}<br />
              Better<br />
              Humans
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          2. HORIZONTAL VISUAL GENRE / CATEGORY CARDS CAROUSEL
         ------------------------------------------------------------------ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="relative flex items-center">
          <div
            ref={genreRowRef}
            className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 pr-12 w-full"
          >
            {/* All Movies / All Titles Card (First, with grid icon) */}
            <button
              onClick={() => handleGenreSelect(null)}
              className={`shrink-0 w-28 sm:w-32 h-16 sm:h-20 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                selectedGenre === undefined
                  ? "bg-[#101414] border-2 border-[#E4B85A] shadow-[0_0_15px_rgba(228,184,90,0.3)] text-[#E4B85A]"
                  : "bg-[#0A0D0D] border border-[#282B27] text-[#A7A69F] hover:border-[#E4B85A]/50 hover:text-[#F5F0E6]"
              }`}
            >
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-[#E4B85A]" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-wide">
                {contentType === "tv" ? "All Shows" : "All Movies"}
              </span>
            </button>

            {/* Photographic Genre Cards */}
            {VISUAL_GENRES.filter((g) => g.id !== null).map((genre) => {
              const active = selectedGenre === genre.id;
              return (
                <button
                  key={genre.id}
                  onClick={() => handleGenreSelect(genre.id)}
                  className={`group relative shrink-0 w-28 sm:w-32 h-16 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
                    active
                      ? "border-2 border-[#E4B85A] shadow-[0_0_15px_rgba(228,184,90,0.35)] scale-[1.02]"
                      : "border border-[#282B27] hover:border-[#E4B85A]/60"
                  }`}
                >
                  <img
                    src={genre.image}
                    alt={genre.label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

                  <span
                    className={`relative z-10 block text-center text-xs font-bold tracking-wide mt-auto pb-2 transition-colors ${
                      active ? "text-[#E4B85A]" : "text-[#F5F0E6] group-hover:text-[#FFD985]"
                    }`}
                  >
                    {genre.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Chevron Button to Scroll Genre Row */}
          <button
            onClick={() => scrollGenres("right")}
            aria-label="Scroll Genres Right"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-[#101414]/90 border border-[#282B27] hover:border-[#E4B85A] text-[#E4B85A] flex items-center justify-center shadow-lg transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          3. MAIN SECTION: TWO-COLUMN LAYOUT (FILTER SIDEBAR + RIGHT CONTENT)
         ------------------------------------------------------------------ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* Mobile Filter Toggle Button */}
        <div className="md:hidden mb-4 flex items-center justify-between pb-3 border-b border-[#282B27]">
          <span className="text-xs font-semibold text-[#A7A69F]">
            {isFilterActive ? "Filtered Catalog" : "Browsing Catalog"}
          </span>
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101414] border border-[#282B27] text-xs font-semibold text-[#E4B85A]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
          {/* ---------------------------------------------------------------
              LEFT COLUMN: FILTER SIDEBAR (Exact Match to Reference Screenshot)
             --------------------------------------------------------------- */}
          <aside
            className={`w-full md:w-60 lg:w-64 shrink-0 bg-[#0A0D0D] border border-[#282B27] rounded-2xl p-5 space-y-5 sticky top-20 z-10 ${
              mobileFiltersOpen ? "block" : "hidden md:block"
            }`}
          >
            {/* Header: Filters + Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-[#282B27]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#E4B85A]" />
                <h3 className="text-sm font-bold text-[#F5F0E6]">Filters</h3>
              </div>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#A7A69F] hover:text-[#E4B85A] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* 1. Sort By */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A7A69F]">Sort By</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortByOption);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-[#101414] border border-[#282B27] rounded-xl px-3 py-2 text-xs text-[#F5F0E6] focus:outline-none focus:border-[#E4B85A] transition-colors cursor-pointer"
                >
                  <option value="popularity.desc">Most Popular</option>
                  <option value="vote_average.desc">Top Rated</option>
                  <option value="primary_release_date.desc">Newest Release</option>
                  <option value="title.asc">Title A–Z</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#A7A69F] pointer-events-none" />
              </div>
            </div>

            {/* 2. Release Year */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A7A69F]">Release Year</label>
              <input
                type="range"
                min="1900"
                max="2026"
                value={selectedYear || 2024}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full h-1 bg-[#282B27] rounded-lg appearance-none cursor-pointer accent-[#E4B85A]"
              />
              <div className="flex items-center justify-between text-[11px] text-[#A7A69F]">
                <span>1900</span>
                <span className="text-[#E4B85A] font-semibold">{selectedYear || 2024}</span>
                <span>2024</span>
              </div>
            </div>

            {/* 3. Rating */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A7A69F]">Rating</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "all", label: "All" },
                  { id: "8", label: "8+" },
                  { id: "7", label: "7+" },
                  { id: "6", label: "6+" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRating(r.id);
                      setCurrentPage(1);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRating === r.id
                        ? "bg-[#E4B85A] text-[#050707] shadow-sm shadow-[#E4B85A]/30 font-bold"
                        : "bg-[#101414] border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:border-[#927442]"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Genre */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A7A69F]">Genre</label>
              <div className="relative">
                <select
                  value={selectedGenre || ""}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value ? Number(e.target.value) : undefined);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-[#101414] border border-[#282B27] rounded-xl px-3 py-2 text-xs text-[#F5F0E6] focus:outline-none focus:border-[#E4B85A] transition-colors cursor-pointer"
                >
                  <option value="">All Genres</option>
                  {(genresData?.genres || []).map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#A7A69F] pointer-events-none" />
              </div>
            </div>

            {/* 5. Language */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A7A69F]">Language</label>
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full appearance-none bg-[#101414] border border-[#282B27] rounded-xl px-3 py-2 text-xs text-[#F5F0E6] focus:outline-none focus:border-[#E4B85A] transition-colors cursor-pointer"
                >
                  <option value="all">All Languages</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="hi">Hindi</option>
                  <option value="de">German</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#A7A69F] pointer-events-none" />
              </div>
            </div>

            {/* 6. Content Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A7A69F]">Content Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "all", label: "All", path: "/explore" },
                  { id: "movies", label: "Movies", path: "/movies" },
                  { id: "tv", label: "TV Shows", path: "/tv-shows" },
                ].map((ct) => (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => {
                      navigate(ct.path);
                      setCurrentPage(1);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      contentType === ct.id
                        ? "bg-[#E4B85A] text-[#050707] shadow-sm shadow-[#E4B85A]/30 font-bold"
                        : "bg-[#101414] border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:border-[#927442]"
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Runtime */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A7A69F]">Runtime</label>
              <input
                type="range"
                min="0"
                max="300"
                value={maxRuntime}
                onChange={(e) => setMaxRuntime(Number(e.target.value))}
                className="w-full h-1 bg-[#282B27] rounded-lg appearance-none cursor-pointer accent-[#E4B85A]"
              />
              <div className="flex items-center justify-between text-[11px] text-[#A7A69F]">
                <span>0 min</span>
                <span className="text-[#E4B85A] font-semibold">
                  {maxRuntime >= 300 ? "300+ min" : `${maxRuntime} min`}
                </span>
                <span>300+ min</span>
              </div>
            </div>
          </aside>

          {/* ---------------------------------------------------------------
              RIGHT COLUMN: MOVIE SHOWCASES (DEFAULT) OR FILTERED RESULTS
             --------------------------------------------------------------- */}
          <main className="flex-1 min-w-0 space-y-8">
            {!isFilterActive ? (
              /* =========================================================
                 DEFAULT SHOWCASE MODE: MULTI-ROW 8-CARD SECTIONS
                 (Popular Movies, Top Rated Movies, Upcoming Movies)
                 ========================================================= */
              <div className="space-y-10">
                {/* ROW 1: Popular Movies */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#F5F0E6] tracking-tight">
                      {contentType === "tv" ? "Popular TV Shows" : "Popular Movies"}
                    </h2>
                    <button
                      onClick={() => handleSeeAll("popular")}
                      className="text-xs font-semibold text-[#E4B85A] hover:text-[#FFD985] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>See All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
                    {popularShowcase.map((movie) => (
                      <ShowcaseMovieCard
                        key={movie.id}
                        movie={movie}
                        onPlayTrailer={handlePlayTrailer}
                      />
                    ))}
                  </div>
                </section>

                {/* ROW 2: Top Rated Movies */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#F5F0E6] tracking-tight">
                      {contentType === "tv" ? "Top Rated Series" : "Top Rated Movies"}
                    </h2>
                    <button
                      onClick={() => handleSeeAll("top-rated")}
                      className="text-xs font-semibold text-[#E4B85A] hover:text-[#FFD985] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>See All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
                    {topRatedShowcase.map((movie) => (
                      <ShowcaseMovieCard
                        key={movie.id}
                        movie={movie}
                        onPlayTrailer={handlePlayTrailer}
                      />
                    ))}
                  </div>
                </section>

                {/* ROW 3: Upcoming Movies */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#F5F0E6] tracking-tight">
                      {contentType === "tv" ? "Trending TV Shows" : "Upcoming Movies"}
                    </h2>
                    <button
                      onClick={() => handleSeeAll("upcoming")}
                      className="text-xs font-semibold text-[#E4B85A] hover:text-[#FFD985] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>See All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
                    {upcomingShowcase.map((movie) => (
                      <ShowcaseMovieCard
                        key={movie.id}
                        movie={movie}
                        onPlayTrailer={handlePlayTrailer}
                      />
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              /* =========================================================
                 FILTERED CATALOG MODE: RESPONSIVE GRID & PAGINATION
                 ========================================================= */
              <div className="space-y-6">
                {/* Catalog Toolbar */}
                <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#282B27]">
                  <div>
                    <h2 className="font-serif text-xl font-normal text-[#F5F0E6]">
                      {activeGenreName
                        ? `${activeGenreName} Titles`
                        : forcedFilteredSection === "top-rated"
                        ? "Top Rated Titles"
                        : forcedFilteredSection === "upcoming"
                        ? "Upcoming Titles"
                        : forcedFilteredSection === "popular"
                        ? "Popular Titles"
                        : "Filtered Results"}
                    </h2>
                    <span className="text-xs font-semibold text-[#A7A69F]">
                      Showing {displayedFilteredMovies.length} titles
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-[#101414] border border-[#282B27] rounded-lg">
                      <button
                        onClick={() => setViewMode("grid")}
                        aria-label="Grid View"
                        className={`p-1.5 rounded cursor-pointer ${
                          viewMode === "grid"
                            ? "text-[#E4B85A] bg-[#171B1A]"
                            : "text-[#A7A69F] hover:text-[#F5F0E6]"
                        }`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        aria-label="List View"
                        className={`p-1.5 rounded cursor-pointer ${
                          viewMode === "list"
                            ? "text-[#E4B85A] bg-[#171B1A]"
                            : "text-[#A7A69F] hover:text-[#F5F0E6]"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={handleResetFilters}
                      className="px-3 py-1.5 rounded-lg bg-[#101414] border border-[#282B27] text-xs font-semibold text-[#E4B85A] hover:bg-[#171B1A] transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Grid or List View */}
                {isDiscoverLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-[2/3] rounded-2xl bg-[#101414] animate-pulse border border-[#282B27]"
                      />
                    ))}
                  </div>
                ) : displayedFilteredMovies.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5"
                        : "space-y-3"
                    }
                  >
                    {displayedFilteredMovies.map((movie) => (
                      <ShowcaseMovieCard
                        key={movie.id}
                        movie={movie}
                        onPlayTrailer={handlePlayTrailer}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-[#0A0D0D] rounded-3xl border border-[#282B27] space-y-3">
                    <p className="text-base font-semibold text-[#F5F0E6]">No titles found</p>
                    <p className="text-xs text-[#A7A69F] max-w-sm mx-auto">
                      Try adjusting your filter criteria, relaxing the rating, or resetting filters.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 rounded-xl bg-[#101414] hover:bg-[#171B1A] border border-[#282B27] text-xs font-semibold text-[#E4B85A] transition-colors cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {displayedFilteredMovies.length > 0 && (
                  <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#282B27]">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#101414] border border-[#282B27] text-xs font-semibold text-[#F5F0E6] hover:border-[#E4B85A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <span className="text-xs font-semibold text-[#A7A69F] px-3">
                      Page {currentPage} of {Math.min(discoverData?.totalPages || 50, 500)}
                    </span>

                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage >= (discoverData?.totalPages || 50)}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#101414] border border-[#282B27] text-xs font-semibold text-[#F5F0E6] hover:border-[#E4B85A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        trailerKey={selectedTrailer?.key || null}
        title={selectedTrailer?.title || "Movie"}
      />
    </div>
  );
};
