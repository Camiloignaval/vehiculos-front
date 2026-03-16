import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
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

const percent = (n) =>
  `${(n ?? 0).toLocaleString("es-CL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;

const integer = (n) =>
  Math.round(n ?? 0).toLocaleString("es-CL", {
    maximumFractionDigits: 0,
  });

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const formatDateLabel = (value) => {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}`;
};

const getTone = (value, positive = "#22c55e", negative = "#ef4444") =>
  value >= 0 ? positive : negative;

const getValueTone = (value) => (value >= 0 ? "text.primary" : "error.main");

function SectionHeader({ title, subtitle, chipLabel, chipColor = "default" }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      sx={{ mb: 1.5 }}
    >
      <Box>
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {chipLabel ? <Chip label={chipLabel} color={chipColor} size="small" /> : null}
    </Stack>
  );
}

function KpiSkeleton() {
  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Skeleton variant="text" width="45%" height={22} />
      <Skeleton variant="text" width="70%" height={42} sx={{ mt: 1 }} />
      <Skeleton variant="rounded" width="100%" height={4} sx={{ mt: 2 }} />
    </Paper>
  );
}

export default function DashboardPage() {
  const [startDate, setStartDate] = useState(daysAgoISO(90));
  const [endDate, setEndDate] = useState(todayISO());
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [historicalMetrics, setHistoricalMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchVehicles = async () => {
    const list = await Vehicles.list(true);
    setVehicleOptions(list);
  };

  const fetchMetrics = async (nextFilters) => {
    const filters = nextFilters || {
      startDate,
      endDate,
      vehicleId: selectedVehicle?._id || undefined,
    };

    setLoading(true);
    const [rangeMetrics, historyMetrics] = await Promise.all([
      Metrics.get(filters),
      Metrics.get({ vehicleId: filters.vehicleId }),
    ]);
    setMetrics(rangeMetrics);
    setHistoricalMetrics(historyMetrics);
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetFilters = async () => {
    const nextStartDate = daysAgoISO(90);
    const nextEndDate = todayISO();

    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
    setSelectedVehicle(null);

    await fetchMetrics({
      startDate: nextStartDate,
      endDate: nextEndDate,
      vehicleId: undefined,
    });
  };

  const byVehicle = useMemo(() => {
    if (!metrics?.perVehicle) return [];
    return metrics.perVehicle.map((v) => ({
      name: `${v.patente || ""} ${v.name || ""}`.trim(),
      "Inversion (rango)": v.investedRange ?? 0,
      Gastos: v.opExpenses ?? 0,
      Ingresos: v.income ?? 0,
      Utilidad: v.profit ?? 0,
    }));
  }, [metrics]);

  const pie = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: "Ingresos", value: metrics.totalIngresos ?? 0 },
      { name: "Gastos", value: metrics.totalExpenses ?? 0 },
    ];
  }, [metrics]);

  const soldCount = useMemo(
    () =>
      metrics?.perVehicle?.filter((vehicle) => (vehicle.income ?? 0) > 0)
        .length ?? 0,
    [metrics]
  );

  const avgTicket = useMemo(() => {
    if (!metrics?.totalIngresos || !soldCount) return 0;
    return metrics.totalIngresos / soldCount;
  }, [metrics, soldCount]);

  const marginPct = useMemo(() => {
    if (!metrics?.totalIngresos) return 0;
    return (metrics.totalProfit / metrics.totalIngresos) * 100;
  }, [metrics]);

  const roiPct = useMemo(() => {
    if (!metrics?.totalInversionRange) return 0;
    return (metrics.totalProfit / metrics.totalInversionRange) * 100;
  }, [metrics]);

  const filterSummary = useMemo(() => {
    const vehicleLabel = selectedVehicle
      ? `${selectedVehicle.patente ?? ""} ${selectedVehicle.name ?? ""}`.trim()
      : "Todos los vehiculos";
    return `Mostrando ${formatDateLabel(startDate)} a ${formatDateLabel(
      endDate
    )} | ${vehicleLabel}`;
  }, [endDate, selectedVehicle, startDate]);

  const rangeCards = useMemo(
    () => [
      {
        title: "Ingresos",
        value: currency(metrics?.totalIngresos ?? 0),
        color: "#22c55e",
        subtitle: "Periodo filtrado",
      },
      {
        title: "Gastos operativos",
        value: currency(metrics?.totalOpExpenses ?? 0),
        color: "#ef4444",
        subtitle: "Solo egresos operativos del periodo",
      },
      {
        title: "Inversion total",
        value: currency(metrics?.totalInversionRange ?? 0),
        color: "#0ea5e9",
        subtitle: "Compra + gastos dentro del periodo",
      },
      {
        title: "Utilidad",
        value: currency(metrics?.totalProfit ?? 0),
        color: getTone(metrics?.totalProfit ?? 0, "#f59e0b", "#ef4444"),
        valueColor: getValueTone(metrics?.totalProfit ?? 0),
        subtitle: "Ingresos menos costo total del periodo",
      },
      {
        title: "Margen",
        value: percent(marginPct),
        color: getTone(marginPct, "#f97316", "#ef4444"),
        valueColor: getValueTone(marginPct),
        subtitle: "Rentabilidad sobre ventas",
        helperText: "Margen = utilidad / ingresos del periodo",
      },
      {
        title: "ROI del rango",
        value: percent(roiPct),
        color: getTone(roiPct, "#06b6d4", "#ef4444"),
        valueColor: getValueTone(roiPct),
        subtitle: "Retorno sobre la inversion",
        helperText: "ROI = utilidad / inversion del periodo",
      },
      {
        title: "Vehiculos vendidos",
        value: integer(soldCount),
        color: "#14b8a6",
        subtitle: "Unidades vendidas en el rango",
      },
      {
        title: "Ticket promedio",
        value: currency(avgTicket),
        color: "#84cc16",
        subtitle: "Promedio por venta cerrada",
      },
      {
        title: "Dias promedio venta",
        value: `${integer(metrics?.avgDaysToSell ?? 0)} dias`,
        color: "#6366f1",
        subtitle: "Tiempo medio entre compra y venta",
      },
    ],
    [avgTicket, marginPct, metrics, roiPct, soldCount]
  );

  const historicalCards = useMemo(
    () => [
      {
        title: "Utilidad historica",
        value: currency(historicalMetrics?.totalProfit ?? 0),
        color: getTone(historicalMetrics?.totalProfit ?? 0, "#a855f7", "#ef4444"),
        valueColor: getValueTone(historicalMetrics?.totalProfit ?? 0),
        subtitle: "Sin filtro de fecha",
      },
      {
        title: "Gasto op. historico",
        value: currency(historicalMetrics?.totalOpExpenses ?? 0),
        color: "#dc2626",
        subtitle: "Acumulado operativo",
      },
      {
        title: "Inversion global",
        value: currency(historicalMetrics?.totalInversionGlobal ?? 0),
        color: "#3b82f6",
        subtitle: "Capital total invertido",
      },
    ],
    [historicalMetrics]
  );

  const barHeight = isMobile ? 340 : 400;
  const pieHeight = isMobile ? 320 : 380;
  const barMargin = isMobile
    ? { top: 8, right: 8, bottom: 48, left: 0 }
    : { top: 16, right: 16, bottom: 24, left: 8 };

  const shorten = (s = "", max = 14) =>
    s.length <= max ? s : `${s.slice(0, max - 1).trim()}...`;

  const xTickProps = {
    fontSize: isMobile ? 10 : 12,
    fill: theme.palette.text.secondary,
  };
  const yTickProps = {
    fontSize: isMobile ? 10 : 12,
    fill: theme.palette.text.secondary,
  };

  const chartMinWidth = Math.max(360, byVehicle.length * 120);

  const COLORS = ["#22C55E", "#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6", "#06B6D4"];

  return (
    <>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Dashboard
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 2 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            sx={{ "& > *": { flex: { md: 1 } } }}
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
                  label="Vehiculo (Nombre/Patente)"
                  placeholder="Escribe para filtrar"
                  fullWidth
                />
              )}
              clearOnEscape
              sx={{ width: "100%" }}
            />
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="flex-end"
            sx={{ width: "100%" }}
          >
            <Button
              variant="contained"
              onClick={() =>
                fetchMetrics({
                  startDate,
                  endDate,
                  vehicleId: selectedVehicle?._id || undefined,
                })
              }
              sx={{ width: { xs: "100%", md: "auto" }, py: { xs: 1.25, md: 1 } }}
            >
              Aplicar filtros
            </Button>

            <Button
              variant="outlined"
              onClick={resetFilters}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              Limpiar
            </Button>
          </Stack>

          <Alert severity="info" variant="outlined">
            {filterSummary}
          </Alert>
        </Stack>
      </Paper>

      <SectionHeader
        title="Periodo"
        subtitle="Metricas del rango aplicado para tomar decisiones rapidas."
        chipLabel="Rango activo"
        chipColor="primary"
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {loading
          ? Array.from({ length: 9 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`range-skeleton-${index}`}>
                <KpiSkeleton />
              </Grid>
            ))
          : rangeCards.map((card) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={card.title}>
                <KpiCard {...card} />
              </Grid>
            ))}
      </Grid>

      <SectionHeader
        title="Historico"
        subtitle="Valores acumulados sin fecha para contrastar el periodo actual."
        chipLabel="Sin fecha"
        chipColor="secondary"
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={`history-skeleton-${index}`}
              >
                <KpiSkeleton />
              </Grid>
            ))
          : historicalCards.map((card) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={card.title}>
                <KpiCard {...card} />
              </Grid>
            ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2.5, height: "100%" }}>
            <SectionHeader
              title="Comparativa por vehiculo"
              subtitle="Lectura rapida de inversion, gasto, ingreso y utilidad por unidad."
            />

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
                    barCategoryGap={isMobile ? "18%" : "10%"}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={xTickProps}
                      tickLine={false}
                      interval={0}
                      angle={isMobile ? -30 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 44 : 24}
                      tickFormatter={(v) => shorten(String(v), isMobile ? 14 : 24)}
                    />
                    <YAxis tick={yTickProps} width={isMobile ? 48 : 56} />
                    <Tooltip formatter={(v, k) => [currency(v), k]} />
                    <Legend
                      wrapperStyle={{
                        fontSize: isMobile ? 11 : 12,
                        paddingTop: 18,
                      }}
                    />
                    <Bar
                      dataKey="Inversion (rango)"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={isMobile ? 30 : 42}
                    />
                    <Bar
                      dataKey="Gastos"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={isMobile ? 30 : 42}
                    />
                    <Bar
                      dataKey="Ingresos"
                      fill="#22C55E"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={isMobile ? 30 : 42}
                    />
                    <Bar
                      dataKey="Utilidad"
                      fill="#F59E0B"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={isMobile ? 30 : 42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2.5, height: "100%" }}>
            <SectionHeader
              title="Ingresos vs gastos"
              subtitle="Peso relativo del resultado del periodo."
            />

            <Box sx={{ height: pieHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={isMobile ? 68 : 82}
                    outerRadius={isMobile ? 108 : 122}
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
    </>
  );
}
