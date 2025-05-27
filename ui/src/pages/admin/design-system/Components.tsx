import { ChangeEvent } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  InputBase,
} from "@mui/material";

// UI component groups (categories and components)
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

type ThemeListProps = {
  categorySearch: string;
  componentSearch: string;
  selectedCategoryId: string;
  selectedComponentId: string;
  handleCategorySelect: (id: string) => void;
  handleComponentSelect: (id: string) => void;
  setCategorySearch: (v: string) => void;
  setComponentSearch: (v: string) => void;
};

export default function Components({
  categorySearch,
  componentSearch,
  selectedCategoryId,
  selectedComponentId,
  handleCategorySelect,
  handleComponentSelect,
  setCategorySearch,
  setComponentSearch,
}: ThemeListProps) {
  // Filtered categories based on search
  const filteredCategories = !categorySearch.trim()
    ? uiComponentGroups
    : uiComponentGroups.filter((group) =>
        group.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        group.description.toLowerCase().includes(categorySearch.toLowerCase())
      );

  // Find current category
  const currentCategory = uiComponentGroups.find((group) => group.id === selectedCategoryId);

  // Filtered components based on search and selected category
  const filteredComponents =
    !selectedCategoryId
      ? []
      : (() => {
          const group = uiComponentGroups.find((g) => g.id === selectedCategoryId);
          if (!group) return [];
          if (!componentSearch.trim()) return group.components;
          return group.components.filter(
            (comp) =>
              comp.name.toLowerCase().includes(componentSearch.toLowerCase()) ||
              comp.description.toLowerCase().includes(componentSearch.toLowerCase())
          );
        })();

  // Find current component
  const currentComponent =
    !selectedCategoryId || !selectedComponentId
      ? null
      : (() => {
          const group = uiComponentGroups.find((g) => g.id === selectedCategoryId);
          if (!group) return null;
          return group.components.find((c) => c.id === selectedComponentId) || null;
        })();

  return (
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
  );
}
