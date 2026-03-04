import { useState, useEffect, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Municipio {
  id: number;
  nome: string;
}

let cachedCities: Municipio[] | null = null;
let fetchPromise: Promise<Municipio[]> | null = null;

const fetchCities = (): Promise<Municipio[]> => {
  if (cachedCities) return Promise.resolve(cachedCities);
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome")
    .then((res) => res.json())
    .then((data: Municipio[]) => {
      cachedCities = data;
      return data;
    })
    .catch(() => {
      fetchPromise = null;
      return [];
    });
  return fetchPromise;
};

interface CitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  hasError?: boolean;
}

const CitySelect = ({ value, onValueChange, className, placeholder = "Selecione a cidade", hasError }: CitySelectProps) => {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<Municipio[]>(cachedCities || []);
  const [loading, setLoading] = useState(!cachedCities);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!cachedCities) {
      setLoading(true);
      fetchCities().then((data) => {
        setCities(data);
        setLoading(false);
      });
    }
  }, []);

  const filtered = useMemo(() => {
    if (!search) return cities.slice(0, 100);
    const s = search.toLowerCase();
    return cities.filter((c) => c.nome.toLowerCase().includes(s)).slice(0, 100);
  }, [cities, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            hasError && "border-destructive",
            className
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</span>
          ) : (
            value || placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar cidade..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Carregando cidades..." : "Nenhuma cidade encontrada."}
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.nome}
                  onSelect={() => {
                    onValueChange(city.nome);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === city.nome ? "opacity-100" : "opacity-0")} />
                  {city.nome}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CitySelect;
