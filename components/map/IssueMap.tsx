"use client";

import { useEffect, useRef, useState } from "react";
import type { DivIcon, LayerGroup, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { STATUS_HEX_COLORS, STATUS_LABELS, type IssueStatus } from "@/lib/status";

export type MapIssue = {
  _id: string;
  title: string;
  status: IssueStatus;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
};

const DEFAULT_CENTER: [number, number] = [-1.2921, 36.8219];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function IssueMap({
  issues,
  linkPrefix = "/reports",
}: {
  issues: MapIssue[];
  linkPrefix?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const fittedRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || containerRef.current === null) return;
      leafletRef.current = leaflet;
      const map = leaflet
        .map(containerRef.current, { scrollWheelZoom: false })
        .setView(DEFAULT_CENTER, 12);
      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        })
        .addTo(map);
      mapRef.current = map;
      layerRef.current = leaflet.layerGroup().addTo(map);
      setMapReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      leafletRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (leaflet === null || map === null || layer === null) return;

    layer.clearLayers();
    const positions: [number, number][] = [];

    for (const issue of issues) {
      if (issue.latitude === null || issue.longitude === null) continue;
      const position: [number, number] = [issue.latitude, issue.longitude];
      positions.push(position);

      const color = STATUS_HEX_COLORS[issue.status];
      const icon: DivIcon = leaflet.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const marker = leaflet.marker(position, { icon });
      marker.bindPopup(
        `<strong>${escapeHtml(issue.title)}</strong><br/>` +
          `<span style="color:#6b7280;font-size:12px">${STATUS_LABELS[issue.status]}</span>` +
          `${issue.address ? `<br/><span style="color:#6b7280;font-size:12px">${escapeHtml(issue.address)}</span>` : ""}<br/>` +
          `<a href="${linkPrefix}/${issue._id}" style="color:#1d4ed8;font-size:12px;font-weight:600">View report →</a>`,
      );
      marker.addTo(layer);
    }

    if (positions.length > 0 && !fittedRef.current) {
      fittedRef.current = true;
      map.fitBounds(positions, { padding: [30, 30], maxZoom: 15 });
    }
    map.invalidateSize();
  }, [issues, mapReady, linkPrefix]);

  return (
    <div
      ref={containerRef}
      className="h-[420px] w-full rounded-[10px] border border-line bg-surface"
      role="application"
      aria-label="Map of open reports"
    />
  );
}
