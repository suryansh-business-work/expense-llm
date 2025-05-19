import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const USER_KEY = "user";
const DEFAULT_PROFILE_PIC = "/default-profile.png";
const DEFAULT_TIMEZONE = "Asia/Kolkata";

export interface UserContextType {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  timezone?: string;
  profileImage?: string;
  [key: string]: any;
}

const defaultUser: UserContextType = {
  timezone: DEFAULT_TIMEZONE,
  profileImage: DEFAULT_PROFILE_PIC,
};

const UserContext = createContext<{
  user: UserContextType;
  setUser: (u: Partial<UserContextType>) => void;
}>({
  user: defaultUser,
  setUser: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserContextType>(() => {
    const stored = localStorage.getItem(USER_KEY);
    let userObj: UserContextType = stored ? JSON.parse(stored) : {};
    if (!userObj.timezone) userObj.timezone = DEFAULT_TIMEZONE;
    if (!userObj.profileImage) userObj.profileImage = DEFAULT_PROFILE_PIC;
    return userObj;
  });

  // Update localStorage and state
  const setUser = useCallback((updateObj: Partial<UserContextType>) => {
    setUserState((prev) => {
      const updated = { ...prev, ...updateObj };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Listen for localStorage changes (multi-tab support)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === USER_KEY && e.newValue) {
        setUserState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUserContext() {
  return useContext(UserContext);
}
