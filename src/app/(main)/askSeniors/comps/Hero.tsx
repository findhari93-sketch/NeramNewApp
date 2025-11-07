import { Box, Button, Grid, Typography } from "@mui/material";
import Image from "next/image";

export default function Hero({ onRegister }: { onRegister: () => void }) {
  return (
    <Grid container spacing={2} alignItems="center" sx={{ py: 4 }}>
      <Box sx={{ width: { xs: "100%", md: "66.6667%" } }}>
        <Typography variant="h2" color="primary" fontWeight={700} gutterBottom>
          #askSeniors NATA Event
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Ready to Choose the Perfect College for Your BArch Journey? Join the
          exclusive <b>#AskSeniors</b> event by NeramClasses.com and interact
          with alumni from over 50+ prestigious institutions! Before making your
          choice in the TNEA BArch counseling, gain invaluable insights directly
          from students who have been in your shoes. Understand the positives
          and negatives of universities across Tamil Nadu and India from a
          student&apos;s point of view. Hear firsthand accounts of campus life,
          faculty, and facilities, clear your doubts, and make informed
          decisions. This is a free online event.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onRegister}
        >
          Get Registered
        </Button>
      </Box>
      <Box sx={{ width: { xs: "100%", md: "33.3333%" } }}>
        <Box display="flex" justifyContent="center">
          <Image
            src="/images/asksenior/NATA_Coaching_center_Students.png"
            alt="NATA Coaching Center Students"
            width={350}
            height={300}
            style={{ maxWidth: "100%", height: "auto" }}
            priority
          />
        </Box>
      </Box>
    </Grid>
  );
}
