import { Box, Typography } from "@mui/material";

const colleges = [
  { name: "Anna University", city: "Chennai" },
  { name: "NIT Trichy", city: "Trichy" },
  { name: "CEPT", city: "Ahmedabad" },
  { name: "SPA Delhi", city: "Delhi" },
  { name: "VIT Vellore", city: "Vellore" },
  // ...add more as needed
];

export default function CollegeScroll() {
  return (
    <Box sx={{ display: "flex", overflowX: "auto", py: 2, gap: 2 }}>
      {colleges.map((clg, idx) => (
        <Box
          key={idx}
          sx={{
            minWidth: 180,
            bgcolor: "grey.100",
            borderRadius: 2,
            p: 2,
            boxShadow: 1,
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {clg.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {clg.city}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
