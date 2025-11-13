"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Templates", href: "/#templates" },
    { name: "Verify Proof", href: "/verify-proof" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zk-darker/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-3xl font-bold text-zk-primary">ᚱ</div>
            <h1 className="text-2xl font-hatton text-white">zkRune</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-zk-gray hover:text-zk-primary transition-colors uppercase tracking-wider"
              >
                {item.name}
              </a>
            ))}
            <a
              href="https://github.com/louisstein94/zkrune"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zk-gray hover:text-zk-primary transition-colors uppercase tracking-wider"
            >
              GitHub
            </a>
          </nav>

          {/* CTA Button */}
          <Link
            href="#templates"
            className="hidden md:block px-6 py-2 bg-zk-primary text-zk-darker font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105"
          >
            Start Building
          </Link>

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
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-zk-gray hover:text-zk-primary transition-colors uppercase tracking-wider py-2"
              >
                {item.name}
              </a>
            ))}
            <a
              href="https://github.com/louisstein94/zkrune"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zk-gray hover:text-zk-primary transition-colors uppercase tracking-wider py-2"
            >
              GitHub
            </a>
            <Link
              href="#templates"
              onClick={() => setIsOpen(false)}
              className="mt-2 px-6 py-2 bg-zk-primary text-zk-darker font-medium rounded-full text-center"
            >
              Start Building
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

