import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Wordmark } from "@/components/brand/Brand";
import { Container } from "@/components/editorial/Editorial";
import { primaryNav } from "@/config/navigation";
import { brand } from "@/config/brand";
import { cx } from "@/lib/format";

export function Navbar({ onSearch }: { onSearch: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const links = primaryNav.filter((n) => n.to !== "/my-apex");

  return (
    <>
      <header
        className={cx(
          "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300",
          scrolled || menuOpen ? "border-line bg-ink/90 backdrop-blur-md" : "border-transparent bg-ink/40 backdrop-blur-[2px]",
        )}
      >
        <Container className="flex h-16 items-center gap-6">
          <Link to="/" className="shrink-0 text-[1.35rem] text-paper" aria-label={`${brand.name} — página inicial`}>
            <Wordmark />
          </Link>

          <nav aria-label="Principal" className="hidden flex-1 items-center justify-center lg:flex">
            <ul className="flex items-center">
              {links.map((item) => (
                <li key={item.to} className={item.to === "/" ? "hidden xl:block" : undefined}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cx(
                        "relative block px-2.5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors xl:px-3.5",
                        isActive ? "text-paper" : "text-mist hover:text-paper",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        <span className={cx("absolute inset-x-2.5 -bottom-[15px] h-px bg-apex transition-transform duration-300 xl:inset-x-3.5", isActive ? "scale-x-100" : "scale-x-0")} />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <button
              type="button"
              onClick={onSearch}
              className="group inline-flex h-10 items-center gap-3 border border-line px-3 text-mist transition-colors hover:border-line-strong hover:text-paper"
              aria-label="Abrir busca global"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.12em] sm:inline">Buscar</span>
              <kbd className="hidden border border-line px-1.5 py-0.5 font-mono text-[0.6rem] text-mist md:inline">⌘K</kbd>
            </button>
            <NavLink
              to="/my-apex"
              className={({ isActive }) =>
                cx(
                  "hidden h-10 items-center border px-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] transition-colors lg:inline-flex",
                  isActive ? "border-apex/60 text-paper" : "border-line text-mist hover:border-line-strong hover:text-paper",
                )
              }
            >
              My Apex
            </NavLink>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center text-paper lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </Container>
      </header>

      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto bg-ink lg:hidden"
      >
        <nav aria-label="Menu móvel" className="animate-fade">
          <ul className="border-t border-line">
            {primaryNav.map((item, i) => (
              <li key={item.to} className="border-b border-line" style={{ animation: `rise 0.5s ${i * 35}ms both var(--ease-out-quint)` }}>
                <NavLink to={item.to} end={item.to === "/"} className="group flex items-baseline gap-4 px-4 py-4 sm:px-6">
                  {({ isActive }) => (
                    <>
                      <span className={cx("font-mono text-[0.68rem]", isActive ? "text-apex-ink" : "text-mist")}>{item.code}</span>
                      <span className="flex-1">
                        <span className={cx("display-condensed block text-[2rem]", isActive ? "text-paper" : "text-silver group-hover:text-paper")}>{item.label}</span>
                        <span className="mt-1 block text-xs text-mist">{item.description}</span>
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
