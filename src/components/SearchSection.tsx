"use client";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type SearchSectionProps = {
  defaultValue?: string;
};

const SearchSection = ({ defaultValue }: SearchSectionProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [name, setName] = useState(defaultValue || "");

  const handleSearch = () => {
    if (!name.length) {
      router.replace("/");
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set("name", name);
    router.replace(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-col justify-center bg-primary p-8 md:p-12 min-h-[280px] md:min-h-[320px]">
      <div className="container w-full max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-3xl md:text-4xl lg:text-5xl text-primary-foreground font-bold leading-tight">
            O que você deseja aprender hoje?
          </p>
          <p className="text-sm md:text-base text-primary-foreground/80">
            Explore nossa plataforma e encontre o curso perfeito para você
          </p>
        </div>
        
        <div className="flex relative items-center gap-3 bg-background/10 backdrop-blur-sm rounded-lg p-2 border border-primary-foreground/20">
          <Input
            className="flex-1 border-0 bg-transparent placeholder:text-primary-foreground/60 text-primary-foreground font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Busque por um curso..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              e.key == "Enter" && handleSearch();
            }}
          />
          <button
            type="button"
            className="text-primary-foreground hover:text-primary-foreground/80 cursor-pointer p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
            onClick={handleSearch}
            aria-label="Buscar curso"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
