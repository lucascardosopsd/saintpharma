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
    <div className="flex flex-col  justify-center bg-primary p-5 h-[300px] gap-10">
      <div className="w-full max-w-[500px] mx-auto">
        <p className="text-4xl text-background font-semibold">
          O que você deseja aprender hoje?
        </p>
        <div className="flex relative items-center">
          <Input
            className="border-background border-0 rounded-none border-b placeholder:text-background font-semibold placeholder:font-normal"
            placeholder="Busque por um curso"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              e.key == "Enter" && handleSearch();
            }}
          />

          <div
            className="text-background cursor-pointer"
            onClick={handleSearch}
          >
            <Search />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
