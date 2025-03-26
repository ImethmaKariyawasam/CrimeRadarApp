import React from 'react';
import { MapPin, HeartHandshake, UserSearch, Newspaper, AlertTriangle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <header className="bg-blue-700 dark:bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">CrimeRadar</h1>
          <p className="text-xl mb-8">Stay informed, stay safe. Real-time crime monitoring and community support.</p>
          <button className="bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
            Get Started
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-800">
            <MapPin className="h-8 w-8 text-blue-700 dark:text-blue-400 mb-2" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Real-Time Crime Map</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Interactive map showing criminal activities in your area as they happen
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-800">
            <HeartHandshake className="h-8 w-8 text-blue-700 dark:text-blue-400 mb-2" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Community Support</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect with local support services and community resources
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-800">
            <UserSearch className="h-8 w-8 text-blue-700 dark:text-blue-400 mb-2" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Missing Persons</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Updates on missing person cases and wanted notices
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-800">
            <Newspaper className="h-8 w-8 text-blue-700 dark:text-blue-400 mb-2" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Awareness Articles</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Educational content on safety, prevention, and community awareness
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gray-200 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <AlertTriangle className="h-12 w-12 text-blue-700 dark:text-blue-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Stay Alert, Stay Safe</h2>
          <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">Join our community to receive real-time alerts and contribute to a safer neighborhood.</p>
          <button className="bg-blue-700 dark:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 dark:hover:bg-blue-700 transition-colors">
            Join Now
          </button>
        </div>
      </section>

    </div>
  );
}