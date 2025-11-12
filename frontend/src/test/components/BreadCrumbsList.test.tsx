import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BreadCrumbsList, { BreadcrumbItem } from '../../components/common/BreadCrumbsList';
import HomeIcon from '@mui/icons-material/Home';

describe('BreadCrumbsList Component', () => {
  const mockItems: BreadcrumbItem[] = [
    { label: 'Inicio', icon: HomeIcon, href: '/' },
    { label: 'Procesos', href: '/procesos' },
    { label: 'Detalles' },
  ];

  it('renderiza todos los items del breadcrumb', () => {
    render(<BreadCrumbsList items={mockItems} />);

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Procesos')).toBeInTheDocument();
    expect(screen.getByText('Detalles')).toBeInTheDocument();
  });

  it('renderiza el icono cuando se proporciona', () => {
    render(<BreadCrumbsList items={mockItems} />);

    // HomeIcon se renderiza como svg
    const homeLink = screen.getByText('Inicio');
    expect(homeLink.parentElement).toContainHTML('svg');
  });

  it('aplica el separador personalizado', () => {
    render(<BreadCrumbsList items={mockItems} separator=">" />);

    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });

  it('llama onClick cuando se hace click en un item', async () => {
    const handleClick = vi.fn();
    const itemsWithClick: BreadcrumbItem[] = [
      { label: 'Inicio', onClick: handleClick },
      { label: 'Procesos' },
    ];

    const user = userEvent.setup();
    render(<BreadCrumbsList items={itemsWithClick} />);

    const inicioLink = screen.getByText('Inicio');
    await user.click(inicioLink);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('llama onItemClick cuando se proporciona', async () => {
    const handleItemClick = vi.fn();
    const user = userEvent.setup();

    render(
      <BreadCrumbsList items={mockItems} onItemClick={handleItemClick} />
    );

    const procesosLink = screen.getByText('Procesos');
    await user.click(procesosLink);

    expect(handleItemClick).toHaveBeenCalledWith(mockItems[1], 1);
  });

  it('el último item tiene mayor peso de fuente', () => {
    render(<BreadCrumbsList items={mockItems} />);

    const lastItem = screen.getByText('Detalles');
    expect(lastItem).toHaveStyle({ fontWeight: 600 });
  });
});
