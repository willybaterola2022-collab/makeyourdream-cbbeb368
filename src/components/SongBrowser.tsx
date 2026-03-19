import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";

interface SongEntry {
  title: string;
  artist: string;
  difficulty: 1 | 2 | 3;
}

const GENRE_COLORS: Record<string, string> = {
  Pop: "from-pink-500/20 to-purple-500/10",
  Rock: "from-red-500/20 to-orange-500/10",
  Balada: "from-blue-400/20 to-indigo-500/10",
  "R&B": "from-violet-500/20 to-fuchsia-500/10",
  Rap: "from-amber-500/20 to-yellow-500/10",
  Reggaeton: "from-green-400/20 to-emerald-500/10",
  "Latin Pop": "from-pink-400/20 to-rose-500/10",
  Jazz: "from-cyan-500/20 to-teal-500/10",
  Bolero: "from-red-400/20 to-rose-500/10",
  Ranchera: "from-orange-500/20 to-red-500/10",
};

const SONGS: Record<string, SongEntry[]> = {
  Pop: [
    { title: "Shape of You", artist: "Ed Sheeran", difficulty: 2 },
    { title: "Blinding Lights", artist: "The Weeknd", difficulty: 2 },
    { title: "Rolling in the Deep", artist: "Adele", difficulty: 3 },
    { title: "Shallow", artist: "Lady Gaga", difficulty: 3 },
    { title: "Perfect", artist: "Ed Sheeran", difficulty: 1 },
    { title: "Someone Like You", artist: "Adele", difficulty: 3 },
    { title: "Stay With Me", artist: "Sam Smith", difficulty: 2 },
    { title: "Hello", artist: "Adele", difficulty: 3 },
    { title: "Havana", artist: "Camila Cabello", difficulty: 2 },
    { title: "Señorita", artist: "Shawn Mendes", difficulty: 1 },
    { title: "Levitating", artist: "Dua Lipa", difficulty: 2 },
    { title: "Watermelon Sugar", artist: "Harry Styles", difficulty: 1 },
    { title: "drivers license", artist: "Olivia Rodrigo", difficulty: 2 },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", difficulty: 2 },
    { title: "All of Me", artist: "John Legend", difficulty: 2 },
    { title: "Uptown Funk", artist: "Bruno Mars", difficulty: 2 },
    { title: "Just the Way You Are", artist: "Bruno Mars", difficulty: 1 },
    { title: "Counting Stars", artist: "OneRepublic", difficulty: 2 },
    { title: "Viva la Vida", artist: "Coldplay", difficulty: 2 },
    { title: "Bad Guy", artist: "Billie Eilish", difficulty: 2 },
  ],
  Rock: [
    { title: "Bohemian Rhapsody", artist: "Queen", difficulty: 3 },
    { title: "Stairway to Heaven", artist: "Led Zeppelin", difficulty: 3 },
    { title: "Hotel California", artist: "Eagles", difficulty: 2 },
    { title: "Sweet Child O' Mine", artist: "Guns N' Roses", difficulty: 3 },
    { title: "Wonderwall", artist: "Oasis", difficulty: 1 },
    { title: "Losing My Religion", artist: "R.E.M.", difficulty: 2 },
    { title: "Under the Bridge", artist: "RHCP", difficulty: 2 },
    { title: "Creep", artist: "Radiohead", difficulty: 2 },
    { title: "Smells Like Teen Spirit", artist: "Nirvana", difficulty: 2 },
    { title: "Don't Stop Believin'", artist: "Journey", difficulty: 2 },
    { title: "Livin' on a Prayer", artist: "Bon Jovi", difficulty: 2 },
    { title: "Imagine", artist: "John Lennon", difficulty: 1 },
    { title: "Let It Be", artist: "The Beatles", difficulty: 1 },
    { title: "Hey Jude", artist: "The Beatles", difficulty: 1 },
    { title: "Yesterday", artist: "The Beatles", difficulty: 1 },
    { title: "Nothing Else Matters", artist: "Metallica", difficulty: 2 },
    { title: "Dream On", artist: "Aerosmith", difficulty: 3 },
    { title: "Wish You Were Here", artist: "Pink Floyd", difficulty: 2 },
    { title: "Black", artist: "Pearl Jam", difficulty: 3 },
    { title: "Zombie", artist: "The Cranberries", difficulty: 2 },
  ],
  Balada: [
    { title: "Someone Like You", artist: "Adele", difficulty: 3 },
    { title: "My Heart Will Go On", artist: "Celine Dion", difficulty: 3 },
    { title: "Hallelujah", artist: "Leonard Cohen", difficulty: 2 },
    { title: "I Will Always Love You", artist: "Whitney Houston", difficulty: 3 },
    { title: "The Power of Love", artist: "Celine Dion", difficulty: 3 },
    { title: "Un-Break My Heart", artist: "Toni Braxton", difficulty: 3 },
    { title: "Without You", artist: "Mariah Carey", difficulty: 3 },
    { title: "Hero", artist: "Mariah Carey", difficulty: 2 },
    { title: "A Thousand Years", artist: "Christina Perri", difficulty: 2 },
    { title: "Say You Won't Let Go", artist: "James Arthur", difficulty: 2 },
    { title: "All By Myself", artist: "Celine Dion", difficulty: 3 },
    { title: "Unchained Melody", artist: "Righteous Brothers", difficulty: 2 },
    { title: "Fix You", artist: "Coldplay", difficulty: 2 },
    { title: "When I Was Your Man", artist: "Bruno Mars", difficulty: 2 },
    { title: "Love Me Like You Do", artist: "Ellie Goulding", difficulty: 2 },
    { title: "Make You Feel My Love", artist: "Adele", difficulty: 2 },
    { title: "Gravity", artist: "John Mayer", difficulty: 2 },
    { title: "The Scientist", artist: "Coldplay", difficulty: 1 },
    { title: "Skinny Love", artist: "Bon Iver", difficulty: 2 },
    { title: "If I Ain't Got You", artist: "Alicia Keys", difficulty: 3 },
  ],
  "R&B": [
    { title: "No Scrubs", artist: "TLC", difficulty: 2 },
    { title: "Crazy in Love", artist: "Beyoncé", difficulty: 3 },
    { title: "Halo", artist: "Beyoncé", difficulty: 3 },
    { title: "Fallin'", artist: "Alicia Keys", difficulty: 3 },
    { title: "Kiss from a Rose", artist: "Seal", difficulty: 3 },
    { title: "Let's Stay Together", artist: "Al Green", difficulty: 2 },
    { title: "Ain't No Sunshine", artist: "Bill Withers", difficulty: 2 },
    { title: "I Will Always Love You", artist: "Whitney Houston", difficulty: 3 },
    { title: "Blinding Lights", artist: "The Weeknd", difficulty: 2 },
    { title: "Earned It", artist: "The Weeknd", difficulty: 2 },
    { title: "Redbone", artist: "Childish Gambino", difficulty: 2 },
    { title: "Say My Name", artist: "Destiny's Child", difficulty: 2 },
    { title: "End of the Road", artist: "Boyz II Men", difficulty: 2 },
    { title: "I Believe I Can Fly", artist: "R. Kelly", difficulty: 2 },
    { title: "Superstition", artist: "Stevie Wonder", difficulty: 2 },
    { title: "Isn't She Lovely", artist: "Stevie Wonder", difficulty: 2 },
    { title: "Ordinary People", artist: "John Legend", difficulty: 2 },
    { title: "Treasure", artist: "Bruno Mars", difficulty: 2 },
    { title: "Leave the Door Open", artist: "Silk Sonic", difficulty: 2 },
    { title: "Best Part", artist: "Daniel Caesar", difficulty: 2 },
  ],
  Rap: [
    { title: "Lose Yourself", artist: "Eminem", difficulty: 3 },
    { title: "Juicy", artist: "The Notorious B.I.G.", difficulty: 2 },
    { title: "Sicko Mode", artist: "Travis Scott", difficulty: 3 },
    { title: "God's Plan", artist: "Drake", difficulty: 2 },
    { title: "HUMBLE.", artist: "Kendrick Lamar", difficulty: 3 },
    { title: "Hotline Bling", artist: "Drake", difficulty: 1 },
    { title: "In Da Club", artist: "50 Cent", difficulty: 2 },
    { title: "Stan", artist: "Eminem", difficulty: 3 },
    { title: "Alright", artist: "Kendrick Lamar", difficulty: 2 },
    { title: "Empire State of Mind", artist: "Jay-Z", difficulty: 2 },
    { title: "Gangsta's Paradise", artist: "Coolio", difficulty: 2 },
    { title: "California Love", artist: "2Pac", difficulty: 2 },
    { title: "Hey Ya!", artist: "OutKast", difficulty: 2 },
    { title: "Stronger", artist: "Kanye West", difficulty: 2 },
    { title: "Old Town Road", artist: "Lil Nas X", difficulty: 1 },
    { title: "Industry Baby", artist: "Lil Nas X", difficulty: 2 },
    { title: "Savage", artist: "Megan Thee Stallion", difficulty: 2 },
    { title: "WAP", artist: "Cardi B", difficulty: 3 },
    { title: "Astronaut in the Ocean", artist: "Masked Wolf", difficulty: 2 },
    { title: "Rapstar", artist: "Polo G", difficulty: 2 },
  ],
  Reggaeton: [
    { title: "Despacito", artist: "Luis Fonsi", difficulty: 2 },
    { title: "Gasolina", artist: "Daddy Yankee", difficulty: 2 },
    { title: "Dákiti", artist: "Bad Bunny", difficulty: 2 },
    { title: "Con Calma", artist: "Daddy Yankee", difficulty: 1 },
    { title: "Tusa", artist: "Karol G", difficulty: 2 },
    { title: "Baila Conmigo", artist: "Selena Gomez", difficulty: 1 },
    { title: "La Tortura", artist: "Shakira", difficulty: 2 },
    { title: "Me Porto Bonito", artist: "Bad Bunny", difficulty: 2 },
    { title: "Hawái", artist: "Maluma", difficulty: 2 },
    { title: "Pepas", artist: "Farruko", difficulty: 2 },
    { title: "Felices los 4", artist: "Maluma", difficulty: 1 },
    { title: "Ella Baila Sola", artist: "Eslabón Armado", difficulty: 2 },
    { title: "Yonaguni", artist: "Bad Bunny", difficulty: 2 },
    { title: "Bichota", artist: "Karol G", difficulty: 2 },
    { title: "Te Boté", artist: "Nio García", difficulty: 2 },
    { title: "Yo Perreo Sola", artist: "Bad Bunny", difficulty: 2 },
    { title: "Safaera", artist: "Bad Bunny", difficulty: 3 },
    { title: "China", artist: "Anuel AA", difficulty: 2 },
    { title: "Callaíta", artist: "Bad Bunny", difficulty: 1 },
    { title: "Que Tire Pa Lante", artist: "Daddy Yankee", difficulty: 1 },
  ],
  "Latin Pop": [
    { title: "Vivir Mi Vida", artist: "Marc Anthony", difficulty: 2 },
    { title: "La Bicicleta", artist: "Shakira", difficulty: 2 },
    { title: "Bailando", artist: "Enrique Iglesias", difficulty: 2 },
    { title: "Waka Waka", artist: "Shakira", difficulty: 2 },
    { title: "Hips Don't Lie", artist: "Shakira", difficulty: 2 },
    { title: "Suerte", artist: "Shakira", difficulty: 2 },
    { title: "Corazón Partío", artist: "Alejandro Sanz", difficulty: 2 },
    { title: "La Camisa Negra", artist: "Juanes", difficulty: 1 },
    { title: "A Dios le Pido", artist: "Juanes", difficulty: 2 },
    { title: "Livin' la Vida Loca", artist: "Ricky Martin", difficulty: 2 },
    { title: "Eres Tú", artist: "Mocedades", difficulty: 2 },
    { title: "Color Esperanza", artist: "Diego Torres", difficulty: 2 },
    { title: "Me Enamora", artist: "Juanes", difficulty: 1 },
    { title: "Limón y Sal", artist: "Julieta Venegas", difficulty: 1 },
    { title: "Tabú", artist: "Pablo Alborán", difficulty: 2 },
    { title: "Solamente Tú", artist: "Pablo Alborán", difficulty: 2 },
    { title: "Flaca", artist: "Andrés Calamaro", difficulty: 2 },
    { title: "La Flaca", artist: "Jarabe de Palo", difficulty: 1 },
    { title: "Ojalá", artist: "Silvio Rodríguez", difficulty: 2 },
    { title: "Mediterráneo", artist: "Serrat", difficulty: 2 },
  ],
  Jazz: [
    { title: "Fly Me to the Moon", artist: "Frank Sinatra", difficulty: 2 },
    { title: "What a Wonderful World", artist: "Louis Armstrong", difficulty: 1 },
    { title: "Feeling Good", artist: "Nina Simone", difficulty: 2 },
    { title: "Summertime", artist: "Ella Fitzgerald", difficulty: 2 },
    { title: "The Way You Look Tonight", artist: "Frank Sinatra", difficulty: 2 },
    { title: "My Funny Valentine", artist: "Chet Baker", difficulty: 2 },
    { title: "All of Me", artist: "Billie Holiday", difficulty: 2 },
    { title: "Autumn Leaves", artist: "Nat King Cole", difficulty: 2 },
    { title: "Come Fly With Me", artist: "Frank Sinatra", difficulty: 2 },
    { title: "Blue Moon", artist: "Ella Fitzgerald", difficulty: 2 },
    { title: "Misty", artist: "Ella Fitzgerald", difficulty: 2 },
    { title: "Night and Day", artist: "Frank Sinatra", difficulty: 2 },
    { title: "Georgia on My Mind", artist: "Ray Charles", difficulty: 2 },
    { title: "At Last", artist: "Etta James", difficulty: 2 },
    { title: "Dream a Little Dream", artist: "Mama Cass", difficulty: 1 },
    { title: "Moon River", artist: "Andy Williams", difficulty: 1 },
    { title: "Cheek to Cheek", artist: "Fred Astaire", difficulty: 2 },
    { title: "L-O-V-E", artist: "Nat King Cole", difficulty: 1 },
    { title: "Cry Me a River", artist: "Julie London", difficulty: 2 },
    { title: "Sway", artist: "Dean Martin", difficulty: 1 },
  ],
  Bolero: [
    { title: "Bésame Mucho", artist: "Consuelo Velázquez", difficulty: 1 },
    { title: "Quizás, Quizás, Quizás", artist: "Nat King Cole", difficulty: 1 },
    { title: "Perfidia", artist: "Los Panchos", difficulty: 2 },
    { title: "Historia de un Amor", artist: "Guadalupe Pineda", difficulty: 2 },
    { title: "Contigo en la Distancia", artist: "Luis Miguel", difficulty: 2 },
    { title: "Solamente Una Vez", artist: "Agustín Lara", difficulty: 2 },
    { title: "El Reloj", artist: "Luis Miguel", difficulty: 2 },
    { title: "Sabor a Mí", artist: "Los Panchos", difficulty: 1 },
    { title: "Nosotros", artist: "Los Panchos", difficulty: 2 },
    { title: "La Puerta", artist: "Luis Miguel", difficulty: 2 },
    { title: "Cómo Fue", artist: "Benny Moré", difficulty: 2 },
    { title: "Toda Una Vida", artist: "Los Panchos", difficulty: 1 },
    { title: "Amor Mío", artist: "Luis Miguel", difficulty: 2 },
    { title: "Somos Novios", artist: "Armando Manzanero", difficulty: 2 },
    { title: "Adoro", artist: "Armando Manzanero", difficulty: 1 },
    { title: "No Me Platiques Más", artist: "Luis Miguel", difficulty: 2 },
    { title: "Frenesí", artist: "Los Panchos", difficulty: 2 },
    { title: "Noche de Ronda", artist: "Agustín Lara", difficulty: 2 },
    { title: "Amor Eterno", artist: "Rocío Dúrcal", difficulty: 2 },
    { title: "Si Nos Dejan", artist: "Luis Miguel", difficulty: 2 },
  ],
  Ranchera: [
    { title: "Cielito Lindo", artist: "Tradicional", difficulty: 1 },
    { title: "El Rey", artist: "Vicente Fernández", difficulty: 2 },
    { title: "Volver, Volver", artist: "Vicente Fernández", difficulty: 2 },
    { title: "México Lindo y Querido", artist: "Jorge Negrete", difficulty: 2 },
    { title: "La Bikina", artist: "Luis Miguel", difficulty: 2 },
    { title: "Si Nos Dejan", artist: "Luis Miguel", difficulty: 2 },
    { title: "Cucurrucucú Paloma", artist: "Lola Beltrán", difficulty: 3 },
    { title: "Amor Eterno", artist: "Rocío Dúrcal", difficulty: 2 },
    { title: "Por Tu Maldito Amor", artist: "Vicente Fernández", difficulty: 2 },
    { title: "Paloma Negra", artist: "Chavela Vargas", difficulty: 3 },
    { title: "Hermoso Cariño", artist: "Vicente Fernández", difficulty: 2 },
    { title: "Las Mañanitas", artist: "Tradicional", difficulty: 1 },
    { title: "Te Solté la Rienda", artist: "Antonio Aguilar", difficulty: 2 },
    { title: "La Llorona", artist: "Tradicional", difficulty: 3 },
    { title: "Ay Jalisco No Te Rajes", artist: "Jorge Negrete", difficulty: 2 },
    { title: "Guadalajara", artist: "Mariachi Vargas", difficulty: 2 },
    { title: "Un Mundo Raro", artist: "José Alfredo Jiménez", difficulty: 2 },
    { title: "Ella", artist: "José Alfredo Jiménez", difficulty: 2 },
    { title: "El Hijo del Pueblo", artist: "Vicente Fernández", difficulty: 2 },
    { title: "Que Te Vaya Bonito", artist: "Vicente Fernández", difficulty: 2 },
  ],
};

