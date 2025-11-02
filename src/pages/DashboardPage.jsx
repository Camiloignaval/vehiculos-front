import React, { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import { Metrics, Vehicles } from "../api.js";
import KpiCard from "../components/KpiCard.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const currency = (n) =>
  (n ?? 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export default function DashboardPage() {
  // filtros
  const [startDate, setStartDate] = useState(daysAgoISO(90));
  const [endDate, setEndDate] = useState(todayISO());
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // datos
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // xs/sm

  const fetchVehicles = async () => {
    // showAll=true para poder buscar vendidos también
    const list = await Vehicles.list(true);
    setVehicleOptions(list);
  };

  const fetchMetrics = async () => {
    setLoading(true);
    const params = {
      startDate,
      endDate,
      vehicleId: selectedVehicle?._id || undefined,
    };
    const m = await Metrics.get(params);
    setMetrics(m);
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    // carga inicial
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byVehicle = useMemo(() => {
    if (!metrics?.perVehicle) return [];
    return metrics.perVehicle.map((v) => ({
      name: `${v.patente || ""} ${v.name || ""}`.trim(),
      Inversión: v.invested, // global
      Gastos: v.opExpenses, // SOLO operativos (rango)
      Ingresos: v.income,
      Utilidad: v.profit,
    }));
  }, [metrics]);

  const pie = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: "Ingresos", value: metrics.totalIngresos },
      { name: "Gastos", value: metrics.totalExpenses },
    ];
  }, [metrics]);

  // ---------- Responsividad y helpers para gráficos ----------
  const barHeight = isMobile ? 320 : 380;
  const pieHeight = isMobile ? 320 : 380;

  const barMargin = isMobile
    ? { top: 8, right: 8, bottom: 36, left: 0 }
    : { top: 16, right: 16, bottom: 24, left: 8 };

  // Truncado para nombres largos del eje X
  const shorten = (s = "", max = 14) =>
    s.length <= max ? s : s.slice(0, max - 1).trim() + "…";

  const xTickProps = {
    fontSize: isMobile ? 10 : 12,
    fill: theme.palette.text.secondary,
  };
  const yTickProps = {
    fontSize: isMobile ? 10 : 12,
    fill: theme.palette.text.secondary,
  };

  // ancho mínimo para scroll horizontal en móvil (110 px por item aprox.)
  const chartMinWidth = Math.max(360, byVehicle.length * 110);

  const COLORS = [
    "#22C55E",
    "#EF4444",
    "#3B82F6",
    "#F59E0B",
    "#8B5CF6",
    "#06B6D4",
  ];

  return (
    <>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Dashboard
      </Typography>

      {/* FILTROS */}
      <Paper sx={{ p: { xs: 2, md: 2 }, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          sx={{
            "& > *": { flex: { md: 1 } },
          }}
        >
          <TextField
            type="date"
            size="small"
            label="Desde"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
          />

          <TextField
            type="date"
            size="small"
            label="Hasta"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
          />

          <Autocomplete
            options={vehicleOptions}
            value={selectedVehicle}
            onChange={(_, v) => setSelectedVehicle(v)}
            getOptionKey={(o) => o._id}
            getOptionLabel={(o) =>
              o ? `${o.patente ?? ""} ${o.name ?? ""}`.trim() : ""
            }
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Vehículo (Nombre/Patente)"
                placeholder="Escribe para filtrar"
                fullWidth
              />
            )}
            clearOnEscape
            sx={{ width: "100%" }}
          />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <Button
              variant="contained"
              onClick={fetchMetrics}
              sx={{
                width: { xs: "100%", md: "auto" },
                py: { xs: 1.25, md: 1 },
              }}
            >
              Aplicar filtros
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setStartDate(daysAgoISO(90));
                setEndDate(todayISO());
                setSelectedVehicle(null);
                setTimeout(fetchMetrics, 0);
              }}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              Limpiar
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* KPIs */}
      {!loading && metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <KpiCard
              title="Ingresos"
              value={currency(metrics.totalIngresos)}
              color="#22c55e"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <KpiCard
              title="Gastos (operativos)"
              value={currency(metrics.totalOpExpenses)}
              color="#ef4444"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <KpiCard
              title="Inversión total (global)"
              value={currency(metrics.totalInversionGlobal)}
              color="#3b82f6"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <KpiCard
              title="Utilidad"
              value={currency(metrics.totalProfit)}
              color="#f59e0b"
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2}>
        {/* Barras */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
              Inversión / Gastos / Ingresos por vehículo
            </Typography>

            {/* Scroll horizontal SOLO en móvil cuando hay muchos items */}
            <Box
              sx={{
                width: "100%",
                overflowX: { xs: "auto", sm: "auto", md: "visible" },
                overflowY: "hidden",
              }}
            >
              <Box
                sx={{
                  width: { xs: chartMinWidth, md: "100%" },
                  height: barHeight,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={byVehicle}
                    margin={barMargin}
                    barCategoryGap={isMobile ? "20%" : "10%"}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={xTickProps} // 👈 siempre mostramos ticks
                      tickLine={false}
                      interval={0} // 👈 mostramos todos
                      angle={isMobile ? -30 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 36 : 20}
                      tickFormatter={(v) =>
                        shorten(String(v), isMobile ? 14 : 24)
                      }
                    />
                    <YAxis tick={yTickProps} width={isMobile ? 40 : 48} />
                    <Tooltip formatter={(v, k) => [currency(v), k]} />
                    <Legend
                      wrapperStyle={{
                        fontSize: isMobile ? 11 : 12,
                        paddingTop: 50,
                      }}
                    />
                    <Bar
                      dataKey="Inversión"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={isMobile ? 36 : 48}
                    />
                    <Bar
                      dataKey="Gastos"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={isMobile ? 36 : 48}
                    />
                    <Bar
                      dataKey="Ingresos"
                      fill="#22C55E"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={isMobile ? 36 : 48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Pie / Donut */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
              Ingresos vs Gastos (rango aplicado)
            </Typography>

            <Box sx={{ height: pieHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={isMobile ? 70 : 80}
                    outerRadius={isMobile ? 110 : 120}
                    label={!isMobile}
                  >
                    {pie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => currency(v)} />
                  {!isMobile && <Legend />}
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {loading && <Typography sx={{ mt: 2 }}>Cargando métricas…</Typography>}
    </>
  );
}
