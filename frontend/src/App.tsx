import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { TramitesPage, TramitesPageUser, BpmnPage } from './pages'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/tramites" replace />} />
        <Route path="/tramites" element={<TramitesPage />} />
        <Route path="/tramites-user" element={<TramitesPageUser />} />
        <Route path="/bpmn" element={<BpmnPage />} />
        <Route path="*" element={<Navigate to="/tramites" replace />} />
      </Routes>
    </Router>
  )
}

export default App
