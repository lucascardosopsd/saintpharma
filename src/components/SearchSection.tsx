"use client";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const SearchSection = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState("");

  const handleSearch = () => {
    if (!title.length) {
      router.replace("/");
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set("title", title);
    router.replace(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-col  justify-center bg-primary p-5 h-[300px] gap-10">
      <p className="text-5xl text-background font-semibold">
        O que você deseja aprender hoje?
      </p>
      <div className="flex relative items-center">
        <Input
          className="border-background border-0 rounded-none border-b placeholder:text-background font-semibold placeholder:font-normal"
          placeholder="Busque por um curso"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            e.key == "Enter" && handleSearch();
          }}
        />

        <div className="text-background cursor-pointer" onClick={handleSearch}>
          <Search />
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
