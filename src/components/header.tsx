import { useTheme } from "@/context/themeProvider";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import CitySearch from "./citySearch";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const isDark: boolean = theme === "dark";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur py-2 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-16 flex items-center justify-between px-4">
        <Link to="/">
          <img
            src={isDark ? "/logo.png" : "/logo2.png"}
            alt="logo"
            className="h-14"
          />
        </Link>
        <div className="flex gap-4">
          {/* search */}
          <CitySearch />

          {/* theme toggle */}
          <div
            className={`flex items-center cursor-pointer transition-transform duration-500 ${
              isDark ? "rotate-180" : "rotate-0"
            }`}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <Sun className="size-6 text-yellow-500 rotate-0 transition-all" />
            ) : (
              <Moon className="size-6 text-blue-500 rotate-0 transition-all" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
