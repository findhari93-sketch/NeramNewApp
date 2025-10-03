import { Box, Typography, Avatar, Grid } from "@mui/material";

const guests = [
  {
    name: "Varsha",
    college: "NIT Trichy",
    rank: "JEE 99 Percentile",
    img: "/image/instagram.jpg",
  },
  {
    name: "Vishnu",
    college: "CEPT",
    rank: "Masters in IIT",
    img: "/image/instagram.jpg",
  },
  {
    name: "Sudharshini",
    college: "Oxford, London",
    rank: "Architect in UK",
    img: "/image/instagram.jpg",
  },
];

export default function ParticipatingGuests() {
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Participating Guests
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Meet our distinguished guests who began their journeys at NERAM and are
        now excelling at some of the most prestigious colleges across India and
        abroad.
      </Typography>
      <Grid container spacing={2}>
        {guests.map((g, idx) => (
          <Box key={idx} sx={{ width: { xs: "100%", sm: "33.3333%" } }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={g.img} alt={g.name} sx={{ width: 64, height: 64 }} />
              <Box>
                <Typography fontWeight={600}>{g.name}</Typography>
                <Typography variant="body2">{g.college}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {g.rank}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
