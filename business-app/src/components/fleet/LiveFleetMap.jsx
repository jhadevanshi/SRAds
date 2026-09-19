import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin, AlertTriangle, Radio } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function LiveFleetMap({ fleet = [], loading = false, error = null, onSelectVehicle, selectedVehicleId }) {
  const { isDark } = useTheme();
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (mapReady && mapRef.current && fleet.length > 0) {
      const validCoordinates = fleet
        .map(v => ({
          latitude: parseFloat(v.latitude),
          longitude: parseFloat(v.longitude)
        }))
        .filter(c => Number.isFinite(c.latitude) && Number.isFinite(c.longitude));

      if (validCoordinates.length > 0) {
        mapRef.current.fitToCoordinates(validCoordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [fleet, mapReady]);

  const getInitialRegion = () => {
    if (fleet.length === 0) return {
      latitude: 23.0225,
      longitude: 72.5714,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
    
    const firstValid = fleet.find(v => Number.isFinite(parseFloat(v.latitude)) && Number.isFinite(parseFloat(v.longitude)));
    if (!firstValid) return {
      latitude: 23.0225,
      longitude: 72.5714,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };

    return {
      latitude: parseFloat(firstValid.latitude),
      longitude: parseFloat(firstValid.longitude),
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#090614' : '#F8F7FF' }]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={getInitialRegion()}
        onMapReady={() => setMapReady(true)}
      >
        {(!error && fleet.length > 0) && fleet.map((vehicle) => {
          const lat = parseFloat(vehicle.latitude);
          const lng = parseFloat(vehicle.longitude);
          
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return null;
          }
          
          const isSelected = selectedVehicleId === vehicle.device_id;
          
          return (
            <Marker
              key={vehicle.device_id}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={() => onSelectVehicle && onSelectVehicle(vehicle)}
            >
              <View style={styles.markerContainer}>
                <View 
                  style={[
                    styles.markerPill, 
                    {
                      backgroundColor: isSelected ? '#7C3AED' : '#10B981',
                      borderColor: '#FFFFFF',
                      borderWidth: 1.5,
                      shadowColor: isSelected ? '#7C3AED' : '#10B981',
                      shadowOpacity: 0.4,
                      shadowRadius: 6,
                    }
                  ]}
                >
                  <Text style={styles.markerText}>
                    🚍 {vehicle.vehicle_number || vehicle.adsd_id || 'Transit Screen'}
                  </Text>
                </View>
                <View style={styles.markerDotContainer}>
                  <View 
                    style={[
                      styles.markerDot, 
                      {
                        backgroundColor: isSelected ? '#7C3AED' : '#10B981',
                      }
                    ]} 
                  />
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Loading Overlay */}
      {loading && (
        <View style={[styles.overlayContainer, { backgroundColor: isDark ? 'rgba(9, 6, 20, 0.85)' : 'rgba(248, 247, 255, 0.85)' }]}>
          <ActivityIndicator size="large" color="#A855F7" />
          <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-bold mt-2">Connecting to transit telemetry...</Text>
        </View>
      )}

      {/* Error Overlay */}
      {!loading && error && (
        <View style={[styles.overlayContainer, { backgroundColor: isDark ? '#090614' : '#F8F7FF' }]}>
          <AlertTriangle size={32} color="#EF4444" className="mb-2" />
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-center mb-1 text-sm">Unable to load live map</Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-center text-xs px-4">{error}</Text>
        </View>
      )}

      {/* No Vehicles Overlay */}
      {!loading && !error && fleet.length === 0 && (
        <View style={styles.transparentOverlay} pointerEvents="none">
          <View 
            style={{ 
              backgroundColor: isDark ? 'rgba(20, 15, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDark ? '#281B4B' : '#EDE9FE' 
            }} 
            className="p-5 rounded-3xl shadow-xl items-center w-[85%] border"
          >
            <View style={{ backgroundColor: isDark ? '#281B4B' : '#EDE9FE' }} className="w-12 h-12 rounded-2xl items-center justify-center mb-2.5">
              <Radio size={24} color="#A855F7" />
            </View>
            <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-center mb-1 text-sm">No Live Broadcasts Right Now</Text>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-center text-xs leading-4 px-2 font-medium">
              Displays will illuminate on the live radar as soon as campaigns commence playback.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerPill: {
    borderRadius: 9999,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    marginBottom: 3,
    elevation: 5,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  markerDotContainer: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 20,
  },
  transparentOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  }
});
