import DownloadIcon from "@mui/icons-material/Download";
import HomeIcon from "@mui/icons-material/Home";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { BreadCrumbsList, BreadcrumbItem } from "../components/common";

export default function TramitesPageUser() {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Inicio", icon: HomeIcon },
    { label: "Procesos" },
    { label: "Permiso de Protección de Seguridad Humanitaria" },
    { label: "Carga de requisitos del trámite PPSH" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: "#0e5fa6",
          color: "white",
          py: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "3rem", lg: "4rem" },
                lineHeight: 1.2,
                textAlign: "center",
              }}
            >
              Permiso de Protección de Seguridad Humanitaria
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <BreadCrumbsList
                items={breadcrumbItems}
                separator="/"
                color="white"
                separatorColor="white"
                breadcrumbsSx={{
                  "& .MuiBreadcrumbs-separator": {
                    color: "white",
                  },
                }}
                linkSx={{
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Title Section */}
          <Box>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 2,
              }}
            >
              Requisitos del trámite PPSH
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                lineHeight: 1.6,
                maxWidth: "800px",
              }}
            >
              Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis
              iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis.
              Volutpat tempus urna nullam aliquam. Dolor ornare at ac sit sagittis.
              Etiam elit risus volutpat sed. Orci id in mauris turpis neque. Amet diam
              morbi vitae nisi ultrices volutpat. Turpis vestibulum condimentum
              viverra mauris volutpat. Adipiscing ultrices curabitur vehicula ultrices
              adipiscing dictum nunc facilisi mi. Etiam congue nisl at consequat
              lobortis vitae nunc.
            </Typography>
          </Box>

          {/* Requirements Section */}
          <Paper
            elevation={1}
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                color: "text.primary",
              }}
            >
              A continuación se presentan los requisitos para el trámite PPSH
            </Typography>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{
                alignSelf: "flex-start",
                bgcolor: "#0e5fa6",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#0b4a85",
                },
              }}
            >
              Requisitos PPSH
            </Button>
          </Paper>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: "auto",
              pt: 4,
            }}
          >
            <Button
              variant="outlined"
              sx={{
                minWidth: "120px",
                borderColor: "#0e5fa6",
                color: "#0e5fa6",
                textTransform: "none",
                "&:hover": {
                  borderColor: "#0b4a85",
                  bgcolor: "rgba(14, 95, 166, 0.04)",
                },
              }}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              sx={{
                minWidth: "120px",
                bgcolor: "#0e5fa6",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#0b4a85",
                },
              }}
            >
              Siguiente
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
