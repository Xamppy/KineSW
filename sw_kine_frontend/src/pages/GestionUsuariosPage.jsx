import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import axiosConfig from '../services/axiosConfig';

const GestionUsuariosPage = () => {
  const { canManageUsers, getToken } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    rut: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    group_name: '',
    telefono: '',
    cargo: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Verificar permisos al cargar
  useEffect(() => {
    if (!canManageUsers()) {
      navigate('/dashboard');
      return;
    }
    cargarUsuarios();
    cargarRoles();
  }, [canManageUsers, navigate]);

  const cargarUsuarios = async () => {
    try {
      const token = getToken();
      const response = await axiosConfig.get('/usuarios/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Respuesta de usuarios:', response.data);
      
      // Asegurar que response.data sea un array
      if (Array.isArray(response.data)) {
        setUsuarios(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        // Si viene paginado
        setUsuarios(response.data.results);
      } else {
        console.error('La respuesta no es un array:', response.data);
        setUsuarios([]);
        setError('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar la lista de usuarios');
      setUsuarios([]); // Asegurar que usuarios sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const cargarRoles = async () => {
    try {
      const token = getToken();
      const response = await axiosConfig.get('/usuarios/roles/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(response.data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      const token = getToken();
      await axiosConfig.post('/usuarios/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Resetear formulario y cerrar modal
      setFormData({
        rut: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password2: '',
        group_name: '',
        telefono: '',
        cargo: ''
      });
      setShowModal(false);
      
      // Recargar lista de usuarios
      cargarUsuarios();
      
    } catch (error) {
      console.error('Error al crear usuario:', error);
      if (error.response?.data) {
        setFormErrors(error.response.data);
      } else {
        setError('Error al crear el usuario');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserActive = async (userId) => {
    try {
      const token = getToken();
      await axiosConfig.post(`/usuarios/${userId}/toggle_active/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      cargarUsuarios(); // Recargar lista
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      setError('Error al cambiar el estado del usuario');
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      const token = getToken();
      await axiosConfig.post(`/usuarios/${userId}/change_role/`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      cargarUsuarios(); // Recargar lista
    } catch (error) {
      console.error('Error al cambiar rol del usuario:', error);
      setError('Error al cambiar el rol del usuario');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#07421a] hover:bg-[#063018] text-white font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
        >
          + Crear Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {Array.isArray(usuarios) && usuarios.length > 0 ? usuarios.map((usuario) => (
            <li key={usuario.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        usuario.is_active ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        {usuario.first_name?.charAt(0) || usuario.username?.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {usuario.email} • RUT: {usuario.profile?.rut || 'No especificado'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Rol: {usuario.role || 'Sin rol'} • 
                        Estado: {usuario.is_active ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Selector de rol */}
                  <select
                    value={usuario.role || ''}
                    onChange={(e) => changeUserRole(usuario.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    disabled={usuario.is_superuser}
                  >
                    <option value="">Sin rol</option>
                    <option value="Administrador">Administrador</option>
                    {roles.map((rol) => (
                      <option key={rol} value={rol}>{rol}</option>
                    ))}
                  </select>
                  
                  {/* Botón activar/desactivar */}
                  <button
                    onClick={() => toggleUserActive(usuario.id)}
                    disabled={usuario.is_superuser}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      usuario.is_active
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    } ${usuario.is_superuser ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {usuario.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            </li>
          )) : (
            <li className="px-6 py-4 text-center text-gray-500">
              {Array.isArray(usuarios) && usuarios.length === 0 ? 'No hay usuarios registrados' : 'Cargando usuarios...'}
            </li>
          )}
        </ul>
      </div>

      {/* Modal para crear usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Usuario</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">RUT</label>
                    <input
                      type="text"
                      name="rut"
                      value={formData.rut}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#07421a] focus:border-[#07421a]"
                      placeholder="12.345.678-9"
                      required
                    />
                    {formErrors.rut && <p className="text-red-500 text-sm mt-1">{formErrors.rut}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#07421a] focus:border-[#07421a]"
                      required
                    />
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombres</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#07421a] focus:border-[#07421a]"
                      required
                    />
                    {formErrors.first_name && <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#07421a] focus:border-[#07421a]"
                      required
                    />
                    {formErrors.last_name && <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#07421a] focus:border-[#07421a]"
                      required
                    />
                    {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                    <input
                      type="password"
                      name="password2"
                      value={formData.password2}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#07421a] focus:border-[#07421a]"
                      required
                    />
                    {formErrors.password2 && <p className="text-red-500 text-sm mt-1">{formErrors.password2}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                    <select
                      name="group_name"
                      value={formData.group_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#07421a] focus:border-[#07421a]"
                      required
                    >
                      <option value="">Seleccionar rol</option>
                      {roles.map((rol) => (
                        <option key={rol} value={rol}>{rol}</option>
                      ))}
                    </select>
                    {formErrors.group_name && <p className="text-red-500 text-sm mt-1">{formErrors.group_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono (opcional)</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#07421a] focus:border-[#07421a]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Cargo (opcional)</label>
                    <input
                      type="text"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#07421a] focus:border-[#07421a]"
                      placeholder="Ej: Kinesiólogo, Médico Deportivo, etc."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#07421a] rounded-md hover:bg-[#063018] disabled:opacity-50"
                  >
                    {submitting ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuariosPage; 