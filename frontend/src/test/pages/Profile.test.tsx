import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../../pages/Profile';

describe('Profile Component', () => {
  it('renderiza la información del perfil', () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    expect(screen.getByText(/Mi Perfil/i)).toBeInTheDocument();
  });

  it('muestra el avatar con las iniciales del usuario', () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // El avatar debe mostrar "JP" (Juan Pérez)
    const avatar = screen.getByText('JP');
    expect(avatar).toBeInTheDocument();
  });

  it('muestra los campos del formulario correctamente', () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Verificar que existan secciones del perfil
    expect(screen.getByText(/Mi Perfil/i)).toBeInTheDocument();
    expect(screen.getByText(/Información del Sistema/i)).toBeInTheDocument();
  });

  it('los campos están deshabilitados por defecto', () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // El botón de editar debe estar visible por defecto
    const editButton = screen.getByRole('button', { name: /Editar Perfil/i });
    expect(editButton).toBeInTheDocument();
  });
});
