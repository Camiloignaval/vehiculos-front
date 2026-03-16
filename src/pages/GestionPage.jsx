import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { Vehicles, Expenses } from "../api.js";
import { formatAny_esCL, todayLocalYMD } from "../helpers/index.js";

const currency = (n) =>
  (n ?? 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

const integer = (n) =>
  Math.round(n ?? 0).toLocaleString("es-CL", {
    maximumFractionDigits: 0,
  });

function Thumb({ src, alt }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: 180,
        borderRadius: 2,
        overflow: "hidden",
        mt: 1,
        mb: 1.5,
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {src ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ width: "100%", height: "100%" }}
        >
          <Typography variant="body2" color="text.secondary">
            Sin imagen
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

function SectionTitle({ title, subtitle, chip }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      sx={{ mb: 2 }}
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
      {chip || null}
    </Stack>
  );
}

function SummaryCard({ title, value, color, subtitle }) {
  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        borderTop: `4px solid ${color}`,
        borderRadius: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
          {subtitle}
        </Typography>
      ) : null}
    </Paper>
  );
}

function SearchField({ value, onChange, placeholder, onClear }) {
  return (
    <TextField
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={onClear}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      sx={{ width: { xs: "100%", md: 360 } }}
    />
  );
}

export default function GestionPage() {
  const [vehicles, setVehicles] = useState([]);
  const [expenseSumByVeh, setExpenseSumByVeh] = useState({});
  const [vehicleId, setVehicleId] = useState("");
  const [expenses, setExpenses] = useState([]);

  const [vName, setVName] = useState("");
  const [vPatente, setVPatente] = useState("");
  const [vPrice, setVPrice] = useState("");
  const [vDate, setVDate] = useState(() => todayLocalYMD());
  const [vImage, setVImage] = useState(null);

  const [eDate, setEDate] = useState(() => todayLocalYMD());
  const [eName, setEName] = useState("");
  const [eAmount, setEAmount] = useState("");

  const [sellPriceById, setSellPriceById] = useState({});
  const [sellDateById, setSellDateById] = useState({});

  const [qActivos, setQActivos] = useState("");
  const [qVendidos, setQVendidos] = useState("");

  const loadVehicles = async () => {
    const vs = await Vehicles.list(true);
    setVehicles(Array.isArray(vs) ? vs : []);

    const sumMap = await Expenses.summary();
    setExpenseSumByVeh(sumMap || {});

    const activosNow = (vs || []).filter((v) => !v.soldDate);
    if (activosNow[0]?._id) setVehicleId((prev) => prev || activosNow[0]._id);
    else setVehicleId("");
  };

  const loadExpensesFor = async (vid) => {
    if (!vid) return setExpenses([]);
    const list = await Expenses.list(vid);
    setExpenses(Array.isArray(list) ? list : []);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    loadExpensesFor(vehicleId);
  }, [vehicleId]);

  const handleAddVehicle = async () => {
    if (!vName || !vPatente || !vPrice) return;

    if (vImage) {
      const fd = new FormData();
      fd.append("name", vName);
      fd.append("patente", vPatente);
      fd.append("purchaseDate", vDate);
      fd.append("purchasePrice", String(Number(vPrice)));
      fd.append("image", vImage);
      await Vehicles.create(fd);
    } else {
      await Vehicles.create({
        name: vName,
        patente: vPatente,
        purchaseDate: vDate,
        purchasePrice: Number(vPrice),
      });
    }

    setVName("");
    setVPatente("");
    setVPrice("");
    setVImage(null);
    await loadVehicles();
  };

  const handleAddExpense = async () => {
    if (!vehicleId || !eAmount) return;
    await Expenses.create({
      vehicleId,
      date: eDate,
      name: eName,
      amount: Number(eAmount),
    });
    setEName("");
    setEAmount("");
    await loadExpensesFor(vehicleId);
    await loadVehicles();
  };

  const handleMarkSold = async (veh) => {
    const raw = sellPriceById[veh._id];
    const soldPrice = Number(raw);
    if (!raw || Number.isNaN(soldPrice) || soldPrice <= 0) {
      alert("Ingresa un precio de venta valido.");
      return;
    }
    const soldDate = sellDateById[veh._id] || todayLocalYMD();

    if (
      !confirm(
        `Marcar como vendido ${veh.patente} - ${veh.name} por ${currency(
          soldPrice
        )}?`
      )
    ) {
      return;
    }

    await Vehicles.markSold(veh._id, { soldPrice, soldDate });
    setSellPriceById((s) => ({ ...s, [veh._id]: "" }));
    setSellDateById((s) => ({ ...s, [veh._id]: "" }));
    await loadVehicles();

    if (vehicleId === veh._id) {
      const vs = await Vehicles.list(true);
      const activos = vs.filter((v) => !v.soldDate);
      setVehicleId(activos[0]?._id || "");
    }
  };

  const norm = (s) => String(s || "").toLowerCase();
  const match = (v, q) => norm(`${v.patente} ${v.name}`).includes(norm(q));

  const activosSorted = useMemo(
    () =>
      [...vehicles]
        .filter((v) => !v.soldDate)
        .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)),
    [vehicles]
  );

  const vendidosSorted = useMemo(
    () =>
      [...vehicles]
        .filter((v) => !!v.soldDate)
        .sort((a, b) => new Date(b.soldDate) - new Date(a.soldDate)),
    [vehicles]
  );

  const activosFiltrados = useMemo(
    () => activosSorted.filter((v) => match(v, qActivos)),
    [activosSorted, qActivos]
  );

  const vendidosFiltrados = useMemo(
    () => vendidosSorted.filter((v) => match(v, qVendidos)),
    [qVendidos, vendidosSorted]
  );

  const noActivos = activosSorted.length === 0;

  const totalOperativo = useMemo(
    () =>
      Object.values(expenseSumByVeh).reduce(
        (acc, amount) => acc + Number(amount || 0),
        0
      ),
    [expenseSumByVeh]
  );

  const selectedVehicle = useMemo(
    () => activosSorted.find((v) => v._id === vehicleId) || null,
    [activosSorted, vehicleId]
  );

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} mb={2}>
        Gestion de vehiculos y gastos
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Activos"
            value={integer(activosSorted.length)}
            color="#38bdf8"
            subtitle="Vehiculos disponibles"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Vendidos"
            value={integer(vendidosSorted.length)}
            color="#22c55e"
            subtitle="Vehiculos cerrados"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Gasto operativo"
            value={currency(totalOperativo)}
            color="#ef4444"
            subtitle="Acumulado registrado"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Seleccionado"
            value={
              selectedVehicle
                ? `${selectedVehicle.patente}`
                : "Sin vehiculo"
            }
            color="#a855f7"
            subtitle={
              selectedVehicle ? selectedVehicle.name : "Elige un activo para gastos"
            }
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderTop: "4px solid #3B82F6",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <CardContent>
              <SectionTitle
                title="Nuevo vehiculo"
                subtitle="Carga los datos base y, si quieres, agrega una imagen."
              />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nombre"
                    fullWidth
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Patente"
                    fullWidth
                    value={vPatente}
                    onChange={(e) => setVPatente(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Precio compra"
                    fullWidth
                    value={vPrice}
                    onChange={(e) => setVPrice(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    type="date"
                    label="Fecha compra"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={vDate}
                    onChange={(e) => setVDate(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      alignItems={{ xs: "stretch", sm: "center" }}
                    >
                      <Button component="label" variant="outlined">
                        {vImage ? "Cambiar imagen" : "Subir imagen"}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setVImage(file);
                          }}
                        />
                      </Button>
                      {vImage ? (
                        <Chip label={vImage.name} size="small" color="info" variant="outlined" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Formato libre. Recomendado: imagen horizontal.
                        </Typography>
                      )}
                    </Stack>

                    {vImage ? (
                      <Box
                        sx={{
                          mt: 0.5,
                          width: "100%",
                          height: 190,
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box
                          component="img"
                          src={URL.createObjectURL(vImage)}
                          alt="Vista previa"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ) : null}
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Button variant="contained" onClick={handleAddVehicle}>
                    Agregar vehiculo
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderTop: "4px solid #22C55E",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <CardContent>
              <SectionTitle
                title="Registrar gasto"
                subtitle="Carga egresos sobre un vehiculo activo."
                chip={
                  selectedVehicle ? (
                    <Chip
                      label={`${selectedVehicle.patente} - ${selectedVehicle.name}`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  ) : null
                }
              />

              {noActivos ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  No hay vehiculos activos. Agrega uno nuevo o revisa tus ventas.
                </Alert>
              ) : null}

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    label={noActivos ? "No hay vehiculos activos" : "Vehiculo"}
                    fullWidth
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    disabled={noActivos}
                    helperText={
                      noActivos
                        ? "Agrega un vehiculo para registrar gastos."
                        : "Solo se muestran vehiculos activos."
                    }
                  >
                    {activosSorted.map((v) => (
                      <MenuItem key={v._id} value={v._id}>
                        {v.patente} - {v.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="date"
                    label="Fecha"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={eDate}
                    onChange={(e) => setEDate(e.target.value)}
                    disabled={noActivos}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Concepto"
                    fullWidth
                    value={eName}
                    onChange={(e) => setEName(e.target.value)}
                    disabled={noActivos}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Monto"
                    fullWidth
                    value={eAmount}
                    onChange={(e) => setEAmount(e.target.value)}
                    disabled={noActivos}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleAddExpense}
                    disabled={noActivos || !vehicleId}
                  >
                    Registrar gasto
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <SectionTitle
                title="Gastos del vehiculo seleccionado"
                subtitle="Ultimos movimientos del activo actual."
              />

              <Stack spacing={1} sx={{ maxHeight: 200, overflowY: "auto", pr: 0.5 }}>
                {expenses.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No hay gastos registrados para este vehiculo.
                  </Typography>
                ) : (
                  expenses.map((g) => (
                    <Paper
                      key={g._id}
                      variant="outlined"
                      sx={{ p: 1.25, borderRadius: 2 }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={0.75}
                        justifyContent="space-between"
                      >
                        <Typography variant="body2">
                          {formatAny_esCL(g.date)} - {g.name || "Sin concepto"}
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {currency(g.amount)}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderTop: "4px solid #3B82F6", borderRadius: 2 }}>
            <CardContent>
              <SectionTitle
                title="Vehiculos activos"
                subtitle="Controla inversion, gastos y marca ventas pendientes."
                chip={<Chip label={`${integer(activosFiltrados.length)} visibles`} size="small" color="info" />}
              />

              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
                sx={{ mb: 2 }}
                spacing={2}
              >
                <Alert severity="info" variant="outlined" sx={{ flex: 1 }}>
                  Busca por patente o nombre para encontrar rapido un vehiculo.
                </Alert>
                <SearchField
                  placeholder="Buscar por patente o nombre"
                  value={qActivos}
                  onChange={(e) => setQActivos(e.target.value)}
                  onClear={() => setQActivos("")}
                />
              </Stack>

              <Grid container spacing={2} alignItems="stretch">
                {activosFiltrados.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      No hay vehiculos activos que coincidan.
                    </Typography>
                  </Grid>
                ) : null}

                {activosFiltrados.map((v) => {
                  const opTotal = expenseSumByVeh[v._id] || 0;
                  const totalInversion = Number(v.purchasePrice || 0) + opTotal;

                  return (
                    <Grid key={v._id} item xs={12} md={6} xl={4}>
                      <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography fontWeight={700}>
                            {v.patente} - {v.name}
                          </Typography>
                          <Chip label="Activo" color="info" size="small" />
                        </Stack>

                        <Thumb src={v.imageUrl} alt={`${v.patente} ${v.name}`} />

                        <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Compra: {formatAny_esCL(v.purchaseDate)} - {currency(v.purchasePrice)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Gastos operativos: {currency(opTotal)}
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            Total invertido: {currency(totalInversion)}
                          </Typography>
                        </Stack>

                        <Divider sx={{ my: 1.5 }} />

                        <Grid container spacing={1.25}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Fecha venta"
                              type="date"
                              size="small"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              value={sellDateById[v._id] ?? ""}
                              onChange={(e) =>
                                setSellDateById((s) => ({
                                  ...s,
                                  [v._id]: e.target.value,
                                }))
                              }
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Precio venta"
                              size="small"
                              fullWidth
                              value={sellPriceById[v._id] ?? ""}
                              onChange={(e) =>
                                setSellPriceById((s) => ({
                                  ...s,
                                  [v._id]: e.target.value,
                                }))
                              }
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Tooltip title="Marcar como vendido">
                              <span>
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  startIcon={<CheckCircle />}
                                  onClick={() => handleMarkSold(v)}
                                >
                                  Marcar vendido
                                </Button>
                              </span>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderTop: "4px solid #16a34a", borderRadius: 2 }}>
            <CardContent>
              <SectionTitle
                title="Vehiculos vendidos"
                subtitle="Consulta resultado final y utilidad por unidad."
                chip={
                  <Chip
                    label={`${integer(vendidosFiltrados.length)} visibles`}
                    size="small"
                    color="success"
                  />
                }
              />

              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
                sx={{ mb: 2 }}
                spacing={2}
              >
                <Alert severity="success" variant="outlined" sx={{ flex: 1 }}>
                  Revisa utilidad final considerando compra y gastos operativos.
                </Alert>
                <SearchField
                  placeholder="Buscar por patente o nombre"
                  value={qVendidos}
                  onChange={(e) => setQVendidos(e.target.value)}
                  onClear={() => setQVendidos("")}
                />
              </Stack>

              <Grid container spacing={2} alignItems="stretch">
                {vendidosFiltrados.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      No hay vendidos que coincidan.
                    </Typography>
                  </Grid>
                ) : null}

                {vendidosFiltrados.map((v) => {
                  const opTotal = expenseSumByVeh[v._id] || 0;
                  const totalCosto = Number(v.purchasePrice || 0) + opTotal;
                  const utilidad = Number(v.soldPrice || 0) - totalCosto;
                  const utilidadColor = utilidad >= 0 ? "success.main" : "error.main";

                  return (
                    <Grid key={v._id} item xs={12} md={6} xl={4}>
                      <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography fontWeight={700}>
                            {v.patente} - {v.name}
                          </Typography>
                          <Chip label="Vendido" color="success" size="small" />
                        </Stack>

                        <Thumb src={v.imageUrl} alt={`${v.patente} ${v.name}`} />

                        <Stack spacing={0.75}>
                          <Typography variant="body2" color="text.secondary">
                            Compra: {formatAny_esCL(v.purchaseDate)} - {currency(v.purchasePrice)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Venta: {formatAny_esCL(v.soldDate)} - {currency(v.soldPrice)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Gasto operativo: {currency(opTotal)}
                          </Typography>
                        </Stack>

                        <Divider sx={{ my: 1.25 }} />

                        <Stack spacing={0.5}>
                          <Typography variant="body2">
                            Costo total: {currency(totalCosto)}
                          </Typography>
                          <Typography variant="body2" fontWeight={800} color={utilidadColor}>
                            Utilidad: {currency(utilidad)}
                          </Typography>
                        </Stack>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
