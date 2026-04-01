import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.tsx'
import Explore from './pages/Explore.tsx'
import About from './pages/About.tsx'
import Contact from './pages/Contact.tsx'
import Navbar from './components/Navbar.tsx'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/explore' element={<Explore />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
      </Routes>
    </>
  )
}

export default App
