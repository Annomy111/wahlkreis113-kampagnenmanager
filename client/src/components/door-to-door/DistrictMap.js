import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '@mui/material/styles';

const DistrictMap = ({ district, households, onHouseholdSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const theme = useTheme();

  useEffect(() => {
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([51.2277, 6.7735], 13); // Düsseldorf coordinates

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !households) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for each household
    households.forEach(household => {
      if (household.location && household.location.coordinates) {
        const [lng, lat] = household.location.coordinates;
        
        // Define marker color based on status
        const getMarkerColor = (status) => {
          switch (status) {
            case 'completed':
              return theme.palette.success.main;
            case 'in_progress':
              return theme.palette.warning.main;
            case 'not_visited':
              return theme.palette.error.main;
            default:
              return theme.palette.grey[500];
          }
        };

        const markerHtml = `
          <div style="
            background-color: ${getMarkerColor(household.status)};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'custom-div-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([lat, lng], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <b>${household.street} ${household.houseNumber}</b><br>
            ${household.postalCode} ${household.city}<br>
            Status: ${household.status}
          `);

        marker.on('click', () => {
          onHouseholdSelect(household);
        });

        markersRef.current[household._id] = marker;
      }
    });

    // Fit bounds to show all markers
    if (Object.keys(markersRef.current).length > 0) {
      const markers = Object.values(markersRef.current);
      const group = L.featureGroup(markers);
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [households, theme, onHouseholdSelect]);

  // Update district boundary if available
  useEffect(() => {
    if (!mapInstanceRef.current || !district?.boundary) return;

    try {
      const boundaryLayer = L.geoJSON(district.boundary, {
        style: {
          color: theme.palette.primary.main,
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.1
        }
      }).addTo(mapInstanceRef.current);

      return () => {
        boundaryLayer.remove();
      };
    } catch (error) {
      console.error('Error drawing district boundary:', error);
    }
  }, [district, theme]);

  return (
    <Box
      ref={mapRef}
      sx={{
        height: '100%',
        minHeight: '500px',
        width: '100%',
        '& .leaflet-container': {
          height: '100%',
          width: '100%',
        }
      }}
    />
  );
};

export default DistrictMap;
