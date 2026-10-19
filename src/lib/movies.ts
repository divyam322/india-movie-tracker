export type Movie = {
  id: string;
  title: string;
  language: string;
  genre: string[];
  releaseDate: string;
  duration: string;
  certificate: string;
  synopsis: string;
  hue: number;
  rating: number;
  votes: number;
};

export type Theatre = {
  id: string;
  name: string;
  city: string;
  area: string;
  formats: string[];
  priceMin: number;
  priceMax: number;
};

export const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune"];

export const MOVIES: Movie[] = [
  { id: "veer-raja", title: "Veer Raja", language: "Hindi", genre: ["Action", "Drama"], releaseDate: "2026-10-24", duration: "2h 41m", certificate: "UA 13+", synopsis: "A disgraced soldier returns to his village to protect it from a ruthless mining cartel.", hue: 25, rating: 4.2, votes: 1840 },
  { id: "kaatru-veliyidai-2", title: "Kaatru", language: "Tamil", genre: ["Romance", "Musical"], releaseDate: "2026-10-31", duration: "2h 18m", certificate: "U", synopsis: "Two musicians from rival families find harmony on a monsoon tour of Kerala.", hue: 190, rating: 3.9, votes: 920 },
  { id: "pushpak", title: "Pushpak", language: "Telugu", genre: ["Sci-Fi", "Mythology"], releaseDate: "2026-11-07", duration: "2h 55m", certificate: "UA 16+", synopsis: "An archaeologist uncovers a flying chariot that rewrites everything known about history.", hue: 280, rating: 4.5, votes: 3120 },
  { id: "ghar-wapsi", title: "Ghar Wapsi", language: "Hindi", genre: ["Comedy", "Family"], releaseDate: "2026-11-14", duration: "2h 05m", certificate: "U", synopsis: "Three siblings reunite for a chaotic Diwali in their grandmother's crumbling haveli.", hue: 50, rating: 4.0, votes: 640 },
  { id: "kolkata-noir", title: "Kolkata Noir", language: "Bengali", genre: ["Thriller", "Crime"], releaseDate: "2026-11-21", duration: "2h 12m", certificate: "A", synopsis: "A retired detective is pulled back into a murder case on the banks of the Hooghly.", hue: 0, rating: 4.3, votes: 410 },
  { id: "daiva", title: "Daiva", language: "Kannada", genre: ["Folk", "Thriller"], releaseDate: "2026-11-28", duration: "2h 30m", certificate: "UA 13+", synopsis: "A forest guardian's ancient ritual awakens forces the modern world cannot control.", hue: 140, rating: 4.6, votes: 2210 },
];

export const THEATRES: Theatre[] = [
  { id: "pvr-phoenix", name: "PVR Phoenix Palladium", city: "Mumbai", area: "Lower Parel", formats: ["IMAX", "4DX", "2D"], priceMin: 250, priceMax: 950 },
  { id: "inox-nariman", name: "INOX Nariman Point", city: "Mumbai", area: "Nariman Point", formats: ["2D", "Recliner"], priceMin: 220, priceMax: 700 },
  { id: "gaiety", name: "Gaiety Galaxy", city: "Mumbai", area: "Bandra", formats: ["2D"], priceMin: 120, priceMax: 300 },
  { id: "pvr-select", name: "PVR Select Citywalk", city: "Delhi", area: "Saket", formats: ["IMAX", "Gold", "2D"], priceMin: 300, priceMax: 1200 },
  { id: "delite", name: "Delite Cinema", city: "Delhi", area: "Daryaganj", formats: ["2D"], priceMin: 150, priceMax: 350 },
  { id: "pvr-orion", name: "PVR Orion Mall", city: "Bengaluru", area: "Rajajinagar", formats: ["IMAX", "2D"], priceMin: 230, priceMax: 850 },
  { id: "cinepolis-nexus", name: "Cinépolis Nexus", city: "Bengaluru", area: "Koramangala", formats: ["4DX", "2D"], priceMin: 200, priceMax: 750 },
  { id: "prasads", name: "Prasads Multiplex", city: "Hyderabad", area: "Necklace Road", formats: ["Large Screen", "2D"], priceMin: 150, priceMax: 450 },
  { id: "amb", name: "AMB Cinemas", city: "Hyderabad", area: "Gachibowli", formats: ["Dolby Atmos", "2D"], priceMin: 200, priceMax: 600 },
  { id: "sathyam", name: "Sathyam Cinemas", city: "Chennai", area: "Royapettah", formats: ["2D", "Dolby Atmos"], priceMin: 160, priceMax: 450 },
  { id: "inox-quest", name: "INOX Quest Mall", city: "Kolkata", area: "Ballygunge", formats: ["2D", "Recliner"], priceMin: 180, priceMax: 600 },
  { id: "city-pride", name: "City Pride Kothrud", city: "Pune", area: "Kothrud", formats: ["2D"], priceMin: 150, priceMax: 400 },
];

export type Review = { id: string; movieId: string; author: string; rating: number; text: string; date: string };

export const SEED_REVIEWS: Review[] = [
  { id: "r1", movieId: "veer-raja", author: "Ananya S.", rating: 5, text: "Interval block gave me goosebumps. Watch it in IMAX!", date: "2026-10-12" },
  { id: "r2", movieId: "veer-raja", author: "Rohit K.", rating: 4, text: "Strong second half, songs could be shorter.", date: "2026-10-14" },
  { id: "r3", movieId: "pushpak", author: "Sai P.", rating: 5, text: "The trailer alone is worth the hype. VFX look world class.", date: "2026-10-15" },
  { id: "r4", movieId: "daiva", author: "Meghana R.", rating: 5, text: "Folk music in the teaser is haunting.", date: "2026-10-16" },
];

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
