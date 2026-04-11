import Carousel from "../components/Carousel.tsx"
import "../App.css"
import { Link } from "react-router-dom"

const featured = {
  name: "Dark Matter Reverb",
  creator: "neural_waves",
  description: "A deep, cavernous reverb preset built for atmospheric production and cinematic soundscapes. Sits perfectly under heavy synths and distorted bass.",
  tags: ["Dubstep", "Atmospheric", "Dark"],
  downloads: "12.4k",
}

const sections = [
  {
    label: "Trending This Week",
    accent: "#76DBCA",
    items: [
      { id: 0, name: "Neon Drift",        creator: "synthkid",     genre: "Synthwave", downloads: "8.1k"  },
      { id: 1, name: "Bass Canyon",       creator: "lowfreq_osc",  genre: "Dubstep",   downloads: "6.7k"  },
      { id: 2, name: "Glass Rain",        creator: "aura.wav",     genre: "Ambient",   downloads: "5.3k"  },
      { id: 3, name: "Chrome Pulse",      creator: "neural_waves", genre: "Pop",       downloads: "4.9k"  },
      { id: 4, name: "Void Walker",       creator: "dark_osc",     genre: "Dubstep",   downloads: "4.2k"  },
      { id: 5, name: "Solar Flare",       creator: "heatwave",     genre: "Hip Hop",   downloads: "3.8k"  },
      { id: 6, name: "Midnight Signal",   creator: "phaseshift",   genre: "Synthwave", downloads: "3.1k"  },
      { id: 7, name: "Static Memory",     creator: "glitch.io",    genre: "Ambient",   downloads: "2.9k"  },
      { id: 8, name: "Analog Dream",      creator: "retro_vm",     genre: "Pop",       downloads: "2.4k"  },
      { id: 9, name: "Subzero Drop",      creator: "coldwave",     genre: "Dubstep",   downloads: "2.1k"  },
    ],
  },
  {
    label: "Built for the Drop",
    accent: "#A3E635",
    items: [
      { id: 0, name: "Seismic Wobble",    creator: "lowfreq_osc",  genre: "Dubstep",   downloads: "9.2k"  },
      { id: 1, name: "Void Walker",       creator: "dark_osc",     genre: "Dubstep",   downloads: "7.4k"  },
      { id: 2, name: "Dark Matter Reverb",creator: "neural_waves", genre: "Dubstep",   downloads: "6.9k"  },
      { id: 3, name: "Subzero Drop",      creator: "coldwave",     genre: "Dubstep",   downloads: "5.5k"  },
      { id: 4, name: "Grinding Gears",    creator: "mechsound",    genre: "Dubstep",   downloads: "4.8k"  },
      { id: 5, name: "Shadow Pulse",      creator: "umbra_audio",  genre: "Dubstep",   downloads: "3.9k"  },
      { id: 6, name: "Iron Curtain",      creator: "steelwav",     genre: "Dubstep",   downloads: "3.2k"  },
      { id: 7, name: "Pressure Wave",     creator: "lowfreq_osc",  genre: "Dubstep",   downloads: "2.7k"  },
      { id: 8, name: "Hellgate Bass",     creator: "infernal.hz",  genre: "Dubstep",   downloads: "2.2k"  },
      { id: 9, name: "Shatter Point",     creator: "dark_osc",     genre: "Dubstep",   downloads: "1.9k"  },
    ],
  },
  {
    label: "Synthwave Essentials",
    accent: "#FACC15",
    items: [
      { id: 0, name: "Neon Drift",        creator: "synthkid",     genre: "Synthwave", downloads: "8.1k"  },
      { id: 1, name: "Midnight Signal",   creator: "phaseshift",   genre: "Synthwave", downloads: "6.3k"  },
      { id: 2, name: "Retro Horizon",     creator: "retro_vm",     genre: "Synthwave", downloads: "5.7k"  },
      { id: 3, name: "Neon City Rain",    creator: "aura.wav",     genre: "Synthwave", downloads: "4.4k"  },
      { id: 4, name: "Chromatic Chase",   creator: "synthkid",     genre: "Synthwave", downloads: "3.9k"  },
      { id: 5, name: "Laser Grid",        creator: "gridmaster",   genre: "Synthwave", downloads: "3.4k"  },
      { id: 6, name: "Outrun Forever",    creator: "phaseshift",   genre: "Synthwave", downloads: "2.8k"  },
      { id: 7, name: "Pastel Skies",      creator: "dreamsynth",   genre: "Synthwave", downloads: "2.3k"  },
      { id: 8, name: "Arcade Pulse",      creator: "retro_vm",     genre: "Synthwave", downloads: "1.9k"  },
      { id: 9, name: "Vector Run",        creator: "gridmaster",   genre: "Synthwave", downloads: "1.5k"  },
    ],
  },
  {
    label: "Pop Ready",
    accent: "#F472B6",
    items: [
      { id: 0, name: "Chrome Pulse",      creator: "neural_waves", genre: "Pop",       downloads: "4.9k"  },
      { id: 1, name: "Analog Dream",      creator: "retro_vm",     genre: "Pop",       downloads: "4.1k"  },
      { id: 2, name: "Shimmer Coat",      creator: "gloss.audio",  genre: "Pop",       downloads: "3.6k"  },
      { id: 3, name: "Sugar Rush",        creator: "sweetbeats",   genre: "Pop",       downloads: "3.1k"  },
      { id: 4, name: "Sparkle Delay",     creator: "aura.wav",     genre: "Pop",       downloads: "2.8k"  },
      { id: 5, name: "Velvet Drop",       creator: "gloss.audio",  genre: "Pop",       downloads: "2.4k"  },
      { id: 6, name: "Prismatic",         creator: "heatwave",     genre: "Pop",       downloads: "2.0k"  },
      { id: 7, name: "Cloud Nine",        creator: "sweetbeats",   genre: "Pop",       downloads: "1.7k"  },
      { id: 8, name: "Pastel Hook",       creator: "dreamsynth",   genre: "Pop",       downloads: "1.4k"  },
      { id: 9, name: "Golden Hour",       creator: "neural_waves", genre: "Pop",       downloads: "1.1k"  },
    ],
  },
  {
    label: "Hip Hop Foundations",
    accent: "#FB923C",
    items: [
      { id: 0, name: "Solar Flare",       creator: "heatwave",     genre: "Hip Hop",   downloads: "3.8k"  },
      { id: 1, name: "Dusty Sampler",     creator: "cratedigger",  genre: "Hip Hop",   downloads: "3.3k"  },
      { id: 2, name: "Lo-Fi Haze",        creator: "static_bed",   genre: "Hip Hop",   downloads: "2.9k"  },
      { id: 3, name: "808 Cathedral",     creator: "lowfreq_osc",  genre: "Hip Hop",   downloads: "2.6k"  },
      { id: 4, name: "Trap Fog",          creator: "dark_osc",     genre: "Hip Hop",   downloads: "2.2k"  },
      { id: 5, name: "Boom Bap Verb",     creator: "cratedigger",  genre: "Hip Hop",   downloads: "1.9k"  },
      { id: 6, name: "Golden Chop",       creator: "heatwave",     genre: "Hip Hop",   downloads: "1.6k"  },
      { id: 7, name: "Murky Waters",      creator: "static_bed",   genre: "Hip Hop",   downloads: "1.4k"  },
      { id: 8, name: "Concrete Echo",     creator: "urbansound",   genre: "Hip Hop",   downloads: "1.1k"  },
      { id: 9, name: "Midnight Cipher",   creator: "cratedigger",  genre: "Hip Hop",   downloads: "0.9k"  },
    ],
  },
]

