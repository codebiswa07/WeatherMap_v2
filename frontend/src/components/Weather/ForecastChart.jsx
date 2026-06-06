import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";

export default function ForecastChart({ forecast }) {
  if (!forecast?.list) return null;

  const data = forecast.list.slice(0, 16).map(item => ({
    time:     format(new Date(item.dt * 1000), "EEE HH:mm"),
    temp:     Math.round(item.main.temp),
    feels:    Math.round(item.main.feels_like),
    humidity: item.main.humidity,
  }));

  return (
    <div className="forecast-chart">
      <h4 className="chart-title">48-Hour Forecast</h4>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey="time" tick={{ fill: "#8892a4", fontSize: 10 }} interval={3} />
          <YAxis tick={{ fill: "#8892a4", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "#1a2035", border: "1px solid #2d3a52", borderRadius: "8px" }}
            labelStyle={{ color: "#8892a4" }}
            itemStyle={{ color: "#64b5f6" }}
          />
          <Line type="monotone" dataKey="temp"  stroke="#64b5f6" strokeWidth={2}   dot={false} name="Temp °C" />
          <Line type="monotone" dataKey="feels" stroke="#81c784" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Feels Like" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
