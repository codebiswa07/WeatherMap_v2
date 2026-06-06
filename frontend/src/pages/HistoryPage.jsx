import React from "react";
import { useHistory } from "../hooks/useWeather";
import { format } from "date-fns";

export default function HistoryPage({ onSelect }) {
  const { data: history, isLoading } = useHistory();

  return (
    <div className="history-page">
      <h1 className="history-title">Recent Searches</h1>
      {isLoading && <p className="loading-text">Loading history…</p>}
      <div className="history-grid">
        {history?.map((item) => (
          <div
            key={item._id}
            className="history-card"
            onClick={() => onSelect({ lat: item.lat, lon: item.lon })}
          >
            <div className="hc-location">
              {item.city || item.query}
              {item.country && <span className="hc-country">{item.country}</span>}
            </div>
            <div className="hc-coords">{item.lat?.toFixed(2)}, {item.lon?.toFixed(2)}</div>
            <div className="hc-time">{format(new Date(item.createdAt), "MMM d, HH:mm")}</div>
          </div>
        ))}
        {!isLoading && !history?.length && (
          <p className="no-history">No searches yet. Try clicking the map!</p>
        )}
      </div>
    </div>
  );
}
