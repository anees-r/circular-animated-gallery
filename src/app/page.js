'use client';
import Link from "next/link";
import Gallery from './components/Gallery';

export default function Home() {
  return (
    <main>
      <nav>
        <Link href="/">DNYSUS</Link>
        <p>Contact Here!</p>
      </nav>

      <Gallery />

      <footer>
        <p>Test Animation</p>
        <p>Made by anees-r</p>
      </footer>
    </main>
  );
}
