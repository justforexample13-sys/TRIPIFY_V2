import { useState } from "react";
import { Plane, Hotel } from "lucide-react";
import { cn } from "@/lib/utils";
import FlightSearchForm from "./FlightSearchForm";
import HotelSearchForm from "./HotelSearchForm";

type TabType = "flights" | "hotels";

const SearchTabs = () => {
  const [activeTab, setActiveTab] = useState<TabType>("flights");

  const tabs = [
    { id: "flights" as TabType, label: "Flights", icon: Plane },
    { id: "hotels" as TabType, label: "Hotels", icon: Hotel },
  ];

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-2xl w-fit mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="glass-card p-6 lg:p-8">
        {activeTab === "flights" ? <FlightSearchForm /> : <HotelSearchForm />}
      </div>
    </div>
  );
};

export default SearchTabs;
