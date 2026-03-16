import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

export default function KpiCard({
  title,
  value,
  subtitle = null,
  helperText = null,
  spark = null,
  color = "#22c55e",
  valueColor = "text.primary",
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ height: "100%" }}>
        <Stack spacing={1.25} sx={{ height: "100%" }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {helperText ? (
              <Tooltip title={helperText} arrow placement="top">
                <InfoOutlinedIcon
                  sx={{ fontSize: 15, color: "text.disabled", cursor: "help" }}
                />
              </Tooltip>
            ) : null}
          </Stack>

          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}

          <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <Typography variant="h5" fontWeight={800} color={valueColor}>
              {value}
            </Typography>
            {spark}
          </Box>

          <Box
            sx={{
              mt: "auto",
              height: 4,
              bgcolor: `${color}33`,
              borderRadius: 999,
            }}
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
        </Stack>
      </CardContent>
    </Card>
  );
}
