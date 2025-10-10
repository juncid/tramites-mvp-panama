import { useState, useEffect } from 'react'
import './App.css'
import { getTramites, createTramite, updateTramite, deleteTramite, Tramite, TramiteCreate } from './api/tramites'

function App() {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTramite, setNewTramite] = useState<TramiteCreate>({
    titulo: '',
    descripcion: '',
    estado: 'pendiente'
  })

  useEffect(() => {
    fetchTramites()
  }, [])

  const fetchTramites = async () => {
    try {
      setLoading(true)
      const data = await getTramites()
      setTramites(data)
      setError(null)
    } catch (err) {
      setError('Error al cargar los trámites')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTramite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTramite(newTramite)
      setNewTramite({ titulo: '', descripcion: '', estado: 'pendiente' })
      fetchTramites()
    } catch (err) {
      setError('Error al crear el trámite')
      console.error(err)
    }
  }

  const handleUpdateEstado = async (id: number, nuevoEstado: string) => {
    try {
      await updateTramite(id, { estado: nuevoEstado })
      fetchTramites()
    } catch (err) {
      setError('Error al actualizar el trámite')
      console.error(err)
    }
  }

  const handleDeleteTramite = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este trámite?')) {
      try {
        await deleteTramite(id)
        fetchTramites()
      } catch (err) {
        setError('Error al eliminar el trámite')
        console.error(err)
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Trámites MVP Panamá - SNMP</h1>
      </header>

      <main className="container">
        {error && <div className="error">{error}</div>}

        <section className="form-section">
          <h2>Crear Nuevo Trámite</h2>
          <form onSubmit={handleCreateTramite}>
            <div className="form-group">
              <label htmlFor="titulo">Título:</label>
              <input
                id="titulo"
                type="text"
                value={newTramite.titulo}
                onChange={(e) => setNewTramite({ ...newTramite, titulo: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="descripcion">Descripción:</label>
              <textarea
                id="descripcion"
                value={newTramite.descripcion}
                onChange={(e) => setNewTramite({ ...newTramite, descripcion: e.target.value })}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label htmlFor="estado">Estado:</label>
              <select
                id="estado"
                value={newTramite.estado}
                onChange={(e) => setNewTramite({ ...newTramite, estado: e.target.value })}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Crear Trámite</button>
          </form>
        </section>

        <section className="tramites-section">
          <h2>Lista de Trámites</h2>
          {loading ? (
            <p>Cargando trámites...</p>
          ) : tramites.length === 0 ? (
            <p>No hay trámites registrados.</p>
          ) : (
            <div className="tramites-grid">
              {tramites.map((tramite) => (
                <div key={tramite.id} className="tramite-card">
                  <h3>{tramite.titulo}</h3>
                  <p className="descripcion">{tramite.descripcion}</p>
                  <div className="tramite-info">
                    <span className={`estado estado-${tramite.estado}`}>
                      {tramite.estado}
                    </span>
                    <span className="fecha">
                      Creado: {new Date(tramite.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="tramite-actions">
                    <select
                      value={tramite.estado}
                      onChange={(e) => handleUpdateEstado(tramite.id, e.target.value)}
                      className="estado-select"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="completado">Completado</option>
                    </select>
                    <button
                      onClick={() => handleDeleteTramite(tramite.id)}
                      className="btn-danger"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
