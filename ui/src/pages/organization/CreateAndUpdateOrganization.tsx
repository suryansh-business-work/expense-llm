import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  TextField,
  CircularProgress,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Fade,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_OPTIONS = [
  { id: 1, name: 'Technology' },
  { id: 2, name: 'Finance' },
  { id: 3, name: 'Healthcare' },
  { id: 4, name: 'Education' },
];

const EMPLOYEE_COUNT_OPTIONS = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
];

interface OrganizationAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

interface OrganizationInformation {
  about?: string;
  foundedYear?: string;
  ceo?: string;
}

interface OrganizationRegistrationDetails {
  registrationNumber?: string;
  registrationType?: string;
  registrationDate?: string;
}

interface OrganizationFormData {
  organizationId?: string;
  organizationName: string;
  organizationLogo?: string;
  organizationCategory?: { id: number; name: string } | '';
  organizationInformation?: OrganizationInformation;
  organizationEmployeeCount?: string;
  organizationEmail: string;
  organizationPhone?: string;
  organizationAddress?: OrganizationAddress;
  organizationApiKey?: string;
  isOrganizationPublic?: boolean;
  organizationWebsite?: string;
  isOrganizationDisabled?: boolean;
  organizationRegistrationDetails?: OrganizationRegistrationDetails;
}

interface CreateAndUpdateOrganizationProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  organization?: OrganizationFormData | null;
}

const API_BASE = 'http://localhost:3000/v1/api/organization';

const validationSchema = Yup.object({
  organizationName: Yup.string().required('Organization Name is required'),
  organizationEmail: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  organizationCategory: Yup.object().nullable(),
  organizationEmployeeCount: Yup.string(),
  organizationInformation: Yup.object(),
  organizationAddress: Yup.object({
    line1: Yup.string(),
    line2: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    country: Yup.string(),
    zip: Yup.string(),
  }),
});