function Explore() {
  return (
    <div className="page">

      {/* Title card */}
      <div className="explore-title-card">
        <h1 className="explore-title">Explore</h1>
        <p className="explore-tagline">Presets crafted by the community.</p>
      </div>

      {/* Featured */}
      <div className="featured-preset">
        <div className="featured-preset__card">
          <div className="featured-preset__body">
            <span className="featured-label">Featured</span>
            <h2 className="featured-name">{featured.name}</h2>
            <p className="featured-creator">by {featured.creator}</p>
            <p className="featured-desc">{featured.description}</p>
            <div className="featured-tags">
              {featured.tags.map(t => <span key={t} className="preset-tag">{t}</span>)}
            </div>
            <div className="featured-footer">
              <span className="preset-downloads">↓ {featured.downloads} downloads</span>
              <Link to="/signup" className="try-btn">Try it in MAGE →</Link>
            </div>
          </div>
          <div className="featured-preset__visual" />
        </div>
      </div>

      {/* Genre sections */}
      {sections.map(section => (
        <div
          key={section.label}
          className="explore-section"
          style={{ '--section-accent': section.accent } as React.CSSProperties}
        >
          <div className="section-header">
            <span className="section-accent-bar" />
            <h2 className="section-title">{section.label}</h2>
          </div>
          <Carousel items={section.items} accent={section.accent} />
        </div>
      ))}

    </div>
  )
}

export default Explore
