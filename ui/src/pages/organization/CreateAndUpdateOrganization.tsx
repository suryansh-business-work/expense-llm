import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

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

      if (data.success) {
        onClose(true); // Pass true to indicate refresh needed
      } else {
        console.error('Error:', data.message);
      }
    } catch (err: any) {
      console.error('Error:', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        {organization ? 'Update Organization' : 'Create Organization'}
      </DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values, setFieldValue }) => (
            <Form>
              <div className="container-fluid">
                {/* Organization Details Section */}
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Organization Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <div className="row mb-3">
                    <div className="col-12">
                      <Field
                        as={TextField}
                        name="organizationName"
                        label="Organization Name"
                        fullWidth
                        error={touched.organizationName && !!errors.organizationName}
                        helperText={touched.organizationName && errors.organizationName}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-12">
                      <Field
                        as={TextField}
                        name="organizationEmail"
                        label="Email"
                        fullWidth
                        error={touched.organizationEmail && !!errors.organizationEmail}
                        helperText={touched.organizationEmail && errors.organizationEmail}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-12">
                      <Field
                        as={TextField}
                        name="organizationLogo"
                        label="Organization Logo"
                        fullWidth
                      />
                    </div>
                  </div>
                  {/* MUI Dropdown for Category */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <FormControl fullWidth>
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
                    </div>
                  </div>
                </Box>

                {/* Organization Information Section */}
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Organization Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="row">
                        <div className="col-md-4 mb-2">
                          <Field
                            as={TextField}
                            name="organizationInformation.about"
                            label="About"
                            fullWidth
                          />
                        </div>
                        <div className="col-md-4 mb-2">
                          <Field
                            as={TextField}
                            name="organizationInformation.foundedYear"
                            label="Founded Year"
                            fullWidth
                          />
                        </div>
                        <div className="col-md-4 mb-2">
                          <Field
                            as={TextField}
                            name="organizationInformation.ceo"
                            label="CEO"
                            fullWidth
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Employee Count Dropdown */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <FormControl fullWidth>
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
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <Field
                        as={TextField}
                        name="organizationPhone"
                        label="Phone"
                        fullWidth
                      />
                    </div>
                  </div>
                </Box>

                {/* Address Section */}
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Address
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
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
                </Box>

                {/* Other fields Section */}
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Other Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <div className="row mb-3">
                    <div className="col-12">
                      <Field
                        as={TextField}
                        name="organizationWebsite"
                        label="Website"
                        fullWidth
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-12">
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
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-12">
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
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-12">
                      <Typography variant="subtitle1" gutterBottom>
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
                    </div>
                  </div>
                </Box>
              </div>
              <DialogActions>
                <Button onClick={() => onClose(false)} disabled={isSubmitting}>
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
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAndUpdateOrganization;