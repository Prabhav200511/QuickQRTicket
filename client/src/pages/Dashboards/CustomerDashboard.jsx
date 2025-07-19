import React from "react";
import { TicketCheck, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-6 bg-base-200">
      <div className="max-w-3xl w-full bg-base-100 rounded-2xl shadow-xl p-10 animate-fade-in">
        <h1 className="text-5xl font-extrabold text-center text-primary mb-6 tracking-tight">
          Welcome to Your Dashboard!
        </h1>
        <p className="text-center text-xl text-secondary mb-12 font-semibold">
          Explore events, manage your tickets, and update your profile.
        </p>

        <div className="grid gap-10 md:grid-cols-3">
          <button
            className="flex flex-col items-center gap-3 bg-primary/10 dark:bg-primary/20 rounded-xl shadow-lg p-8 hover:bg-primary hover:text-primary-content hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-0"
            onClick={() => navigate('/events')}
          >
            <Search className="w-10 h-10" />
            <span className="font-semibold text-lg">Browse Events</span>
          </button>
          <button
            className="flex flex-col items-center gap-3 bg-success/10 dark:bg-success/20 rounded-xl shadow-lg p-8 hover:bg-success hover:text-success-content hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-0"
            onClick={() => navigate('/my-tickets')}
          >
            <TicketCheck className="w-10 h-10" />
            <span className="font-semibold text-lg">My Tickets</span>
          </button>
          <button
            className="flex flex-col items-center gap-3 bg-warning/10 dark:bg-warning/20 rounded-xl shadow-lg p-8 hover:bg-warning hover:text-warning-content hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-0"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-10 h-10" />
            <span className="font-semibold text-lg">Profile & Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
