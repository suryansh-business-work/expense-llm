import { useState, ChangeEvent } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  InputBase,
  IconButton,
  Drawer,
  FormGroup,
  TextField,
  Button,
  MenuItem,
  Select,
  Tabs,
  Tab,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";

const uiComponentGroups = [
  {
    id: "inputs",
    name: "Inputs",
    description: "Input components for user interaction.",
    components: [
      { id: "autocomplete", name: "Autocomplete", description: "Autocomplete input field" },
      { id: "button", name: "Button", description: "Clickable button" },
      { id: "button-group", name: "Button Group", description: "Group of buttons" },
      { id: "checkbox", name: "Checkbox", description: "Checkbox input" },
      { id: "floating-action-button", name: "Floating Action Button", description: "FAB for primary action" },
      { id: "radio-group", name: "Radio Group", description: "Group of radio buttons" },
      { id: "rating", name: "Rating", description: "Star rating input" },
      { id: "select", name: "Select", description: "Dropdown select" },
      { id: "slider", name: "Slider", description: "Slider input" },
      { id: "switch", name: "Switch", description: "Toggle switch" },
      { id: "text-field", name: "Text Field", description: "Text input field" },
      { id: "transfer-list", name: "Transfer List", description: "Move items between lists" },
      { id: "toggle-button", name: "Toggle Button", description: "Toggle button" },
    ],
  },
  {
    id: "data-display",
    name: "Data display",
    description: "Components for displaying data.",
    components: [
      { id: "avatar", name: "Avatar", description: "User avatar" },
      { id: "badge", name: "Badge", description: "Badge for notifications" },
      { id: "chip", name: "Chip", description: "Chip for tags" },
      { id: "divider", name: "Divider", description: "Divider line" },
      { id: "icons", name: "Icons", description: "Icon set" },
      { id: "material-icons", name: "Material Icons", description: "Material icon set" },
      { id: "list", name: "List", description: "List of items" },
      { id: "table", name: "Table", description: "Data table" },
      { id: "tooltip", name: "Tooltip", description: "Tooltip for hints" },
      { id: "typography", name: "Typography", description: "Text styles" },
    ],
  },
  {
    id: "feedback",
    name: "Feedback",
    description: "Feedback and status components.",
    components: [
      { id: "alert", name: "Alert", description: "Alert messages" },
      { id: "backdrop", name: "Backdrop", description: "Backdrop overlay" },
      { id: "dialog", name: "Dialog", description: "Dialog modal" },
      { id: "progress", name: "Progress", description: "Progress indicators" },
      { id: "skeleton", name: "Skeleton", description: "Loading skeleton" },
      { id: "snackbar", name: "Snackbar", description: "Snackbar notifications" },
    ],
  },
  {
    id: "surfaces",
    name: "Surfaces",
    description: "Surface and container components.",
    components: [
      { id: "accordion", name: "Accordion", description: "Expandable accordion" },
      { id: "app-bar", name: "App Bar", description: "Top app bar" },
      { id: "card", name: "Card", description: "Content card" },
      { id: "paper", name: "Paper", description: "Paper surface" },
    ],
  },
  {
    id: "navigation",
    name: "Navigation",
    description: "Navigation components.",
    components: [
      { id: "bottom-navigation", name: "Bottom Navigation", description: "Bottom navigation bar" },
      { id: "breadcrumbs", name: "Breadcrumbs", description: "Breadcrumb navigation" },
      { id: "drawer", name: "Drawer", description: "Side drawer" },
      { id: "link", name: "Link", description: "Navigation link" },
      { id: "menu", name: "Menu", description: "Dropdown menu" },
      { id: "pagination", name: "Pagination", description: "Pagination controls" },
      { id: "speed-dial", name: "Speed Dial", description: "Speed dial actions" },
      { id: "stepper", name: "Stepper", description: "Step progress" },
      { id: "tabs", name: "Tabs", description: "Tab navigation" },
    ],
  },
  {
    id: "layout",
    name: "Layout",
    description: "Layout and grid components.",
    components: [
      { id: "box", name: "Box", description: "Box layout" },
      { id: "container", name: "Container", description: "Page container" },
      { id: "grid-legacy", name: "Grid Legacy", description: "Legacy grid" },
      { id: "deprecated", name: "Deprecated", description: "Deprecated layout" },
      { id: "grid", name: "Grid", description: "Grid layout" },
      { id: "stack", name: "Stack", description: "Stack layout" },
      { id: "image-list", name: "Image List", description: "Image grid" },
    ],
  },
  {
    id: "utils",
    name: "Utils",
    description: "Utility components.",
    components: [
      { id: "click-away-listener", name: "Click-Away Listener", description: "Detects clicks outside" },
      { id: "css-baseline", name: "CSS Baseline", description: "CSS reset" },
      { id: "init-color-scheme-script", name: "InitColorSchemeScript", description: "Color scheme script" },
      { id: "modal", name: "Modal", description: "Modal dialog" },
      { id: "no-ssr", name: "No SSR", description: "No server-side rendering" },
      { id: "popover", name: "Popover", description: "Popover overlay" },
      { id: "popper", name: "Popper", description: "Popper positioning" },
      { id: "portal", name: "Portal", description: "Portal rendering" },
      { id: "textarea-autosize", name: "Textarea Autosize", description: "Auto-growing textarea" },
      { id: "transitions", name: "Transitions", description: "Transition effects" },
      { id: "use-media-query", name: "useMediaQuery", description: "Media query hook" },
    ],
  },
  {
    id: "mui-x",
    name: "MUI X",
    description: "Advanced MUI X components.",
    components: [
      { id: "data-grid", name: "Data Grid", description: "Advanced data grid" },
      { id: "date-and-time-pickers", name: "Date and Time Pickers", description: "Date/time pickers" },
      { id: "charts", name: "Charts", description: "Chart components" },
      { id: "tree-view", name: "Tree View", description: "Tree view" },
    ],
  },
];

