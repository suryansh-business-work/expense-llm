import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from "react";

// Interfaces (moved from ToolLaboratory.tsx)
export interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface ApiToolParameter {
  paramName: string;
  paramType: string;
}

export interface Tool {
  toolId: string;
  toolName: string;
  toolDescription: string;
  mcpServerId: string;
  createdAt: string;
  updatedAt: string;
  toolStatus: "active" | "inactive" | "draft";
  toolType: string;
  toolCode: {
    nodejs?: string;
    python?: string;
  };
  toolParams: ToolParameter[];
}

interface ToolContextType {
  // Tool data
  tool: Tool | null;
  loading: boolean;
  error: string | null;
  serverName: string;
  toolName: string;
  setToolName: (name: string) => void;
  toolDescription: string;
  setToolDescription: (desc: string) => void;
  toolParameters: ToolParameter[];
  setToolParameters: (params: ToolParameter[]) => void;
  
  // Code related
  language: "nodejs" | "python";
  setLanguage: (lang: "nodejs" | "python") => void;
  code: { nodejs: string; python: string };
  setCode: React.Dispatch<React.SetStateAction<{ nodejs: string; python: string }>>;
  
  // State flags
  isDirty: boolean;
  setIsDirty: (isDirty: boolean) => void;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  
  // Functions
  handleSave: () => Promise<void>;
  handleAddParameter: () => void;
  handleRemoveParameter: (index: number) => void;
  handleParameterChange: (index: number, field: keyof ToolParameter, value: any) => void;
  handleCodeChange: (value: string | undefined) => void;
  generateCodeWithComments: (tool: { toolName: string; toolDescription: string; toolParams: ToolParameter[]; }, language: "nodejs" | "python") => string;
}

const ToolContext = createContext<ToolContextType | undefined>(undefined);

export const useToolContext = () => {
  const context = useContext(ToolContext);
  if (context === undefined) {
    throw new Error("useToolContext must be used within a ToolProvider");
  }
  return context;
};

interface ToolProviderProps {
  children: ReactNode;
  mcpServerId: string;
  toolId: string;
}

