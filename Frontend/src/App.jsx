import './App.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { getApps } from './utils/helper'
import CursorDot from './components/CursorDot'

function App() {

  const CurrentApp = getApps();

  return (
    <Router>
      <CursorDot />
      <CurrentApp />
    </Router>
  )
}

export default App
