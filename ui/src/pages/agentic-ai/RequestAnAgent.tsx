import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PersonIcon from "@mui/icons-material/Person";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PaymentIcon from "@mui/icons-material/Payment";
import CategoryIcon from "@mui/icons-material/Category";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

const USAGE_OPTIONS = [
  { value: "business", label: "Business Use", icon: <BusinessCenterIcon fontSize="small" /> },
  { value: "personal", label: "Personal Use", icon: <PersonIcon fontSize="small" /> },
];

const CATEGORY_OPTIONS = [
  { value: "finance", label: "Finance" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other (please specify)" },
];

const BUDGET_OPTIONS = [
  { value: "under_100", label: "Under $100" },
  { value: "100_500", label: "$100 - $500" },
  { value: "500_2000", label: "$500 - $2,000" },
  { value: "2000_plus", label: "$2,000+" },
  { value: "not_sure", label: "Not Sure" },
];

const TIME_PERIOD_OPTIONS = [
  { value: "1_week", label: "1 Week" },
  { value: "2_weeks", label: "2 Weeks" },
  { value: "1_month", label: "1 Month" },
  { value: "flexible", label: "Flexible" },
];

const PAYMENT_OPTIONS = [
  { value: "freelance", label: "Freelancing Site (Upwork, Fiverr, etc.)" },
  { value: "gateway", label: "Payment Gateway (Stripe, Razorpay, etc.)" },
  { value: "other", label: "Other / To be discussed" },
];

const validationSchema = Yup.object().shape({
  usage: Yup.string().required("Please select usage type"),
  agentName: Yup.string().required("Please enter a name for your agent"),
  agentIdea: Yup.string().required("Please describe your agent idea"),
  category: Yup.string().required("Please select a category"),
  categoryOther: Yup.string().when("category", (category, schema) => 
    (Array.isArray(category) ? category[0] : category) === "other"
      ? schema.required("Please specify the category")
      : schema
  ),
  budget: Yup.string().required("Please select your budget"),
  timePeriod: Yup.string().required("Please select a time period"),
  paymentMode: Yup.string().required("Please select a payment mode"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]{7,20}$/, "Invalid phone number")
    .required("Phone is required"),
  moreInfo: Yup.string(),
});

const initialValues = {
  usage: "",
  agentName: "",
  agentIdea: "",
  category: "",
  categoryOther: "",
  budget: "",
  timePeriod: "",
  paymentMode: "",
  email: "",
  phone: "",
  moreInfo: "",
};

interface RequestAnAgentProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (values: typeof initialValues) => void;
}

