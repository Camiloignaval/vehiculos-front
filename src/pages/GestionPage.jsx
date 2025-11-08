import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Divider,
  Chip,
  Stack,
  Tooltip,
  InputAdornment,
  IconButton,
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

// Thumbnail simple
function Thumb({ src, alt }) {
  return (
    <div
      style={{
        width: "100%",
        height: 140,
        borderRadius: 8,
        overflow: "hidden",
        marginTop: 8,
        marginBottom: 12,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            opacity: 0.6,
          }}
        >
          Sin imagen
        </div>
      )}
    </div>
  );
}

export default function GestionPage() {
  // Vehículos y resumen de gastos
  const [vehicles, setVehicles] = useState([]);
  const [expenseSumByVeh, setExpenseSumByVeh] = useState({});
  const [vehicleId, setVehicleId] = useState("");
  const [expenses, setExpenses] = useState([]);

  // Crear vehículo
  const [vName, setVName] = useState("");
  const [vPatente, setVPatente] = useState("");
  const [vPrice, setVPrice] = useState("");
  const [vDate, setVDate] = useState(() => todayLocalYMD()); // 👈 local
  const [vImage, setVImage] = useState(null); // archivo de imagen

  // Registrar gasto
  const [eDate, setEDate] = useState(() => todayLocalYMD()); // 👈 local
  const [eName, setEName] = useState("");
  const [eAmount, setEAmount] = useState("");

  // Vender
  const [sellPriceById, setSellPriceById] = useState({});
  const [sellDateById, setSellDateById] = useState({});

  // Búsquedas
  const [qActivos, setQActivos] = useState("");
  const [qVendidos, setQVendidos] = useState("");

  const loadVehicles = async () => {
    const vs = await Vehicles.list(true); // incluye vendidos
    setVehicles(Array.isArray(vs) ? vs : []);

    const sumMap = await Expenses.summary(); // { vehId: totalOperativo }
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

    // Enviar con imagen si existe
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
    await loadVehicles(); // refresca resumen
  };

  const handleMarkSold = async (veh) => {
    const raw = sellPriceById[veh._id];
    const soldPrice = Number(raw);
    if (!raw || Number.isNaN(soldPrice) || soldPrice <= 0) {
      alert("Ingresa un precio de venta válido.");
      return;
    }
    const soldDate = sellDateById[veh._id] || todayLocalYMD();

    if (
      !confirm(
        `Marcar como vendido ${veh.patente} — ${veh.name} por ${currency(
          soldPrice
        )} ?`
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

  // ---------- Secciones y filtros ----------
  const norm = (s) => String(s || "").toLowerCase();
  const match = (v, q) => norm(`${v.patente} ${v.name}`).includes(norm(q));

  const activosSorted = [...vehicles]
    .filter((v) => !v.soldDate)
    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

  const vendidosSorted = [...vehicles]
    .filter((v) => !!v.soldDate)
    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

  const activosFiltrados = activosSorted.filter((v) => match(v, qActivos));
  const vendidosFiltrados = vendidosSorted.filter((v) => match(v, qVendidos));

  const noActivos = activosSorted.length === 0;

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} mb={2}>
        Gestión de vehículos y gastos
      </Typography>

      <Grid container spacing={2}>
        {/* Crear vehículo */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderTop: "4px solid #3B82F6",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h6" mb={2}>
                Nuevo vehículo
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nombre"
                    fullWidth
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Patente"
                    fullWidth
                    value={vPatente}
                    onChange={(e) => setVPatente(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
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

                {/* Subir imagen */}
                <Grid item xs={12}>
                  <Button component="label" variant="outlined">
                    {vImage ? "Cambiar imagen…" : "Subir imagen…"}
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
                  {vImage && (
                    <>
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, display: "block" }}
                      >
                        {vImage.name}
                      </Typography>

                      {/* Vista previa de la imagen */}
                      <div
                        style={{
                          marginTop: 8,
                          width: "100%",
                          height: 160,
                          borderRadius: 8,
                          overflow: "hidden",
                          border: "1px solid rgba(0,0,0,0.12)",
                        }}
                      >
                        <img
                          src={URL.createObjectURL(vImage)}
                          alt="Vista previa"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Button variant="contained" onClick={handleAddVehicle}>
                    Agregar vehículo
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Registrar gasto */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderTop: "4px solid #22C55E",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h6" mb={2}>
                Registrar gasto
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    label={
                      noActivos
                        ? "No hay vehículos activos"
                        : "Vehículo (solo activos)"
                    }
                    fullWidth
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    disabled={noActivos}
                    helperText={
                      noActivos
                        ? "Agrega un vehículo o desmarca una venta para registrar gastos."
                        : ""
                    }
                  >
                    {activosSorted.map((v) => (
                      <MenuItem key={v._id} value={v._id}>
                        {v.patente} — {v.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
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
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Concepto"
                    fullWidth
                    value={eName}
                    onChange={(e) => setEName(e.target.value)}
                    disabled={noActivos}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
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
              <Typography variant="subtitle1" mb={1}>
                Gastos del vehículo seleccionado
              </Typography>
              {expenses.map((g) => (
                <Typography key={g._id} variant="body2">
                  {formatAny_esCL(g.date)} — {g.name}: {currency(g.amount)}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* ===== Activos ===== */}
        <Grid item xs={12}>
          <Card sx={{ borderTop: "4px solid #3B82F6", borderRadius: 2 }}>
            <CardContent>
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
                sx={{ mb: 2 }}
                spacing={2}
              >
                <Typography variant="h6">Vehículos activos</Typography>
                <TextField
                  placeholder="Buscar por patente o nombre"
                  value={qActivos}
                  onChange={(e) => setQActivos(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: qActivos ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setQActivos("")}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{ width: { xs: "100%", md: 360 } }}
                />
              </Stack>

              <Grid container spacing={1} alignItems="stretch">
                {activosFiltrados.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      No hay vehículos activos que coincidan.
                    </Typography>
                  </Grid>
                )}

                {activosFiltrados.map((v) => {
                  const opTotal = expenseSumByVeh[v._id] || 0;
                  const totalInversion = Number(v.purchasePrice || 0) + opTotal;

                  return (
                    <Grid key={v._id} item xs={12} md={6} lg={4}>
                      <Card
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2, height: "100%" }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography fontWeight={700}>
                            {v.patente} — {v.name}
                          </Typography>
                          <Chip label="Activo" color="info" size="small" />
                        </Stack>

                        {/* Thumbnail */}
                        <Thumb
                          src={v.imageUrl}
                          alt={`${v.patente} ${v.name}`}
                        />

                        <Divider sx={{ my: 1.25 }} />
                        <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Compra: {formatAny_esCL(v.purchaseDate)} —{" "}
                            {currency(v.purchasePrice)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Gastos (operativos): {currency(opTotal)}
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            Total invertido: {currency(totalInversion)}
                          </Typography>
                        </Stack>

                        <Divider sx={{ my: 1.25 }} />
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
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
                          <Grid item xs={6}>
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

        {/* ===== Vendidos ===== */}
        <Grid item xs={12}>
          <Card sx={{ borderTop: "4px solid #16a34a", borderRadius: 2 }}>
            <CardContent>
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
                sx={{ mb: 2 }}
                spacing={2}
              >
                <Typography variant="h6">Vehículos vendidos</Typography>
                <TextField
                  placeholder="Buscar por patente o nombre"
                  value={qVendidos}
                  onChange={(e) => setQVendidos(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: qVendidos ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setQVendidos("")}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{ width: { xs: "100%", md: 360 } }}
                />
              </Stack>

              <Grid container spacing={1} alignItems="stretch">
                {vendidosFiltrados.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      No hay vendidos que coincidan.
                    </Typography>
                  </Grid>
                )}

                {vendidosFiltrados.map((v) => {
                  const opTotal = expenseSumByVeh[v._id] || 0;
                  const totalCosto = Number(v.purchasePrice || 0) + opTotal;
                  const utilidad = Number(v.soldPrice || 0) - totalCosto;

                  return (
                    <Grid key={v._id} item xs={12} md={6} lg={4}>
                      <Card
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2, height: "100%" }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography fontWeight={700}>
                            {v.patente} — {v.name}
                          </Typography>
                          <Chip label="Vendido" color="success" size="small" />
                        </Stack>

                        {/* Thumbnail */}
                        <Thumb
                          src={v.imageUrl}
                          alt={`${v.patente} ${v.name}`}
                        />

                        <Divider sx={{ my: 1.25 }} />
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            Compra: {formatAny_esCL(v.purchaseDate)} —{" "}
                            {currency(v.purchasePrice)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Vendido: {formatAny_esCL(v.soldDate)} —{" "}
                            {currency(v.soldPrice)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Gasto total (operativo): {currency(opTotal)}
                          </Typography>
                          <Divider sx={{ my: 0.75 }} />
                          <Typography variant="body2" fontWeight={700}>
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
