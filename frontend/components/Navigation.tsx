'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Navigation = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const linkClasses = (path: string) =>
    `block text-center font-pixelify-sans uppercase tracking-widest py-4 px-8 text-sm sm:text-lg transition-all duration-200 hover:bg-[#7200007b] hover:text-white hover:shadow-lg ${
      isActive(path) ? 'bg-[#7200007b] text-white shadow-lg' : 'text-[#720000]'
    }`;

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('themesong.mp3');
      audioRef.current.loop = true;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <header className="top-0 left-0 w-full bg-[#f5f5f572] z-50">
      <nav className="flex flex-col sm:flex-row justify-center items-center">
        <ul className="list-none flex flex-col sm:flex-row">

          <li className="hidden sm:block">
            <Link href="/" className={linkClasses('/')}>
              Home
            </Link>
          </li>
          <li className="hidden sm:block">
            <Link href="/pokemon" className={linkClasses('/about')}>
              Pokédex
            </Link>
          </li>

          <li onClick={toggleAudio} className="sm:block py-4 px-8 cursor-pointer">
            <Image
              src={isPlaying ? '/pokeball-open.png' : '/pokeball.png'}
              alt="Pokeball"
              width={20}
              height={20}
              className="w-5 h-5 sm:w-7 sm:h-7 transition-transform transform hover:scale-110"
            />
          </li>

          <li className="hidden sm:block">
            <Link href="/contact" className={linkClasses('/projects')}>
              Contact
            </Link>
          </li>
          <li className="hidden sm:block">
            <Link href="/admin" className={linkClasses('/contact')}>
              Admin
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navigation;
