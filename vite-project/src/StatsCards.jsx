import { Grid, Paper, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import AssignmentIcon from "@mui/icons-material/Assignment";

export default function StatsCards({ stats, totalOrders }) {
  return (
    <Grid container spacing={4} justifyContent="center" alignItems="stretch">
      <Grid item xs={12} sm={4}>
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            borderRadius: 3,
            boxShadow: 4,
            bgcolor: "#23272f",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PeopleIcon sx={{ fontSize: 44, color: "#1976d2", mb: 1 }} />
          <Typography
            variant="h3"
            sx={{ color: "#fff", fontWeight: 800, mb: 0 }}
          >
            {stats.students}
          </Typography>
          <Typography
            sx={{
              color: "#b0b3b8",
              fontWeight: 600,
              fontSize: 18,
              mt: 1,
            }}
          >
            Students
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            borderRadius: 3,
            boxShadow: 4,
            bgcolor: "#23272f",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RestaurantMenuIcon sx={{ fontSize: 44, color: "#43a047", mb: 1 }} />
          <Typography
            variant="h3"
            sx={{ color: "#fff", fontWeight: 800, mb: 0 }}
          >
            {stats.menuItems}
          </Typography>
          <Typography
            sx={{
              color: "#b0b3b8",
              fontWeight: 600,
              fontSize: 18,
              mt: 1,
            }}
          >
            Menu Items
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            borderRadius: 3,
            boxShadow: 4,
            bgcolor: "#23272f",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AssignmentIcon sx={{ fontSize: 44, color: "#fbc02d", mb: 1 }} />
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 40,
              mb: 0,
            }}
          >
            {totalOrders}
          </Typography>
          <Typography
            sx={{
              color: "#b0b3b8",
              fontWeight: 600,
              fontSize: 18,
              mt: 1,
            }}
          >
            Orders
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
