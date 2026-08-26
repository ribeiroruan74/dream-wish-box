import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Profile = {
  name: string;
  email: string;
  avatar: string;
};

const STORAGE_KEY = "wishlist-profile";

type ProfileContextValue = {
  profile: Profile | null;
  hydrated: boolean;
  login: (profile: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  logout: () => void;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setProfile(JSON.parse(raw) as Profile);
      } catch {
        // ignore corrupt local data
      }
    }
    setHydrated(true);
  }, []);

  const persist = (next: Profile | null) => {
    setProfile(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = (next: Profile) => persist(next);
  const updateProfile = (patch: Partial<Profile>) => {
    setProfile((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };
  const logout = () => persist(null);

  return (
    <ProfileContext.Provider value={{ profile, hydrated, login, updateProfile, logout }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