const RequestAnAgent: React.FC<RequestAnAgentProps> = ({ open, onClose, onSubmit }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 700 }}>
        <LightbulbIcon color="primary" sx={{ mr: 1 }} />
        Request a Custom AI Agent
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setSubmitting(true);
          // Simulate API call
          setTimeout(() => {
            setSubmitting(false);
            if (onSubmit) onSubmit(values);
            resetForm();
            onClose();
          }, 1200);
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                <b>Tell us about your dream AI agent!</b> Our team will review your requirements and reach out with a tailored solution to help you automate, scale, and grow your business or personal productivity.
              </Typography>
              <div className="row">
                {/* Usage */}
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth error={!!(touched.usage && errors.usage)}>
                    <InputLabel id="usage-label">Agent Required For</InputLabel>
                    <Select
                      labelId="usage-label"
                      name="usage"
                      value={values.usage}
                      label="Agent Required For"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      startAdornment={
                        values.usage === "business" ? <BusinessCenterIcon sx={{ mr: 1 }} /> :
                        values.usage === "personal" ? <PersonIcon sx={{ mr: 1 }} /> : null
                      }
                    >
                      {USAGE_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.icon} {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{touched.usage && errors.usage}</FormHelperText>
                  </FormControl>
                </div>
                {/* Agent Name */}
                <div className="col-md-6 mb-3">
                  <Field
                    as={TextField}
                    name="agentName"
                    label="Agent Name (in your mind)"
                    fullWidth
                    error={touched.agentName && !!errors.agentName}
                    helperText={touched.agentName && errors.agentName}
                  />
                </div>
                {/* Agent Idea */}
                <div className="col-md-12 mb-3">
                  <Field
                    as={TextField}
                    name="agentIdea"
                    label="Describe your Agent Idea (basic or high level)"
                    fullWidth
                    multiline
                    minRows={2}
                    error={touched.agentIdea && !!errors.agentIdea}
                    helperText={touched.agentIdea && errors.agentIdea}
                  />
                </div>
                {/* Category */}
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth error={!!(touched.category && errors.category)}>
                    <InputLabel id="category-label">Automation Category</InputLabel>
                    <Select
                      labelId="category-label"
                      name="category"
                      value={values.category}
                      label="Automation Category"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      startAdornment={<CategoryIcon sx={{ mr: 1 }} />}
                    >
                      {CATEGORY_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{touched.category && errors.category}</FormHelperText>
                  </FormControl>
                </div>
                {/* Category Other */}
                {values.category === "other" && (
                  <div className="col-md-6 mb-3">
                    <Field
                      as={TextField}
                      name="categoryOther"
                      label="Please specify category"
                      fullWidth
                      error={touched.categoryOther && !!errors.categoryOther}
                      helperText={touched.categoryOther && errors.categoryOther}
                    />
                  </div>
                )}
                {/* Budget */}
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth error={!!(touched.budget && errors.budget)}>
                    <InputLabel id="budget-label">Your Budget</InputLabel>
                    <Select
                      labelId="budget-label"
                      name="budget"
                      value={values.budget}
                      label="Your Budget"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      startAdornment={<MonetizationOnIcon sx={{ mr: 1 }} />}
                    >
                      {BUDGET_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{touched.budget && errors.budget}</FormHelperText>
                  </FormControl>
                </div>
                {/* Time Period */}
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth error={!!(touched.timePeriod && errors.timePeriod)}>
                    <InputLabel id="timePeriod-label">Time Period</InputLabel>
                    <Select
                      labelId="timePeriod-label"
                      name="timePeriod"
                      value={values.timePeriod}
                      label="Time Period"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      startAdornment={<AccessTimeIcon sx={{ mr: 1 }} />}
                    >
                      {TIME_PERIOD_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{touched.timePeriod && errors.timePeriod}</FormHelperText>
                  </FormControl>
                </div>
                {/* Payment Mode */}
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth error={!!(touched.paymentMode && errors.paymentMode)}>
                    <InputLabel id="paymentMode-label">Preferred Payment Mode</InputLabel>
                    <Select
                      labelId="paymentMode-label"
                      name="paymentMode"
                      value={values.paymentMode}
                      label="Preferred Payment Mode"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      startAdornment={<PaymentIcon sx={{ mr: 1 }} />}
                    >
                      {PAYMENT_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{touched.paymentMode && errors.paymentMode}</FormHelperText>
                  </FormControl>
                </div>
                {/* Email */}
                <div className="col-md-6 mb-3">
                  <Field
                    as={TextField}
                    name="email"
                    label="Your Email for Communication"
                    fullWidth
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </div>
                {/* Phone */}
                <div className="col-md-6 mb-3">
                  <Field
                    as={TextField}
                    name="phone"
                    label="Your Phone for Communication"
                    fullWidth
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </div>
                {/* More Info */}
                <div className="col-md-12 mb-3">
                  <Field
                    as={TextField}
                    name="moreInfo"
                    label="Anything else we should know? (Goals, integrations, must-have features, etc.)"
                    fullWidth
                    multiline
                    minRows={2}
                    error={touched.moreInfo && !!errors.moreInfo}
                    helperText={touched.moreInfo && errors.moreInfo}
                  />
                </div>
              </div>
              <Box sx={{ mt: 2, bgcolor: "#f7f8fa", p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <b>Why choose us?</b> Our AI experts will help you design, develop, and deploy a custom agent tailored to your needs. We offer transparent pricing, flexible payment options, and ongoing support to ensure your success.
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={onClose} variant="outlined" color="inherit" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ minWidth: 120, fontWeight: 600 }}
                startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {isSubmitting ? "Submitting..." : "Request Agent"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default RequestAnAgent;