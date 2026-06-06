import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "../services/api";

export const useWeatherByCoords = (lat, lon, enabled = true) =>
  useQuery({
    queryKey: ["weather", lat, lon],
    queryFn:  () => weatherApi.getByCoords(lat, lon).then(r => r.data.data),
    enabled:  !!lat && !!lon && enabled,
  });

export const useForecast = (lat, lon, enabled = true) =>
  useQuery({
    queryKey: ["forecast", lat, lon],
    queryFn:  () => weatherApi.getForecast(lat, lon).then(r => r.data.data),
    enabled:  !!lat && !!lon && enabled,
  });

export const useWeatherByCity = (city) =>
  useQuery({
    queryKey: ["weather-city", city],
    queryFn:  () => weatherApi.getByCity(city).then(r => r.data.data),
    enabled:  !!city,
  });

export const useHistory = () =>
  useQuery({
    queryKey: ["history"],
    queryFn:  () => weatherApi.getHistory().then(r => r.data.data),
  });
