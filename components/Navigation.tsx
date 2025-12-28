"use client";

import { useState } from "react";
import Link from "next/link";

interface NavSubItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  submenu?: NavSubItem[];
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [tokenMenuOpen, setTokenMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "Templates", href: "/templates" },
    { name: "Builder", href: "/builder" },
    { 
      name: "Token", 
      href: "#",
      submenu: [
        { name: "Governance", href: "/governance" },
        { name: "Premium", href: "/premium" },
        { name: "Marketplace", href: "/marketplace" },
        { name: "Staking", href: "/staking" },
        { name: "Wallet", href: "/wallet" },
      ]
    },
    { name: "Docs", href: "/docs" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zk-darker/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/zkrune-log.png" 
              alt="zkRune Logo" 
              className="h-10 w-auto"
            />
            <h1 className="text-2xl font-hatton text-white">zkRune</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              item.submenu ? (
                <div 
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setTokenMenuOpen(true)}
                  onMouseLeave={() => setTokenMenuOpen(false)}
                >
                  <button className="text-sm font-medium text-zk-gray hover:text-zk-primary transition-colors uppercase tracking-wider flex items-center gap-1">
                    {item.name}
                    <svg className={`w-4 h-4 transition-transform ${tokenMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {tokenMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-zk-dark/95 backdrop-blur-lg border border-zk-primary/20 rounded-xl shadow-xl overflow-hidden">
                      {item.submenu.map((subitem) => (
                        <a
                          key={subitem.name}
                          href={subitem.href}
                          className="block px-4 py-3 text-sm text-zk-gray hover:text-zk-primary hover:bg-zk-primary/10 transition-colors"
                        >
                          {subitem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-zk-gray hover:text-zk-primary transition-colors uppercase tracking-wider"
                >
                  {item.name}
                </a>
              )
            ))}
            
            {/* Zcash Highlighted Link */}
            <a
              href="/zcash"
              className="flex items-center gap-2 px-4 py-2 bg-[#F4B728]/10 border border-[#F4B728]/30 rounded-lg text-[#F4B728] hover:bg-[#F4B728]/20 transition-all text-sm font-bold uppercase tracking-wider"
            >
              <img src="/zcash-logo.png" alt="Zcash" className="w-4 h-4" />
              Zcash
            </a>
          </nav>

          {/* Right Side - Icons + CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Icon Links */}
            <div className="flex items-center gap-3 pr-4 border-r border-zk-gray/20">
              <a
                href="https://github.com/louisstein94/zkrune"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-zk-gray hover:text-zk-primary transition-colors"
                title="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://x.com/rune_zk"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-zk-gray hover:text-zk-primary transition-colors"
                title="zkRune on X"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
            
            {/* CTA Button */}
            <Link
              href="/templates"
              className="px-6 py-2 bg-zk-primary text-zk-darker font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105"
            >
              Try Templates
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full bg-current transition-transform ${
                  isOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-current transition-opacity ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-current transition-transform ${
                  isOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="md:hidden pt-4 pb-2 flex flex-col gap-3">
            {navItems.map((item) => (
              item.submenu ? (
                <div key={item.name}>
                  <button
                    onClick={() => setTokenMenuOpen(!tokenMenuOpen)}
                    className="w-full text-left text-sm font-medium text-zk-gray hover:text-zk-primary transition-colors uppercase tracking-wider py-2 flex items-center justify-between"
                  >
                    {item.name}
                    <svg className={`w-4 h-4 transition-transform ${tokenMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {tokenMenuOpen && (
                    <div className="pl-4 space-y-2 mt-2">
                      {item.submenu.map((subitem) => (
                        <a
                          key={subitem.name}
                          href={subitem.href}
                          onClick={() => {
                            setIsOpen(false);
                            setTokenMenuOpen(false);
                          }}
                          className="block text-sm text-zk-gray hover:text-zk-primary transition-colors py-2"
                        >
                          {subitem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-zk-gray hover:text-zk-primary transition-colors uppercase tracking-wider py-2"
                >
                  {item.name}
                </a>
              )
            ))}
            <a
              href="/zcash"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-[#F4B728] hover:text-[#F4B728]/80 transition-colors uppercase tracking-wider py-2"
            >
              Zcash Integration
            </a>
            <a
              href="https://github.com/louisstein94/zkrune"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zk-gray hover:text-zk-primary transition-colors uppercase tracking-wider py-2"
            >
              GitHub
            </a>
            <Link
              href="/templates"
              onClick={() => setIsOpen(false)}
              className="mt-2 px-6 py-2 bg-zk-primary text-zk-darker font-medium rounded-full text-center"
            >
              Try Templates
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

