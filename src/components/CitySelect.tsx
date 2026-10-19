import { createContext, useContext, useState, type ReactNode } from "react";
import { CITIES } from "@/lib/movies";

const Ctx = createContext<{ city: string; setCity: (c: string) => void }>({ city: "Mumbai", setCity: () => {} });

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState("Mumbai");
  return <Ctx.Provider value={{ city, setCity }}>{children}</Ctx.Provider>;
}

export const useCity = () => useContext(Ctx);

export function CitySelect() {
  const { city, setCity } = useCity();
  return (
    <select
      aria-label="Choose your city"
      value={city}
      onChange={(e) => setCity(e.target.value)}
      className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground"
    >
      {CITIES.map((c) => (
        <option key={c}>{c}</option>
      ))}
    </select>
  );
}