// Default theme variable structure
const defaultThemeVariable = {
  name: "Default",
  colors: Array(6).fill("#1976d2"),
  textColors: Array(6).fill("#212121"),
  borders: Array(6).fill("1px solid #1976d2"),
  boxShadows: Array(6).fill("0 2px 8px 0 rgba(25,118,210,0.15)"),
  backgrounds: Array(6).fill("#fff"),
  paddings: Array(6).fill("8px"),
  margins: Array(6).fill("8px"),
};

export default function ThemeManagement() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedComponentId, setSelectedComponentId] = useState<string>("");
  const [categorySearch, setCategorySearch] = useState("");
  const [componentSearch, setComponentSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  // Theme variables state (multiple themes)
  const [themeVariables, setThemeVariables] = useState([
    { ...defaultThemeVariable, name: "Default" },
  ]);
  const [selectedThemeVarIndex, setSelectedThemeVarIndex] = useState(0);
  const [newThemeVarName, setNewThemeVarName] = useState("");

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedComponentId("");
    setComponentSearch("");
  };

  const handleComponentSelect = (componentId: string) => {
    setSelectedComponentId(componentId);
  };

  // Get selected category and component objects
  const currentCategory = uiComponentGroups.find((g) => g.id === selectedCategoryId);
  const currentComponent = currentCategory?.components.find((c) => c.id === selectedComponentId);

  // Filtered lists
  const filteredCategories = uiComponentGroups.filter((group) =>
    group.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    group.description.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredComponents =
    currentCategory?.components.filter(
      (comp) =>
        comp.name.toLowerCase().includes(componentSearch.toLowerCase()) ||
        comp.description.toLowerCase().includes(componentSearch.toLowerCase())
    ) || [];

  // Add new theme variable group
  const handleAddThemeVariable = () => {
    if (!newThemeVarName.trim()) return;
    setThemeVariables([
      ...themeVariables,
      { ...defaultThemeVariable, name: newThemeVarName.trim() },
    ]);
    setSelectedThemeVarIndex(themeVariables.length);
    setNewThemeVarName("");
  };

  // Update a value in the selected theme variable group
  const handleThemeVarChange = (
    field: keyof typeof defaultThemeVariable,
    idx: number,
    value: string
  ) => {
    setThemeVariables((prev) =>
      prev.map((themeVar, i) =>
        i === selectedThemeVarIndex
          ? {
              ...themeVar,
              [field]: Array.isArray(themeVar[field])
                ? (themeVar[field] as string[]).map((v: string, j: number) =>
                    j === idx ? value : v
                  )
                : themeVar[field],
            }
          : themeVar
      )
    );
  };

  // Update theme variable group name
  const handleThemeVarNameChange = (value: string) => {
    setThemeVariables((prev) =>
      prev.map((themeVar, i) =>
        i === selectedThemeVarIndex ? { ...themeVar, name: value } : themeVar
      )
    );
  };

  // Tab sections for theme variables
  const themeSections = [
    { label: "Colors", key: "colors" },
    { label: "Text Colors", key: "textColors" },
    { label: "Borders", key: "borders" },
    { label: "Box Shadows", key: "boxShadows" },
    { label: "Backgrounds", key: "backgrounds" },
    { label: "Paddings", key: "paddings" },
    { label: "Margins", key: "margins" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Settings Bar */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Theme Management
        </Typography>
        <IconButton onClick={() => setSettingsOpen(true)} size="large">
          <SettingsIcon />
        </IconButton>
      </Box>

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sx={{ zIndex: 1300 }}
        PaperProps={{ sx: { width: "90vw", maxWidth: 1200, p: 3 } }}
      >
        <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Theme Variables
          </Typography>
          {/* Theme Variable Group Select and Create */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Select
              value={selectedThemeVarIndex}
              onChange={e => setSelectedThemeVarIndex(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 180 }}
            >
              {themeVariables.map((themeVar, idx) => (
                <MenuItem key={themeVar.name + idx} value={idx}>
                  {themeVar.name}
                </MenuItem>
              ))}
            </Select>
            <TextField
              size="small"
              label="New Theme Name"
              value={newThemeVarName}
              onChange={e => setNewThemeVarName(e.target.value)}
              sx={{ minWidth: 160 }}
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddThemeVariable}
              disabled={!newThemeVarName.trim()}
            >
              Create
            </Button>
          </Box>
          {/* Rename selected theme variable */}
          <TextField
            size="small"
            label="Theme Variable Name"
            value={themeVariables[selectedThemeVarIndex]?.name}
            onChange={e => handleThemeVarNameChange(e.target.value)}
            sx={{ mb: 3, minWidth: 220 }}
          />

          {/* Vertical Tabs for theme variable sections */}
          <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
            <Tabs
              orientation="vertical"
              value={tabIndex}
              onChange={(_, v) => setTabIndex(v)}
              sx={{
                borderRight: 1,
                borderColor: "divider",
                minWidth: 160,
                mr: 3,
                height: "100%",
              }}
            >
              {themeSections.map((section, idx) => (
                <Tab key={section.key} label={section.label} />
              ))}
            </Tabs>
            <Box sx={{ flex: 1, overflowY: "auto", pl: 2 }}>
              {tabIndex === 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Colors</Typography>
                  <FormGroup>
                    {themeVariables[selectedThemeVarIndex].colors.map((color, idx) => (
                      <TextField
                        key={idx}
                        label={`Color ${idx + 1}`}
                        type="color"
                        value={color}
                        onChange={e => handleThemeVarChange("colors", idx, e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2, width: 120 }}
                      />
                    ))}
                  </FormGroup>
                </Box>
              )}
              {tabIndex === 1 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Text Colors</Typography>
                  <FormGroup>
                    {themeVariables[selectedThemeVarIndex].textColors.map((color, idx) => (
                      <TextField
                        key={idx}
                        label={`Text ${idx + 1}`}
                        value={color}
                        onChange={e => handleThemeVarChange("textColors", idx, e.target.value)}
                        sx={{ mb: 2, width: 180 }}
                      />
                    ))}
                  </FormGroup>
                </Box>
              )}
              {tabIndex === 2 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Borders</Typography>
                  <FormGroup>
                    {themeVariables[selectedThemeVarIndex].borders.map((border, idx) => (
                      <TextField
                        key={idx}
                        label={`Border ${idx + 1}`}
                        value={border}
                        onChange={e => handleThemeVarChange("borders", idx, e.target.value)}
                        sx={{ mb: 2, width: 220 }}
                      />
                    ))}
                  </FormGroup>
                </Box>
              )}
              {tabIndex === 3 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Box Shadows</Typography>
                  <FormGroup>
                    {themeVariables[selectedThemeVarIndex].boxShadows.map((shadow, idx) => (
                      <TextField
                        key={idx}
                        label={`Box Shadow ${idx + 1}`}
                        value={shadow}
                        onChange={e => handleThemeVarChange("boxShadows", idx, e.target.value)}
                        sx={{ mb: 2, width: 220 }}
                      />
                    ))}
                  </FormGroup>
                </Box>
              )}
              {tabIndex === 4 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Backgrounds</Typography>
                  <FormGroup>
                    {themeVariables[selectedThemeVarIndex].backgrounds.map((bg, idx) => (
                      <TextField
                        key={idx}
                        label={`Background ${idx + 1}`}
                        value={bg}
                        onChange={e => handleThemeVarChange("backgrounds", idx, e.target.value)}
                        sx={{ mb: 2, width: 180 }}
                      />
                    ))}
                  </FormGroup>
                </Box>
              )}
              {tabIndex === 5 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Paddings</Typography>
                  <FormGroup>
                    {themeVariables[selectedThemeVarIndex].paddings.map((pad, idx) => (
                      <TextField
                        key={idx}
                        label={`Padding ${idx + 1}`}
                        value={pad}
                        onChange={e => handleThemeVarChange("paddings", idx, e.target.value)}
                        sx={{ mb: 2, width: 120 }}
                      />
                    ))}
                  </FormGroup>
                </Box>
              )}
              {tabIndex === 6 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Margins</Typography>
                  <FormGroup>
                    {themeVariables[selectedThemeVarIndex].margins.map((mar, idx) => (
                      <TextField
                        key={idx}
                        label={`Margin ${idx + 1}`}
                        value={mar}
                        onChange={e => handleThemeVarChange("margins", idx, e.target.value)}
                        sx={{ mb: 2, width: 120 }}
                      />
                    ))}
                  </FormGroup>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Section 1: Categories */}
        <Paper sx={{ width: 220, minHeight: 500, p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            UI Categories
          </Typography>
          <InputBase
            placeholder="Search category…"
            value={categorySearch}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCategorySearch(e.target.value)}
            sx={{
              mb: 1,
              px: 1,
              py: 0.5,
              bgcolor: "#f5f7fa",
              borderRadius: 1,
              width: "100%",
              fontSize: 14,
            }}
          />
          <Divider sx={{ mb: 1 }} />
          <List>
            {filteredCategories.map((group) => (
              <ListItemButton
                key={group.id}
                selected={selectedCategoryId === group.id}
                onClick={() => handleCategorySelect(group.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: selectedCategoryId === group.id ? "#e3f2fd" : "transparent",
                  transition: "background 0.2s",
                }}
              >
                <ListItemText primary={group.name} secondary={group.description} />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        {/* Section 2: Components in selected category */}
        <Paper sx={{ width: 260, minHeight: 500, p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            {selectedCategoryId ? `${currentCategory?.name} Components` : "Select a Category"}
          </Typography>
          <InputBase
            placeholder="Search component…"
            value={componentSearch}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setComponentSearch(e.target.value)}
            sx={{
              mb: 1,
              px: 1,
              py: 0.5,
              bgcolor: "#f5f7fa",
              borderRadius: 1,
              width: "100%",
              fontSize: 14,
            }}
            disabled={!selectedCategoryId}
          />
          <Divider sx={{ mb: 1 }} />
          {selectedCategoryId ? (
            <List>
              {filteredComponents.map((comp) => (
                <ListItemButton
                  key={comp.id}
                  selected={selectedComponentId === comp.id}
                  onClick={() => handleComponentSelect(comp.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor: selectedComponentId === comp.id ? "#e3f2fd" : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  <ListItemText primary={comp.name} secondary={comp.description} />
                </ListItemButton>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">Choose a category first.</Typography>
          )}
        </Paper>

        {/* Section 3: Themes for selected component */}
        <Paper sx={{ flex: 1, minHeight: 500, p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            {selectedComponentId && currentComponent
              ? `${currentComponent.name} Details`
              : "Theme Details"}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {selectedComponentId && currentComponent ? (
            <Box>
              <Typography variant="h6" sx={{ color: "#1976d2" }}>
                {currentComponent.name}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {currentComponent.description}
              </Typography>
            </Box>
          ) : (
            <Typography color="text.secondary">
              {selectedCategoryId
                ? "Select a component to view details."
                : "Select a category and component to manage."}
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