export const ToolProvider: React.FC<ToolProviderProps> = ({ children, mcpServerId, toolId }) => {
  // State
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverName, setServerName] = useState<string>("");
  const [language, setLanguage] = useState<"nodejs" | "python">("nodejs");
  const [code, setCode] = useState<{ nodejs: string; python: string }>({
    nodejs: "",
    python: ""
  });
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [toolParameters, setToolParameters] = useState<ToolParameter[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Generate code with comments
  const generateCodeWithComments = (tool: {
    toolName: string;
    toolDescription: string;
    toolParams: ToolParameter[];
  }, language: 'nodejs' | 'python') => {
    
    if (language === 'nodejs') {
      // Generate Node.js code with comments
      let paramDocs = '';
      let accessExample = '// Access parameters like:';
      
      if (tool.toolParams && tool.toolParams.length > 0) {
        paramDocs = '/**\n' + 
          tool.toolParams.map(param => ` * @param {${param.type}} ${param.name} - ${param.description || 'No description'}`).join('\n') +
          '\n */\n';
        
        // Generate examples for each parameter
        accessExample = tool.toolParams.map(param => 
          `// Access parameter: params.${param.name} (${param.type})`
        ).join('\n');
      }
      
      return `/**
   * ${tool.toolName}
   * ${tool.toolDescription}
   * 
   * @author MCP Tool
   */
  
  ${paramDocs}module.exports = async function(params) {
    ${accessExample}
    
    // Your tool implementation
    console.log('Tool executed with params:', params);
    
    // Return your result
    return {
      result: "Hello from MCP tool!"
    };
  };
  
  /* 
   * Package dependencies:
   * No additional packages required for basic functionality.
   * 
   * For HTTP requests: npm install axios
   * For file operations: Node.js built-in 'fs' module
   * For database access: npm install mongoose (MongoDB) or npm install pg (PostgreSQL)
   */`;
    } else { // Python code generation
      // Generate Python code with comments
      let paramDocs = '';
      let accessExample: any = [];
      
      if (tool.toolParams && tool.toolParams.length > 0) {
        paramDocs = tool.toolParams.map(param => 
          `:param ${param.name}: ${param.description || 'No description'} (${param.type})`
        ).join('\n');
        
        // Generate examples for each parameter
        accessExample = tool.toolParams.map(param => 
          `    # Access parameter: params["${param.name}"] (${param.type})`
        );
      }
      
      return `"""
  ${tool.toolName}
  ${tool.toolDescription}
  
  ${paramDocs}
  """
  
  def main(params):
      """
      Main entry point for the tool
      
      Args:
          params: Dictionary containing input parameters
      
      Returns:
          Dictionary with results
      """
  ${accessExample.join('\n')}
      
      # Your tool implementation
      print("Tool executed with params:", params)
      
      # Return your result
      return {
          "result": "Hello from MCP tool!"
      }
  
  # Package dependencies:
  # No additional packages required for basic functionality.
  #
  # For HTTP requests: pip install requests
  # For data processing: pip install pandas numpy
  # For machine learning: pip install scikit-learn
  `;
    }
  };

  // Fetch tool data
  const fetchToolData = useCallback(async () => {
    if (!toolId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      // Fetch server name first
      const serverRes = await fetch(`http://localhost:3000/v1/api/mcp-server/get/${mcpServerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      
      if (serverRes.ok) {
        const serverData = await serverRes.json();
        if (serverData.status === "success") {
          setServerName(serverData.data?.mcpServerName || "Unknown Server");
        }
      }
      
      // Fetch tool data
      const toolRes = await fetch(`http://localhost:3000/v1/api/mcp-server/tool/get/${toolId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!toolRes.ok) {
        throw new Error(`Server responded with status: ${toolRes.status}`);
      }
      
      const result = await toolRes.json();
      
      if (result.status === "success") {
        const toolData = result.data;
        setTool(toolData);
        
        // Initialize form values
        setToolName(toolData.toolName || "");
        setToolDescription(toolData.toolDescription || "");
        
        // Map API parameter structure to our component structure
        let mappedParams: ToolParameter[] = [];
        if (Array.isArray(toolData.toolParams)) {
          mappedParams = toolData.toolParams.map((param: ApiToolParameter) => ({
            name: param.paramName || "",
            type: param.paramType || "string",
            description: "", // Default empty as it's not in API
            required: true   // Default to required as it's not in API
          }));
          
          setToolParameters(mappedParams);
        } else {
          setToolParameters([]);
        }
        
        // Generate code with tool information comments
        const toolInfo = {
          toolName: toolData.toolName || "Unnamed Tool",
          toolDescription: toolData.toolDescription || "No description provided",
          toolParams: mappedParams
        };
        
        // Check if code exists in the response, otherwise generate code with comments
        const nodeCode = toolData.toolCode?.nodejs || generateCodeWithComments(toolInfo, 'nodejs');
        const pythonCode = toolData.toolCode?.python || generateCodeWithComments(toolInfo, 'python');
        
        setCode({
          nodejs: nodeCode,
          python: pythonCode
        });
        
        // Set default language
        if (toolData.toolCode?.python && !toolData.toolCode?.nodejs) {
          setLanguage("python");
        }
        
      } else {
        setError(result.message || "Failed to load tool data");
      }
    } catch (err: any) {
      console.error("Error fetching tool:", err);
      setError(err.message || "An error occurred while fetching the tool");
    } finally {
      setLoading(false);
    }
  }, [mcpServerId, toolId]);

  // Handle save
  const handleSave = async () => {
    if (!toolId || !mcpServerId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      // Map our parameters back to API format
      const apiParams = toolParameters.map(param => ({
        paramName: param.name,
        paramType: param.type
      }));
      
      const payload = {
        toolName,
        toolDescription,
        toolParams: apiParams,
        toolCode: code
      };
      
      const res = await fetch(`http://localhost:3000/v1/api/mcp-server/tool/update/${toolId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const result = await res.json();
      
      if (result.status === "success") {
        setSaveSuccess(true);
        setIsDirty(false);
        // Refresh data to get latest changes
        fetchToolData();
      } else {
        setSaveError(result.message || "Failed to save tool");
      }
    } catch (err: any) {
      console.error("Error saving tool:", err);
      setSaveError(err.message || "An error occurred while saving the tool");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle parameter change
  const handleParameterChange = (index: number, field: keyof ToolParameter, value: any) => {
    const updatedParams = [...toolParameters];
    updatedParams[index] = { ...updatedParams[index], [field]: value };
    setToolParameters(updatedParams);
    setIsDirty(true);
  };

  // Add parameter
  const handleAddParameter = () => {
    setToolParameters([
      ...toolParameters,
      { name: "", type: "string", description: "", required: false }
    ]);
    setIsDirty(true);
  };

  // Remove parameter
  const handleRemoveParameter = (index: number) => {
    setToolParameters(toolParameters.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // Handle code change
  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(prevCode => ({
        ...prevCode,
        [language]: value
      }));
      setIsDirty(true);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchToolData();
  }, [fetchToolData]);

  return (
    <ToolContext.Provider
      value={{
        tool,
        loading,
        error,
        serverName,
        toolName,
        setToolName,
        toolDescription,
        setToolDescription,
        toolParameters,
        setToolParameters,
        language,
        setLanguage,
        code,
        setCode,
        isDirty,
        setIsDirty,
        isSaving,
        saveError,
        saveSuccess,
        handleSave,
        handleAddParameter,
        handleRemoveParameter,
        handleParameterChange,
        handleCodeChange,
        generateCodeWithComments
      }}
    >
      {children}
    </ToolContext.Provider>
  );
};

export default ToolProvider;