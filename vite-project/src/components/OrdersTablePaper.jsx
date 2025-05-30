import React from "react";
import { Paper, Box, Typography, Grid } from "@mui/material";

/**
 * A reusable Paper wrapper for displaying order tables in Admin and Student home pages.
 * Accepts all required props to render the 5 status sections inside.
 */
export default function OrdersTablePaper({
  loading,
  ordersByStatus,
  ORDER_STATUSES,
  STATUS_ICONS,
  STATUS_COLORS,
  STATUS_BG,
  onOrderCardClick,
  renderOrderCard, // function (order, status) => ReactNode
  mode = "student",
  ...props
}) {
  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 1600,
        minWidth: 1200,
        mx: "auto",
        p: { xs: 2, sm: 4 },
        borderRadius: 5,
        mt: 3,
        bgcolor: "#f8fafc",
      }}
      {...props}
    >
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="40vh"
        >
          <Typography variant="h6">Loading orders...</Typography>
        </Box>
      ) : (
        <Box>
          {ORDER_STATUSES.map((status) => (
            <Paper
              key={status}
              elevation={2}
              sx={{
                mb: 6,
                p: 3,
                borderRadius: 4,
                bgcolor: STATUS_BG[status],
                borderLeft: `8px solid ${STATUS_COLORS[status]}`,
                width: "100%",
                boxSizing: "border-box",
                minWidth: 0,
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                {React.cloneElement(STATUS_ICONS[status], {
                  style: { color: STATUS_COLORS[status], marginRight: 12 },
                })}
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: STATUS_COLORS[status],
                    letterSpacing: 1,
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {ordersByStatus[status] && ordersByStatus[status].length > 0 ? (
                  ordersByStatus[status].map((order) => (
                    <Grid item xs={12} sm={6} md={4} key={order.id}>
                      {renderOrderCard ? renderOrderCard(order, status) : null}
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      color="text.disabled"
                      align="center"
                    >
                      No orders
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          ))}
        </Box>
      )}
    </Paper>
  );
}
