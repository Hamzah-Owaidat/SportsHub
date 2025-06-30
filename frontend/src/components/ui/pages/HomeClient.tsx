'use client';
import Link from "next/link";
import { Button } from "lebify-ui";

export default function HomeClient() {
  return (
    <main>
      <section className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to SportsHub
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Your all-in-one platform to book football matches, join exciting tournaments,
          and connect with top academies and referees. Whether you're a casual player,
          a team organizer, or a football academy, SportsHub has everything you need.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="border rounded-2xl shadow-md p-6 bg-gray-50 dark:bg-gray-900 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Book a Match</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Reserve your favorite stadium, pick a time slot, and invite your friends to play.
            Simple, fast, and reliable.
          </p>
          <Link href="/stadiums">
            <Button variant="sea">Find a Stadium</Button>
          </Link>
        </div>

        <div className="border rounded-2xl shadow-md p-6 bg-gray-50 dark:bg-gray-900 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Join a Tournament</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Compete with teams, win prizes, and boost your rankings. Join upcoming
            tournaments or organize your own.
          </p>
          <Link href="/tournaments">
            <Button variant="sun">Explore Tournaments</Button>
          </Link>
        </div>

        <div className="border rounded-2xl shadow-md p-6 bg-gray-50 dark:bg-gray-900 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Discover Academies</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Browse professional football academies near you. Learn, train, and grow
            your skills with the best coaches.
          </p>
          <Link href="/academies">
            <Button variant="mint">Search Academies</Button>
          </Link>
        </div>
      </section>

      <section className="text-center mt-20 max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Why Choose SportsHub?</h3>
        <ul className="text-gray-600 dark:text-gray-400 space-y-2 text-sm">
          <li>✅ Real-time booking and availability</li>
          <li>✅ Seamless tournament registration</li>
          <li>✅ Role-based experience for players, referees, and organizers</li>
          <li>✅ Academy discovery and booking system</li>
          <li>✅ Easy-to-use and mobile-friendly interface</li>
        </ul>
      </section>
    </main>
  );
}
