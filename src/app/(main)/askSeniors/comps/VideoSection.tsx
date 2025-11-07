import { Box, Typography } from "@mui/material";

export default function VideoSection() {
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Why Attend?
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Discover the real insights you need to make the best college choice! At
        the &quot;Ask Senior&quot; event, you&apos;ll have the unique
        opportunity to hear personal experiences directly from alumni. Get all
        your questions answered to clear any doubts and make well-informed
        decisions. Best of all, this is a free online event.
      </Typography>
      <Box display="flex" justifyContent="center">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/eP6Z6Bd7ahc"
          title="NATA Best architecture colleges in Tamilnadu B.arch students"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </Box>
    </Box>
  );
}
