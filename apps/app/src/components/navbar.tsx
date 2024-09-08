import { Button } from "@repo/ui";
import { MenuIcon, Package, SettingsIcon, XIcon, LogOut } from "lucide-react";
import { useSpring, animated } from "@react-spring/web";
import { useState } from "react";
import { useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { client } from "@repo/front-logic";

const NavContent = ({
  setIsOpen,
  pathname,
  handleLogout,
}: {
  setIsOpen: (isOpen: boolean) => void;
  pathname: string;
  handleLogout: () => void;
}) => {
  const selectedStyle =
    "bg-accent text-white hover:text-white/90 hover:bg-accent/90 rounded-lg transition-colors duration-300";
  return (
    <>
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold xl:hidden">Menu</h1>
        <h1 className="text-2xl font-bold hidden xl:block">
          <Link to="/">SaaS Name</Link>
        </h1>
        <Button
          variant="ghost"
          className="hover:bg-transparent hover:text-black/50 xl:hidden"
          onClick={() => setIsOpen(false)}
        >
          <XIcon className="w-6 h-6" />
        </Button>
      </div>
      <ul className="p-2 flex-grow">
        <li className="py-2">
          <Link
            to="/"
            className={`text-gray-700 hover:text-gray-900 flex items-center gap-2 px-4 py-2 ${
              pathname === "/" ? selectedStyle : ""
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Package className="w-4 h-4" />
            Mes produits suivis
          </Link>
        </li>
        <li className="py-2">
          <Link
            // to="/settings"
            onClick={() => setIsOpen(false)}
            className={`text-gray-700 hover:text-gray-900 flex items-center gap-2 px-4 py-2 ${
              pathname === "/settings" ? selectedStyle : ""
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            Paramètres
          </Link>
        </li>
      </ul>
      <div className="p-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full hover:text-red-600 flex items-center gap-2 text-red-500 hover:bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </Button>
      </div>
    </>
  );
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const animationNavbar = useSpring({
    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
    config: { tension: 300, friction: 30 },
  });

  const animationBackground = useSpring({
    opacity: isOpen ? 1 : 0,
    config: { tension: 300, friction: 30 },
  });

  const handleLogout = async () => {
    await client.auth.logout.$post();
    navigate({ to: "/login" });
  };

  const {
    location: { pathname },
  } = useRouterState();

  return (
    <>
      <div className="xl:hidden top-0 left-0 w-screen border-b border-accent/20 h-16 flex items-center px-4 justify-start bg-white">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          className="hover:bg-transparent hover:text-black/50 pl-0"
        >
          <MenuIcon className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">SaaS Name</h1>
      </div>
      <div className="hidden xl:flex h-screen w-64 bg-white shadow-lg flex-col fixed left-0 top-0">
        <NavContent
          setIsOpen={setIsOpen}
          pathname={pathname}
          handleLogout={handleLogout}
        />
      </div>
      <animated.div
        style={animationBackground}
        className={`xl:hidden fixed inset-0 bg-black bg-opacity-30 ${
          isOpen ? "z-10" : "-z-10"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <animated.nav
          style={animationNavbar}
          className="h-screen w-64 bg-white shadow-lg flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <NavContent
            setIsOpen={setIsOpen}
            pathname={pathname}
            handleLogout={handleLogout}
          />
        </animated.nav>
      </animated.div>
    </>
  );
};