const genres = Object.keys(SONGS);

const DifficultyStars = ({ level }: { level: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3].map((s) => (
      <span key={s} className={`text-[8px] ${s <= level ? "text-primary" : "text-muted-foreground/30"}`}>★</span>
    ))}
  </div>
);

export function SongBrowser() {
  const [activeGenre, setActiveGenre] = useState("Pop");
  const navigate = useNavigate();

  return (
    <div className="space-y-4 w-full">
      {/* Genre chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeGenre === g
                ? "stage-gradient text-primary-foreground"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Songs horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {SONGS[activeGenre]?.map((song, i) => (
          <motion.button
            key={`${song.title}-${i}`}
            onClick={() => navigate("/karaoke")}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            whileTap={{ scale: 0.95 }}
            className={`snap-start min-w-[140px] md:min-w-[160px] glass-card p-3 text-left hover:border-primary/30 transition-all bg-gradient-to-b ${GENRE_COLORS[activeGenre] || "from-primary/10 to-primary/5"}`}
          >
            <div className="h-8 w-8 rounded-lg bg-background/40 flex items-center justify-center mb-2">
              <Play className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-xs font-bold text-foreground truncate">{song.title}</p>
            <p className="text-[10px] text-muted-foreground truncate">{song.artist}</p>
            <div className="mt-1.5">
              <DifficultyStars level={song.difficulty} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
