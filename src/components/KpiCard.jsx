import { Card, CardContent, Typography, Box } from "@mui/material";

export default function KpiCard({
  title,
  value,
  spark = null,
  color = "#22c55e",
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mt: 0.5 }}>
          <Typography variant="h5" fontWeight={800}>
            {value}
          </Typography>
          {spark}
        </Box>
        <Box
          sx={{ mt: 2, height: 4, bgcolor: `${color}33`, borderRadius: 999 }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              bgcolor: color,
              borderRadius: 999,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
