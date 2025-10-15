// Ejemplo de uso del componente BreadCrumbsList
import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import BreadCrumbsList, { BreadcrumbItem } from './BreadCrumbsList';

const ExampleUsage: React.FC = () => {
  // Ejemplo 1: Breadcrumbs básicos
  const basicItems: BreadcrumbItem[] = [
    { label: "Inicio", icon: HomeIcon },
    { label: "Productos" },
    { label: "Electrónicos" },
    { label: "Laptops" },
  ];

  // Ejemplo 2: Con navegación (onClick)
  const navigationItems: BreadcrumbItem[] = [
    { label: "Inicio", icon: HomeIcon, onClick: () => console.log("Ir a inicio") },
    { label: "Configuración", icon: SettingsIcon, onClick: () => console.log("Ir a configuración") },
    { label: "Perfil" },
  ];

  // Ejemplo 3: Con enlaces (href)
  const linkItems: BreadcrumbItem[] = [
    { label: "Inicio", href: "/" },
    { label: "Acerca de", href: "/about" },
    { label: "Contacto", href: "/contact" },
  ];

  return (
    <div>
      {/* Breadcrumbs básicos */}
      <BreadCrumbsList items={basicItems} />

      {/* Con navegación personalizada */}
      <BreadCrumbsList
        items={navigationItems}
        separator=">"
        color="primary"
      />

      {/* Con enlaces */}
      <BreadCrumbsList
        items={linkItems}
        separator="•"
        maxItems={3}
        separatorColor="text.secondary"
      />
    </div>
  );
};

export default ExampleUsage;