export const genreOptions = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Music",
  "Mystery",
  "Sci-Fi",
  "Sports",
  "Thriller",
  "Anthology",
  "Heist",
] as const;

export const yearOptions = (() => {
  const end = new Date().getFullYear();
  const start = end - 25;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i).reverse();
})();

export const contentTypeOptions = [
  { value: "all", label: "All types" },
  { value: "movie", label: "Movies" },
  { value: "show", label: "Shows" },
] as const;

export const ratingFilterOptions = [
  "TV-Y7",
  "TV-PG",
  "PG",
  "PG-13",
  "TV-14",
  "R",
] as const;

export const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A–Z" },
] as const;
