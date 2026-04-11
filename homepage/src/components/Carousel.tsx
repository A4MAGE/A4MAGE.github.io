import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import "../App.css"
import useEmblaCarousel from 'embla-carousel-react'

interface PresetItem {
  id: number
  name: string
  creator: string
  genre: string
  downloads: string
}

interface CarouselProps {
  items: PresetItem[]
  accent: string
}

function Carousel({ items, accent }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' })
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', () => setSelectedIndex(emblaApi.selectedScrollSnap()))
  }, [emblaApi])

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  const getSlideStyle = (index: number) => {
    let distance = Math.abs(index - selectedIndex)
    if (index === items.length - 1 && selectedIndex === 0) distance = 1
    else if (index === 0 && selectedIndex === items.length - 1) distance = 1

    const scale = Math.max(0.7, 1 - distance * 0.1)
    const opacity = Math.max(0.3, 1 - distance * 0.4)
    const blur = distance * 2
    return {
      transform: `scale(${scale})`,
      opacity,
      filter: `blur(${blur}px)`,
      transition: 'transform 0.3s ease, opacity 0.3s ease, filter 0.3s ease',
    }
  }

  return (
    <div className="carousel-wrapper">
      <button className="carousel-btn" onClick={scrollPrev}>←</button>
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {items.map((item, index) => (
            <div className="embla__slide" key={item.id}>
              <div className="carousel-slide-content" style={getSlideStyle(index)}>
                <div className="preset-card">
                  <div className="preset-card__visual" style={{ background: `linear-gradient(135deg, ${accent}18, ${accent}06)`, borderBottom: `1px solid ${accent}30` }} />
                  <div className="preset-card__body">
                    <div className="preset-card__top">
                      <span className="preset-card__name">{item.name}</span>
                      <span className="preset-tag" style={{ color: accent, borderColor: `${accent}60`, background: `${accent}12` }}>{item.genre}</span>
                    </div>
                    <span className="preset-card__creator">by {item.creator}</span>
                    <div className="preset-card__footer">
                      <span className="preset-downloads">↓ {item.downloads}</span>
                      <Link to="/signup" className="try-btn-sm" style={{ color: accent, borderColor: `${accent}60` }}>
                        Try it →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="carousel-btn" onClick={scrollNext}>→</button>
    </div>
  )
}

export default Carousel
