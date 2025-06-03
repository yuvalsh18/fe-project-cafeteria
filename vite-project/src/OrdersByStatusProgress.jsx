import { Paper, Typography, Box, LinearProgress } from "@mui/material";

export default function OrdersByStatusProgress({
  orderStatusLabels,
  totalOrders,
}) {
  return (
    <Paper
      sx={{
        p: 3,
        bgcolor: "#23272f",
        borderRadius: 3,
        boxShadow: 4,
        mt: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "#fff",
          mb: 3,
          fontWeight: 700,
          textAlign: "center",
          letterSpacing: 1,
        }}
      >
        Orders by Status (Progress)
      </Typography>
      <Box sx={{ width: 600, mx: "auto" }}>
        {orderStatusLabels.map((s) => (
          <Box
            key={s.label}
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <Box sx={{ width: 180, pr: 2 }}>
              <Typography
                sx={{
                  color: s.color,
                  fontWeight: 700,
                  fontSize: 18,
                  textShadow: "0 1px 2px #111",
                  whiteSpace: "nowrap",
                  ml: 0,
                }}
              >
                {s.label}{" "}
                <span style={{ color: "#b0b3b8", fontWeight: 600 }}>
                  ({s.value})
                </span>
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
              <LinearProgress
                variant="determinate"
                value={
                  totalOrders ? Math.round((s.value / totalOrders) * 100) : 0
                }
                sx={{
                  width: "100%",
                  height: 14,
                  borderRadius: 2,
                  bgcolor: "#333",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: s.color,
                  },
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
