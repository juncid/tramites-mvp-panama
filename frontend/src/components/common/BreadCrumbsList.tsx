import React from 'react';
import {
  Breadcrumbs,
  Link,
  LinkProps,
  SxProps,
  Theme,
} from '@mui/material';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import { OverridableComponent } from '@mui/material/OverridableComponent';

export interface BreadcrumbItem {
  label: string;
  icon?: OverridableComponent<SvgIconTypeMap<object, "svg">>;
  href?: string;
  onClick?: () => void;
}

export interface BreadCrumbsListProps {
  items: BreadcrumbItem[];
  separator?: string | React.ReactNode;
  maxItems?: number;
  itemsAfterCollapse?: number;
  itemsBeforeCollapse?: number;
  color?: LinkProps['color'];
  separatorColor?: string;
  linkSx?: SxProps<Theme>;
  breadcrumbsSx?: SxProps<Theme>;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

const BreadCrumbsList: React.FC<BreadCrumbsListProps> = ({
  items,
  separator = "/",
  maxItems = 8,
  itemsAfterCollapse = 1,
  itemsBeforeCollapse = 1,
  color = "inherit",
  separatorColor = "text.secondary",
  linkSx = {},
  breadcrumbsSx = {},
  onItemClick,
}) => {
  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (item.onClick) {
      item.onClick();
    } else if (onItemClick) {
      onItemClick(item, index);
    }
  };

  return (
    <Breadcrumbs
      separator={separator}
      maxItems={maxItems}
      itemsAfterCollapse={itemsAfterCollapse}
      itemsBeforeCollapse={itemsBeforeCollapse}
      sx={{
        "& .MuiBreadcrumbs-separator": {
          color: separatorColor,
        },
        ...breadcrumbsSx,
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const IconComponent = item.icon;

        return (
          <Link
            key={`${item.label}-${index}`}
            component={item.href ? "a" : "button"}
            href={item.href}
            underline={isLast ? "none" : "hover"}
            color={color}
            onClick={() => handleItemClick(item, index)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: "0.875rem",
              cursor: item.href || item.onClick || onItemClick ? "pointer" : "default",
              fontWeight: isLast ? 600 : 400,
              "&:hover": {
                textDecoration: isLast ? "none" : "underline",
              },
              ...linkSx,
            }}
          >
            {IconComponent && (
              <IconComponent
                sx={{
                  width: "20px",
                  height: "20px",
                }}
              />
            )}
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadCrumbsList;