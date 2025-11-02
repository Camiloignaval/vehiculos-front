import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Stack,
  IconButton,
  useTheme,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Auth } from "../api.js";
import { useNavigate } from "react-router-dom";
import logoDark from "../assets/brand/logoBlanco.png";

const IMAGES = [
  "https://img.freepik.com/fotos-premium/sedan-lujo-negro-iluminado-oscuridad_1230681-22146.jpg?semt=ais_hybrid&w=740&q=80",
  "https://img.freepik.com/fotos-premium/coche-negro-estacionado-oscuridad-faros-iluminando-suelo_1230681-22198.jpg?semt=ais_hybrid&w=740&q=80",
  "https://i.pinimg.com/736x/ff/0b/30/ff0b303b2d164ed4fd9a552237f9862b.jpg",
];

function VehicleCarousel() {
  const theme = useTheme();
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const next = () => setIdx((p) => (p + 1) % IMAGES.length);
  const prev = () => setIdx((p) => (p - 1 + IMAGES.length) % IMAGES.length);

  useEffect(() => {
    timerRef.current = setInterval(next, 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <Box
      sx={{
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        display: { xs: "none", md: "block" },
        backgroundColor: theme.palette.background.default,
      }}
    >
      {IMAGES.map((src, i) => (
        <Box
          key={src}
          component="img"
          src={src}
          alt={`vehiculo-${i}`}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "opacity .6s ease",
            opacity: i === idx ? 1 : 0,
            filter: "brightness(.72)",
          }}
        />
      ))}

      {/* Overlay ligeramente teñido con acento teal */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,77,97,0.35) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      <IconButton
        onClick={prev}
        sx={{
          position: "absolute",
          top: "50%",
          left: 16,
          transform: "translateY(-50%)",
          bgcolor: "rgba(0,0,0,.35)",
          color: "#F0F0F0",
          "&:hover": { bgcolor: "rgba(0,0,0,.55)" },
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
      <IconButton
        onClick={next}
        sx={{
          position: "absolute",
          top: "50%",
          right: 16,
          transform: "translateY(-50%)",
          bgcolor: "rgba(0,0,0,.35)",
          color: "#F0F0F0",
          "&:hover": { bgcolor: "rgba(0,0,0,.55)" },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { token } = await Auth.login({ username, password });
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (error) {
      setErr(error?.response?.data?.error || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  const logoSrc = logoDark; // sin fondo, se ve perfecto en oscuro

  return (
    <Grid container>
      <Grid item xs={12} md={6}>
        <VehicleCarousel />
      </Grid>

      <Grid
        item
        xs={12}
        md={6}
        sx={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          alignItems: "start",
          justifyItems: "center",
          backgroundColor: theme.palette.background.default,
          px: 2,
        }}
      >
        {/* Logo fuera del card */}
        <Stack
          spacing={1}
          alignItems="center"
          sx={{ pt: { xs: 4, md: 8 }, pb: 1, width: "100%", maxWidth: 440 }}
        >
          <Box
            component="img"
            src={logoSrc}
            alt="Camilo y Diego Asociados"
            sx={{ width: "90%", height: "auto" }}
          />
        </Stack>

        <Card
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: 440,
            borderRadius: 3,
            alignSelf: "start",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box mb={3}>
              <Typography variant="h6" fontWeight={800} textAlign="center">
                Inicia sesión en el sistema
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Ingresa tus credenciales para continuar
              </Typography>
            </Box>

            <form onSubmit={onSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  autoFocus
                  variant="filled"
                  InputProps={{ disableUnderline: true }}
                />
                <TextField
                  label="Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  variant="filled"
                  InputProps={{ disableUnderline: true }}
                />

                {err && (
                  <Typography variant="body2" color="error">
                    {err}
                  </Typography>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary" // #3E5641
                  disabled={loading}
                  sx={{ py: 1.2, borderRadius: 2, fontWeight: 800 }}
                >
                  {loading ? "Ingresando…" : "INGRESAR"}
                </Button>

                {/* Botón secundario opcional (rubí) */}
                {/* <Button variant="outlined" color="secondary">Crear cuenta</Button> */}
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
