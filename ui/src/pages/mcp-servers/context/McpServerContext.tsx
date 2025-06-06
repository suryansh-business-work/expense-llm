import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface McpServerContextType {
  servers: any[];
  loading: boolean;
  fetchServers: () => Promise<void>;
  invalidateServers: () => void;
}

const McpServerContext = createContext<McpServerContextType | undefined>(undefined);

export const McpServerProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [invalidateCounter, setInvalidateCounter] = useState(0);

  const fetchServers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/v1/api/mcp-server/list`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const result = await res.json();
      setServers(result.data || []);
    } catch (err) {
      console.error("Error fetching servers:", err);
      setServers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const invalidateServers = useCallback(() => {
    setInvalidateCounter(prev => prev + 1);
  }, []);

  // Add console log to debug
  useEffect(() => {
    console.log("Fetching servers...", invalidateCounter);
    fetchServers();
  }, [fetchServers, invalidateCounter]);

  return (
    <McpServerContext.Provider value={{ servers, loading, fetchServers, invalidateServers }}>
      {children}
    </McpServerContext.Provider>
  );
};

export const useMcpServers = () => {
  const context = useContext(McpServerContext);
  if (context === undefined) {
    throw new Error('useMcpServers must be used within a McpServerProvider');
  }
  return context;
};