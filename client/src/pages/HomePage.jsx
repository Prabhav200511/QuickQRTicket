import React from 'react';
import { TicketCheck, Users, CalendarPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-center animate-fade-in">
      {/* Hero Section */}
      <section className="w-full py-16 px-4 bg-base-200 dark:bg-base-300 transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-4 tracking-tight drop-shadow">
            QuickTicket
          </h1>
          <p className="text-xl md:text-2xl text-base-content opacity-90 font-medium mb-8 max-w-2xl mx-auto">
            The new standard for seamless ticketing.
            <br />
            Host events, sell tickets, and enjoy instant QR entry in a modern,
            secure, and beautiful experience—built for both organizers and attendees.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
            {/* Only non-hosts see events link */}
            {(!user || user.role === 'customer') && (
              <Link
                to="/events"
                className="btn btn-primary btn-lg rounded-full shadow-md"
                aria-label="Discover Events"
              >
                Discover Events
              </Link>
            )}
            {/* Only hosts see dashboard link */}
            {user && user.role === 'host' && (
              <Link
                to="/dashboard/host"
                className="btn btn-primary btn-lg rounded-full shadow-md"
                aria-label="Go to Dashboard"
              >
                Go to Dashboard
              </Link>
            )}
            <Link
              to="/signup"
              className="btn btn-accent btn-lg rounded-full shadow-md"
              aria-label="Get Started"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-base-100 dark:bg-base-200 py-14 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Host Events Feature */}
          <div className="bg-base-200 dark:bg-base-300 rounded-xl p-8 flex flex-col items-center shadow-md hover:scale-105 transition-all duration-300">
            <CalendarPlus className="w-10 h-10 mb-2 text-primary" />
            <h3 className="text-xl font-bold mb-2 text-primary">Host & Manage Events</h3>
            <p className="text-base text-base-content opacity-80">
              Flexible scheduling, real-time capacity control, and instant ticket sales—all managed from your dashboard.
            </p>
          </div>
          {/* Effortless QR Tickets Feature */}
          <div className="bg-base-200 dark:bg-base-300 rounded-xl p-8 flex flex-col items-center shadow-md hover:scale-105 transition-all duration-300">
            <TicketCheck className="w-10 h-10 mb-2 text-success" />
            <h3 className="text-xl font-bold mb-2 text-success">Effortless QR Tickets</h3>
            <p className="text-base text-base-content opacity-80">
              Buy tickets in seconds and access your unique QR code for smooth entry—no printing or waiting required.
            </p>
          </div>
          {/* Built for Community Feature */}
          <div className="bg-base-200 dark:bg-base-300 rounded-xl p-8 flex flex-col items-center shadow-md hover:scale-105 transition-all duration-300">
            <Users className="w-10 h-10 mb-2 text-warning" />
            <h3 className="text-xl font-bold mb-2 text-warning">Built for Community</h3>
            <p className="text-base text-base-content opacity-80">
              Whether you're an event organizer or an attendee, QuickTicket is optimized for collaboration, reliability, and ease of use.
            </p>
          </div>
        </div>
      </section>

      {/* About/CTA Section */}
      <section className="py-14 px-4 bg-base-200 dark:bg-base-300">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Why QuickTicket?</h2>
          <ul className="list-disc space-y-2 text-base mx-auto text-base-content/80 pl-6 text-left max-w-xl">
            <li>Lightning-fast event browsing and instant QR ticketing</li>
            <li>Organizers get complete oversight and rapid attendee check-in</li>
            <li>Secured with modern authentication and designed for every device</li>
            <li>Adapts seamlessly to light & dark mode for a comfortable experience</li>
          </ul>
          <div className="mt-8">
            <Link
              to="/signup"
              className="btn btn-primary btn-lg rounded-full shadow-lg mr-3"
              aria-label="Join QuickTicket"
            >
              Join QuickTicket
            </Link>
            {/* Same: Only show events link to customer/guest */}
            {(!user || user.role === 'customer') && (
              <Link
                to="/events"
                className="btn btn-outline btn-lg rounded-full"
                aria-label="Discover Events"
              >
                Discover Events
              </Link>
            )}
            {/* Host sees dashboard button */}
            {user && user.role === 'host' && (
              <Link
                to="/dashboard/host"
                className="btn btn-outline btn-lg rounded-full"
                aria-label="Go to Dashboard"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
