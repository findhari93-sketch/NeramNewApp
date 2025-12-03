"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Card,
  CardContent,
  Grid as GridOrig,
  Chip,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';

// Alias Grid to support size prop
const Grid: any = GridOrig;
import {
  CheckCircle,
  School,
  Download,
  VideoCall,
  AssignmentTurnedIn,
  ContactSupport,
  ArrowForward,
  Phone,
  Email,
  WhatsApp,
  MenuBook,
  Computer,
  AccountCircle,
  Celebration,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import apiFetch from '@/lib/apiClient';

const steps = [
  {
    label: 'Payment Confirmed',
    description: 'Your payment has been successfully processed',
    icon: <CheckCircle />,
    status: 'completed',
  },
  {
    label: 'Download Required Apps',
    description: 'Install the apps you\'ll need for classes',
    icon: <Download />,
    status: 'active',
  },
  {
    label: 'Account Setup (24-48 hours)',
    description: 'Admin will create your study portal account',
    icon: <AccountCircle />,
    status: 'pending',
  },
  {
    label: 'Join Your First Class',
    description: 'Start your learning journey',
    icon: <School />,
    status: 'pending',
  },
];

const requiredApps = [
  {
    name: 'Neram Classes Study Portal',
    url: 'https://app.neramclasses.com',
    description: 'Access study materials, practice tests, and track your progress',
    icon: <MenuBook sx={{ fontSize: 40, color: '#4a148c' }} />,
    color: '#e1bee7',
  },
  {
    name: 'Microsoft Teams',
    url: 'https://www.microsoft.com/en/microsoft-teams/download-app',
    description: 'Attend live online classes and interact with instructors',
    icon: <VideoCall sx={{ fontSize: 40, color: '#1976d2' }} />,
    color: '#bbdefb',
  },
];

export default function PremiumWelcomePage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState<any>(null);

  useEffect(() => {
    // Fetch application data to show course details
    const fetchApplicationData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        router.replace('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          setApplicationData(data);
        }
      } catch (error) {
        console.error('Error fetching application data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Header */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: 3,
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Celebration sx={{ fontSize: 48, mr: 2 }} />
          <Box>
            <Typography variant="h3" fontWeight="bold">
              Welcome to Premium!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
              Your journey to success starts here
            </Typography>
          </Box>
        </Box>
        <Alert severity="success" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '& .MuiAlert-icon': { color: 'white' } }}>
          <AlertTitle sx={{ fontWeight: 'bold' }}>Payment Successful!</AlertTitle>
          Thank you for enrolling with Neram Classes. You now have full access to our premium learning platform.
        </Alert>
      </Paper>

      {/* Next Steps */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentTurnedIn sx={{ mr: 1, color: 'primary.main' }} />
              Your Next Steps
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label} completed={index < activeStep}>
                  <StepLabel
                    optional={
                      step.status === 'pending' ? (
                        <Typography variant="caption">Pending</Typography>
                      ) : step.status === 'completed' ? (
                        <Chip label="Done" color="success" size="small" />
                      ) : null
                    }
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: index <= activeStep ? 'primary.main' : 'grey.300',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {step.icon}
                      </Box>
                    )}
                  >
                    <Typography fontWeight="bold">{step.label}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {step.description}
                    </Typography>
                    {index === 1 && (
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(2)}
                          endIcon={<ArrowForward />}
                        >
                          Continue
                        </Button>
                      </Box>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Required Apps */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Download sx={{ mr: 1, color: 'primary.main' }} />
              Required Apps & Tools
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              {requiredApps.map((app) => (
                <Grid size={{ xs: 12 }} key={app.name}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '2px solid',
                      borderColor: 'divider',
                      '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                      transition: 'all 0.3s',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            bgcolor: app.color,
                            p: 2,
                            borderRadius: 2,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {app.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {app.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {app.description}
                          </Typography>
                          <Button
                            variant="outlined"
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<Computer />}
                          >
                            Open {app.name.split(' ')[0]}
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Account Setup Information */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountCircle sx={{ mr: 1, color: 'primary.main' }} />
              Account Setup Process
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>What Happens Next?</AlertTitle>
              Our admin team will verify your payment and create your study portal account within 24-48 hours.
            </Alert>

            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Payment Verification"
                  secondary="Admin team verifies your payment details"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Account Creation"
                  secondary="Your personal study portal account will be created"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Credentials Delivery"
                  secondary="You'll receive your login ID and password via email"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Class Schedule"
                  secondary="Microsoft Teams links and class timings will be shared"
                />
              </ListItem>
            </List>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>Important:</strong> Please check your email regularly (including spam folder) for your account credentials.
            </Alert>
          </Paper>
        </Grid>

        {/* Sidebar - Contact & Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Quick Actions */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AssignmentTurnedIn />}
                onClick={() => router.push('/applications')}
              >
                View My Application
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Download />}
                onClick={async () => {
                  try {
                    const res = await apiFetch('/api/payments/invoice');
                    if (!res.ok) throw new Error('Failed to download invoice');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Invoice_${Date.now()}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch (e) {
                    console.error('Invoice download failed:', e);
                    alert('Failed to download invoice. Please try again.');
                  }
                }}
              >
                Download Invoice
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MenuBook />}
                href="https://app.neramclasses.com"
                target="_blank"
              >
                Study Portal
              </Button>
            </Box>
          </Paper>

          {/* Contact Support */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ContactSupport sx={{ mr: 1 }} />
              Need Help?
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" color="text.secondary" paragraph>
              Our support team is here to assist you with any questions.
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Phone color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Call Us"
                  secondary={
                    <MuiLink href="tel:+919176137043" color="inherit">
                      +91 91761 37043
                    </MuiLink>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Email color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Email Support"
                  secondary={
                    <MuiLink href="mailto:support@neram.co.in" color="inherit">
                      support@neram.co.in
                    </MuiLink>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WhatsApp color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="WhatsApp"
                  secondary={
                    <MuiLink href="https://wa.me/919176137043" target="_blank" color="inherit">
                      Chat with us
                    </MuiLink>
                  }
                />
              </ListItem>
            </List>
          </Paper>

          {/* Course Info */}
          {applicationData && (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Your Course
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" paragraph>
                {applicationData.selected_course || 'NATA/JEE Coaching'}
              </Typography>
              <Chip label="Premium Access" color="success" size="small" />
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
