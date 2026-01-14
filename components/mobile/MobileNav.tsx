"use client";

/**
 * Mobile-optimized navigation
 */

import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'Templates', href: '/templates', icon: '' },
    { label: 'Builder', href: '/builder', icon: '' },
    { label: 'Zcash', href: '/zcash', icon: '' },
    { label: 'Docs', href: '/docs', icon: '' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 right-6 z-50 p-3 bg-zk-dark border border-zk-primary/30 rounded-xl hover:bg-zk-primary/10 transition-all"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span
            className={`block h-0.5 bg-zk-primary transition-all duration-300 ${
              isOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block h-0.5 bg-zk-primary transition-all duration-300 ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 bg-zk-primary transition-all duration-300 ${
              isOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <nav
        className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-zk-darker border-l border-zk-gray/20 z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-zk-gray/20">
          <div className="flex items-center gap-3">
            <span className="text-3xl">ᚱ</span>
            <div>
              <h2 className="text-xl font-hatton text-white">zkRune</h2>
              <p className="text-xs text-zk-gray">Zero-Knowledge Proofs</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-zk-primary/10 border border-transparent hover:border-zk-primary/30 transition-all group"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-white font-medium group-hover:text-zk-primary transition-colors">
                  {item.label}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-zk-gray group-hover:text-zk-primary transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-zk-gray/20">
          <a
            href="https://github.com/louisstein94/zkrune"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 bg-zk-primary/10 border border-zk-primary/30 rounded-xl hover:bg-zk-primary/20 transition-all"
          >
            <svg className="w-5 h-5 text-zk-primary" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="text-zk-primary font-medium">View on GitHub</span>
          </a>
        </div>
      </nav>
    </>
  );
}