const CreateAndUpdateOrganization: React.FC<CreateAndUpdateOrganizationProps> = ({
  open,
  onClose,
  organization,
}) => {
  const theme = useTheme();

  const initialValues: OrganizationFormData = {
    organizationId: organization?.organizationId,
    organizationName: organization?.organizationName || '',
    organizationLogo: organization?.organizationLogo || '',
    organizationCategory: organization?.organizationCategory || '',
    organizationInformation: organization?.organizationInformation || { about: '', foundedYear: '', ceo: '' },
    organizationEmployeeCount: organization?.organizationEmployeeCount || '',
    organizationEmail: organization?.organizationEmail || '',
    organizationPhone: organization?.organizationPhone || '',
    organizationAddress: organization?.organizationAddress || {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      zip: '',
    },
    organizationApiKey: organization?.organizationApiKey || '',
    isOrganizationPublic: organization?.isOrganizationPublic || false,
    organizationWebsite: organization?.organizationWebsite || '',
    isOrganizationDisabled: organization?.isOrganizationDisabled || false,
    organizationRegistrationDetails: organization?.organizationRegistrationDetails || {
      registrationNumber: '',
      registrationType: '',
      registrationDate: '',
    },
  };

  const handleSubmit = async (
    values: OrganizationFormData,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const token = localStorage.getItem('token');
      const url = values.organizationId
        ? `${API_BASE}/update/${values.organizationId}`
        : `${API_BASE}/create`;

      const payload = {
        ...values,
        organizationEmail: values.organizationEmail,
        organizationCategory: values.organizationCategory || {},
        organizationInformation: values.organizationInformation || {},
        organizationAddress: values.organizationAddress || {},
        organizationRegistrationDetails: values.organizationRegistrationDetails || {},
      };

      const response = await fetch(url, {
        method: values.organizationId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data?.data) {
        onClose(true);
      } else {
        console.error('Error:', data.message);
      }
    } catch (err: any) {
      console.error('Error:', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const accordionSx = {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : '#f7f8fa',
    mb: 2,
    boxShadow: 'none',
    '&:before': { display: 'none' },
    borderRadius: 2,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'background 0.3s',
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => onClose(false)}
      style={{ zIndex: 1300 }}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 600 },
            maxWidth: '100vw',
            p: 0,
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            boxShadow: 8,
            background: theme.palette.background.default,
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, pb: 1 }}>
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, letterSpacing: 0.5 }}>
          {organization ? 'Update Organization' : 'Create Organization'}
        </Typography>
        <Tooltip title="Close">
          <IconButton onClick={() => onClose(false)} size="large">
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />

      {/* Context Section */}
      <Fade in timeout={600}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 3,
            p: 3,
            pb: 1,
            mb: 2,
            background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : '#f7f8fa',
            borderBottom: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f0f2f5',
              borderRadius: 2,
              width: 64,
              height: 64,
              minWidth: 64,
              minHeight: 64,
              boxShadow: 1,
            }}
          >
            <BusinessIcon color="primary" sx={{ fontSize: 40 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
              Welcome to Organization Creation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Create your organization to unlock the full power of our secure, in-house server management platform.<br />
            </Typography>
          </Box>
        </Box>
      </Fade>

      <Box sx={{ p: 3, pt: 1, overflowY: 'auto' }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values, setFieldValue }) => (
            <Form>
              <AnimatePresence>
                {/* Organization Details Section */}
                <motion.div
                  key="org-details"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.3 }}
                  style={{ marginBottom: theme.spacing(2) }} // <-- Add gap after accordion
                >
                  <Accordion defaultExpanded sx={accordionSx}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h5" fontSize={16} fontWeight={600}>
                        Organization Details
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Field
                        as={TextField}
                        name="organizationName"
                        label="Organization Name *"
                        fullWidth
                        error={touched.organizationName && !!errors.organizationName}
                        helperText={touched.organizationName && errors.organizationName}
                        sx={{ mb: 2 }}
                        autoFocus
                      />
                      <Field
                        as={TextField}
                        name="organizationEmail"
                        label="Email *"
                        fullWidth
                        error={touched.organizationEmail && !!errors.organizationEmail}
                        helperText={touched.organizationEmail && errors.organizationEmail}
                        sx={{ mb: 2 }}
                      />
                      <Field
                        as={TextField}
                        name="organizationLogo"
                        label="Organization Logo"
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Organization Category</InputLabel>
                        <Select
                          name="organizationCategory"
                          value={
                            values.organizationCategory
                              ? (values.organizationCategory as any).id || ''
                              : ''
                          }
                          label="Organization Category"
                          onChange={e => {
                            const selected = CATEGORY_OPTIONS.find(
                              opt => opt.id === e.target.value
                            );
                            setFieldValue('organizationCategory', selected || '');
                          }}
                        >
                          {CATEGORY_OPTIONS.map(option => (
                            <MenuItem key={option.id} value={option.id}>
                              {option.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>
                </motion.div>

                {/* Organization Information Section */}
                <motion.div
                  key="org-info"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  style={{ marginBottom: theme.spacing(2) }} // <-- Add gap after accordion
                >
                  <Accordion sx={accordionSx}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h5" fontSize={16} fontWeight={600}>
                        Organization Information <Typography component="span" variant="body2" color="text.secondary">(Optional)</Typography>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                        <Field
                          as={TextField}
                          name="organizationInformation.about"
                          label="About"
                          fullWidth
                        />
                        <Field
                          as={TextField}
                          name="organizationInformation.foundedYear"
                          label="Founded Year"
                          fullWidth
                        />
                        <Field
                          as={TextField}
                          name="organizationInformation.ceo"
                          label="CEO"
                          fullWidth
                        />
                      </Box>
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Employee Count</InputLabel>
                        <Select
                          name="organizationEmployeeCount"
                          value={values.organizationEmployeeCount || ''}
                          label="Employee Count"
                          onChange={e =>
                            setFieldValue('organizationEmployeeCount', e.target.value)
                          }
                        >
                          {EMPLOYEE_COUNT_OPTIONS.map(option => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Field
                        as={TextField}
                        name="organizationPhone"
                        label="Phone"
                        fullWidth
                        sx={{ mt: 2 }}
                      />
                    </AccordionDetails>
                  </Accordion>
                </motion.div>

                {/* Address Section */}
                <motion.div
                  key="org-address"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  style={{ marginBottom: theme.spacing(2) }} // <-- Add gap after accordion
                >
                  <Accordion sx={accordionSx}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h5" fontSize={16} fontWeight={600}>
                        Address <Typography component="span" variant="body2" color="text.secondary">(Optional)</Typography>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                        <Field
                          as={TextField}
                          name="organizationAddress.line1"
                          label="Line 1"
                          fullWidth
                        />
                        <Field
                          as={TextField}
                          name="organizationAddress.line2"
                          label="Line 2"
                          fullWidth
                        />
                        <Field
                          as={TextField}
                          name="organizationAddress.city"
                          label="City"
                          fullWidth
                        />
                        <Field
                          as={TextField}
                          name="organizationAddress.state"
                          label="State"
                          fullWidth
                        />
                        <Field
                          as={TextField}
                          name="organizationAddress.country"
                          label="Country"
                          fullWidth
                        />
                        <Field
                          as={TextField}
                          name="organizationAddress.zip"
                          label="ZIP"
                          fullWidth
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </motion.div>

                {/* Other fields Section */}
                <motion.div
                  key="org-other"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.35, delay: 0.15 }}
                  style={{ marginBottom: theme.spacing(2) }} // <-- Add gap after accordion
                >
                  <Accordion sx={accordionSx}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h5" fontSize={16} fontWeight={600}>
                        Other Details <Typography component="span" variant="body2" color="text.secondary">(Optional)</Typography>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Field
                        as={TextField}
                        name="organizationWebsite"
                        label="Website"
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.isOrganizationPublic}
                            onChange={e =>
                              setFieldValue('isOrganizationPublic', e.target.checked)
                            }
                            name="isOrganizationPublic"
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle1" fontWeight={500}>
                              Public Organization
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Enable to make your organization visible to everyone.
                            </Typography>
                          </Box>
                        }
                        sx={{ alignItems: 'flex-start', mb: 1 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.isOrganizationDisabled}
                            onChange={e =>
                              setFieldValue('isOrganizationDisabled', e.target.checked)
                            }
                            name="isOrganizationDisabled"
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle1" fontWeight={500}>
                              Disabled Organization
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Disable to restrict all activities for this organization.
                            </Typography>
                          </Box>
                        }
                        sx={{ alignItems: 'flex-start', mb: 1 }}
                      />
                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                        Registration Details
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                        <Field
                          as={TextField}
                          name="organizationRegistrationDetails.registrationNumber"
                          label="Registration Number"
                          fullWidth
                        />
                        <Field
                          as={TextField}
                          name="organizationRegistrationDetails.registrationType"
                          label="Registration Type"
                          fullWidth
                        />
                        <Field
                          as={TextField}
                          name="organizationRegistrationDetails.registrationDate"
                          label="Registration Date"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </motion.div>
              </AnimatePresence>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button onClick={() => onClose(false)} disabled={isSubmitting} variant="outlined">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
                  }
                >
                  {organization ? 'Update' : 'Create'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Drawer>
  );
};

export default CreateAndUpdateOrganization;