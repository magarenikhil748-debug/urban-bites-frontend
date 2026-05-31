"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      animate={{ width: focused ? "100%" : "44px" }}
      transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
      className={`relative flex items-center overflow-hidden rounded-full border transition-colors duration-200 ${
        focused || value
          ? "bg-zinc-800 border-amber-500/60 w-full"
          : "bg-zinc-800 border-zinc-700 cursor-pointer"
      }`}
      onClick={() => {
        if (!focused) {
          setFocused(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      }}
    >
      <div className="flex items-center justify-center w-11 h-9 shrink-0">
        <Search
          className={`w-4 h-4 transition-colors ${
            focused ? "text-amber-400" : "text-zinc-400"
          }`}
        />
      </div>

      <AnimatePresence>
        {(focused || value) && (
          <motion.input
            ref={inputRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              if (!value) setFocused(false);
            }}
            placeholder="Search dishes..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-500 pr-2"
            autoFocus
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              inputRef.current?.focus();
            }}
            className="flex items-center justify-center w-7 h-7 mr-1 rounded-full bg-zinc-700 hover:bg-zinc-600 shrink-0"
          >
            <X className="w-3 h-3 text-zinc-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
