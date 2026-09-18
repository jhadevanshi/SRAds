import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin, AlertTriangle } from 'lucide-react-native';

export default function LiveFleetMap({ fleet = [], loading = false, error = null, onSelectVehicle, selectedVehicleId }) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // If the map is ready and we have fleet data, fit the map to show all vehicles
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

  // Dynamically calculate the initial region from the first valid vehicle
  const getInitialRegion = () => {
    if (fleet.length === 0) return {
      latitude: 23.0225, // Fallback safe region
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
    <View style={styles.container}>
      {/* MAP ALWAYS MOUNTED to prevent Android GL crash */}
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
                <View style={[styles.markerPill, isSelected && styles.markerPillSelected]}>
                  <Text style={styles.markerText}>🚕 {vehicle.vehicle_number || vehicle.adsd_id || 'Display'}</Text>
                </View>
                <View style={styles.markerDotContainer}>
                  <View style={[styles.markerDot, isSelected && styles.markerDotSelected]} />
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* STATE 1: LOADING OVERLAY */}
      {loading && (
        <View style={styles.overlayContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      )}

      {/* STATE 2: API/NETWORK ERROR OVERLAY */}
      {!loading && error && (
        <View style={styles.overlayContainer}>
          <AlertTriangle size={32} className="text-red-500 mb-2" />
          <Text className="text-slate-800 dark:text-white font-bold text-center mb-1">Unable to load map</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-center text-xs px-4">{error}</Text>
        </View>
      )}

      {/* STATE 3: NO ELIGIBLE DEVICES OVERLAY */}
      {!loading && !error && fleet.length === 0 && (
        <View style={styles.transparentOverlay} pointerEvents="none">
          <View className="bg-white/95 dark:bg-[#161B22]/95 p-4 rounded-2xl shadow-xl items-center w-[85%] border border-slate-100 dark:border-[#30363D]">
            <MapPin size={28} className="text-slate-300 dark:text-slate-600 mb-2" />
            <Text className="text-slate-800 dark:text-white font-bold text-center mb-1">No live displays right now</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-center text-xs leading-4">
              Your ads will appear here when a display starts playing them.
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
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerPill: {
    backgroundColor: '#10B981', // Emerald green for "Live"
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerPillSelected: {
    backgroundColor: '#F59E0B', // Amber for selected
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markerDotContainer: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 12,
    height: 12,
    backgroundColor: '#10B981',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  markerDotSelected: {
    backgroundColor: '#F59E0B',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC', 
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
