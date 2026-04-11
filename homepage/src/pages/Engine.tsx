import "../App.css"
import { Link } from "react-router-dom"

function Engine() {
  return (
    <div className="page eng-page">

      <div className="eng-header">
        <h2 className="eng-title">MAGE Engine</h2>
        <p className="eng-subtitle">Audio-reactive environments, generated in real time.</p>
      </div>

      <div className="eng-shell">

        {/* Main row: visualiser + preset */}
        <div className="eng-main-row">

          {/* Visualiser */}
          <div className="eng-panel eng-panel--visualiser">
            <div className="eng-panel__label">Visualiser</div>
            <div className="eng-visualiser">
              <div className="eng-visualiser__overlay">
                <span className="eng-status-dot" />
                <span className="eng-status-text">Awaiting audio input</span>
              </div>
            </div>
          </div>

          {/* Preset selector */}
          <div className="eng-panel eng-panel--preset">
            <div className="eng-panel__label">Preset</div>
            <div className="eng-preset-name">Dark Matter Reverb</div>
            <div className="eng-preset-meta">by neural_waves · Dubstep</div>
            <div className="eng-preset-actions">
              <button className="eng-pill-btn">◀</button>
              <button className="eng-pill-btn">▶</button>
              <button className="eng-pill-btn eng-pill-btn--wide">Randomise</button>
            </div>
          </div>

        </div>

        {/* Transport bar */}
        <div className="eng-transport">
          <button className="eng-transport__btn">■</button>
          <button className="eng-transport__btn eng-transport__btn--play">▶</button>
          <div className="eng-transport__timeline">
            <div className="eng-transport__playhead" style={{ left: '30%' }} />
          </div>
          <span className="eng-transport__time">0:34 / 1:52</span>
        </div>

      </div>

      {/* CTA */}
      <div className="eng-cta">
        <p className="eng-cta__copy">This is a preview. Sign up to run the engine on your own audio.</p>
        <Link to="/signup" className="try-btn">Get started →</Link>
      </div>

    </div>
  )
}

export default Engine
