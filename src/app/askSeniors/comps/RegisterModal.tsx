import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import React, { useState } from "react";

export default function RegisterModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Add actual registration logic (API call)
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
          minWidth: 320,
          maxWidth: 400,
        }}
      >
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Event Registration
            </Typography>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <Box mt={2} display="flex" gap={2}>
              <Button variant="contained" type="submit" fullWidth>
                Register
              </Button>
              <Button variant="outlined" onClick={onClose} fullWidth>
                Cancel
              </Button>
            </Box>
          </form>
        ) : (
          <Box textAlign="center">
            <Typography variant="h6" color="success.main">
              Thank you for registering!
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={onClose}>
              Close
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
}
