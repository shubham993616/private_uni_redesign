import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Globe, Map as MapIcon, ChevronDown, Crosshair, Bookmark, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Complete list of all 29+ Indian states/UTs for the selector
const ALL_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Delhi NCR",
  "Chandigarh", "Jammu and Kashmir", "Ladakh", "Puducherry"
].sort();

// Fallback coordinates for map navigation
const STATE_COORDS = {
  "Andhra Pradesh": [15.9129, 79.7400],
  "Arunachal Pradesh": [28.2180, 94.7278],
  "Assam": [26.2006, 92.9376],
  "Bihar": [25.0961, 85.3131],
  "Chhattisgarh": [21.2787, 81.8661],
  "Goa": [15.2993, 74.1240],
  "Gujarat": [22.2587, 71.1924],
  "Haryana": [29.0588, 76.0856],
  "Himachal Pradesh": [31.1048, 77.1734],
  "Jharkhand": [23.6102, 85.2799],
  "Karnataka": [15.3173, 75.7139],
  "Kerala": [10.8505, 76.2711],
  "Madhya Pradesh": [22.9734, 78.6569],
  "Maharashtra": [19.7515, 75.7139],
  "Manipur": [24.6637, 93.9063],
  "Meghalaya": [25.4670, 91.3662],
  "Mizoram": [23.1645, 92.9376],
  "Nagaland": [26.1584, 94.5624],
  "Odisha": [20.9517, 85.0985],
  "Punjab": [31.1471, 75.3412],
  "Rajasthan": [27.0238, 74.2179],
  "Sikkim": [27.5330, 88.5122],
  "Tamil Nadu": [11.1271, 78.6569],
  "Telangana": [18.1124, 79.0193],
  "Tripura": [23.9408, 91.9882],
  "Uttar Pradesh": [26.8467, 80.9462],
  "Uttarakhand": [30.0668, 79.0193],
  "West Bengal": [22.9868, 87.8550],
  "Delhi": [28.6139, 77.2090],
  "Delhi NCR": [28.6139, 77.2090],
  "Chandigarh": [30.7333, 76.7794],
  "Jammu and Kashmir": [33.7782, 76.5762],
  "Ladakh": [34.1526, 77.5771],
  "Puducherry": [11.9416, 79.8083]
};

// Custom icons
const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const savedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [center, zoom, map]);
  return null;
}

export default function GeographicView({ universities = [], savedUniversities = [] }) {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [mapView, setMapView] = useState({
    center: [20.5937, 78.9629],
    zoom: 4
  });

  // Build State/City map from university data
  const locationData = useMemo(() => {
    const data = {};
    universities.forEach(uni => {
      if (!uni.state) return;
      
      const stateName = uni.state;
      if (!data[stateName]) {
        data[stateName] = {
          center: STATE_COORDS[stateName] || [20.5937, 78.9629],
          points: [],
          cities: {}
        };
      }
      
      if (uni.latitude && uni.longitude) {
        data[stateName].points.push([uni.latitude, uni.longitude]);
      }
      
      if (uni.city) {
        const cityName = uni.city;
        if (!data[stateName].cities[cityName]) {
          data[stateName].cities[cityName] = {
            center: (uni.latitude && uni.longitude) ? [uni.latitude, uni.longitude] : (STATE_COORDS[stateName] || [20.5937, 78.9629]),
            points: []
          };
        }
        if (uni.latitude && uni.longitude) {
          data[stateName].cities[cityName].points.push([uni.latitude, uni.longitude]);
        }
      }
    });

    // Calculate centroid if points exist
    Object.keys(data).forEach(state => {
      const s = data[state];
      if (s.points.length > 0) {
        const avgLat = s.points.reduce((sum, p) => sum + p[0], 0) / s.points.length;
        const avgLng = s.points.reduce((sum, p) => sum + p[1], 0) / s.points.length;
        s.center = [avgLat, avgLng];
      }
      
      Object.keys(s.cities).forEach(city => {
        const c = s.cities[city];
        if (c.points.length > 0) {
          const cLat = c.points.reduce((sum, p) => sum + p[0], 0) / c.points.length;
          const cLng = c.points.reduce((sum, p) => sum + p[1], 0) / c.points.length;
          c.center = [cLat, cLng];
        }
      });
    });

    return data;
  }, [universities]);

  // Group by state for stats
  const stateCounts = universities.reduce((acc, uni) => {
    if (uni.state) acc[uni.state] = (acc[uni.state] || 0) + 1;
    return acc;
  }, {});

  const sortedStates = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxCount = Math.max(...Object.values(stateCounts), 1);

  // Handle location selection
  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedCity('');
    
    // Check if we have dynamic data for this state
    if (locationData[state]) {
      setMapView({
        center: locationData[state].center,
        zoom: 7
      });
    } else if (STATE_COORDS[state]) {
      // Fallback to static coordinates if no universities exist in this state yet
      setMapView({
        center: STATE_COORDS[state],
        zoom: 7
      });
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    if (selectedState && locationData[selectedState]?.cities[city]) {
      setMapView({
        center: locationData[selectedState].cities[city].center,
        zoom: 12
      });
    }
  };

  const resetView = () => {
    setSelectedState('');
    setSelectedCity('');
    setMapView({
      center: [20.5937, 78.9629],
      zoom: 4
    });
  };

  const isSaved = (id) => savedUniversities.some(su => su._id === id);
  const universitiesWithCoords = universities.filter(u => u.latitude && u.longitude);
  const universitiesInSelected = universities.filter(u => 
    (!selectedState || u.state === selectedState) && 
    (!selectedCity || u.city === selectedCity)
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-eyebrow flex items-center gap-2 mb-2">
            <MapIcon className="w-3 h-3" aria-hidden="true" /> Regional explorer
          </p>
          <h2 className="text-h2">Geographic insights</h2>
          <p className="text-support mt-1">
            Exploring <span className="text-data">{universities.length}</span> institutions across <span className="text-data">{Object.keys(stateCounts).length}</span> active states.
          </p>
        </div>

        {/* State/City Selectors */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
             <select
               value={selectedState}
               onChange={(e) => handleStateChange(e.target.value)}
               aria-label="Filter by state"
               className="appearance-none h-11 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-btn px-4 pr-10 text-sm text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition cursor-pointer min-w-[180px]"
             >
               <option value="">All 29+ States</option>
               {ALL_STATES.map(state => (
                 <option key={state} value={state}>
                   {state} {stateCounts[state] ? `(${stateCounts[state]})` : ''}
                 </option>
               ))}
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted pointer-events-none" aria-hidden="true" />
          </div>

          <AnimatePresence>
            {selectedState && locationData[selectedState]?.cities && Object.keys(locationData[selectedState].cities).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="relative"
              >
                <select
                   value={selectedCity}
                   onChange={(e) => handleCityChange(e.target.value)}
                   aria-label="Filter by city"
                   className="appearance-none h-11 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-btn px-4 pr-10 text-sm text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition cursor-pointer min-w-[160px]"
                 >
                   <option value="">All Cities</option>
                   {Object.keys(locationData[selectedState].cities).sort().map(city => (
                     <option key={city} value={city}>{city}</option>
                   ))}
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted pointer-events-none" aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={resetView}
            className="w-11 h-11 flex items-center justify-center bg-primary/10 text-link dark:text-primary-300 rounded-btn hover:bg-primary hover:text-white transition-colors duration-150"
            title="Reset to India View"
            aria-label="Reset to India view"
          >
            <Crosshair className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Stats Column */}
        <div className="lg:col-span-1 space-y-6">
           <div className="card p-6">
              <p className="text-eyebrow mb-4 flex items-center gap-2">
                 <Globe className="w-3 h-3" aria-hidden="true" /> Live data
              </p>
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-stat">{Object.keys(stateCounts).length}</span>
                    <span className="text-caption pb-1">Active states</span>
                 </div>
                 <div className="flex justify-between items-end">
                    <span className="text-stat">{universities.length}</span>
                    <span className="text-caption pb-1">Institutions</span>
                 </div>
              </div>
           </div>

           <div className="space-y-4 pt-2">
              <h3 className="text-eyebrow flex items-center gap-2 px-1">
                 <MapPin className="w-4 h-4" aria-hidden="true" /> Top distributions
              </h3>
              <div className="space-y-3 px-1">
                 {sortedStates.map(([state, count], i) => (
                   <div key={state} className="space-y-1.5">
                      <div className="flex justify-between text-caption font-medium">
                        <span>{state}</span>
                        <span className="text-data">{count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-light-card dark:bg-dark-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / maxCount) * 100}%` }}
                          transition={{ duration: 1, delay: i * 0.05 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                   </div>
                 ))}
                 {Object.keys(stateCounts).length === 0 && (
                    <p className="text-caption">No university records found yet.</p>
                 )}
              </div>
           </div>
        </div>

        {/* Map View */}
        <div className="lg:col-span-3 relative h-[550px] rounded-card overflow-hidden border border-light-border dark:border-dark-border shadow-card z-0">
           <MapContainer 
             center={mapView.center} 
             zoom={mapView.zoom} 
             scrollWheelZoom={true} 
             className="w-full h-full"
             zoomControl={false}
           >
             <TileLayer
               attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
               url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
             />
             
             <MapController center={mapView.center} zoom={mapView.zoom} />

             {universitiesWithCoords.map((uni) => (
               <Marker 
                 key={uni._id} 
                 position={[uni.latitude, uni.longitude]}
                 icon={isSaved(uni._id) ? savedIcon : defaultIcon}
               >
                 <Popup className="custom-popup">
                   <div className="p-2 min-w-[180px]">
                     <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm leading-tight flex-1">{uni.name}</h4>
                        {isSaved(uni._id) && <Bookmark className="w-3 h-3 text-link fill-primary ml-2 shrink-0" aria-hidden="true" />}
                     </div>
                     <p className="text-xs text-light-muted flex items-center gap-1 mb-4">
                        <MapPin className="w-3 h-3" aria-hidden="true" /> {uni.city}, {uni.state}
                     </p>
                     <Link
                       to={`/universities/${uni.slug}`}
                       className="block w-full py-2 bg-primary text-white text-xs font-semibold text-center rounded-btn hover:bg-primary-dark transition-colors duration-150"
                     >
                       Explore university &rarr;
                     </Link>
                   </div>
                 </Popup>
               </Marker>
             ))}
           </MapContainer>

           {/* Floating Info Overlay */}
           <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
              <motion.div
                key={selectedCity || selectedState}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-md p-4 rounded-card border border-light-border/60 dark:border-dark-border/60 shadow-card"
              >
                 <p className="text-eyebrow mb-1.5">Geographic view</p>
                 <h4 className="text-h3 truncate max-w-[200px]">
                    {selectedCity || selectedState || "National Map"}
                 </h4>
                 <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-info" aria-hidden="true"></span>
                       <span className="text-caption">Institutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true"></span>
                       <span className="text-caption">Saved</span>
                    </div>
                 </div>
              </motion.div>
           </div>

           {selectedState && !locationData[selectedState] && (
              <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[1px] z-[500] flex items-center justify-center pointer-events-none">
                 <div className="bg-white/90 dark:bg-dark-card/90 p-5 rounded-card shadow-card border border-light-border dark:border-dark-border flex items-center gap-3">
                    <Info className="w-5 h-5 text-primary" aria-hidden="true" />
                    <p className="text-sm font-medium text-light-text dark:text-dark-text">No universities currently listed in {selectedState}.</p>
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* Dynamic Results List */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedState || 'all'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="pt-6"
        >
          <div className="flex items-center gap-4 mb-8">
             <h3 className="text-h3 shrink-0">
                {selectedState ? `Institutions in ${selectedState}` : "Available institutions"}
             </h3>
             <div className="h-px flex-1 bg-light-border dark:bg-dark-border"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {universitiesInSelected
              .slice(0, 12)
              .map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`card p-6 border-l-4 group transition-all duration-150 hover:shadow-card-hover hover:-translate-y-0.5 ${isSaved(u._id) ? 'border-l-primary' : 'border-l-info'}`}
              >
                <div className="flex justify-between items-start mb-3">
                   <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-dark-border flex items-center justify-center font-bold text-link dark:text-primary-300">
                      {u.name?.charAt(0)}
                   </div>
                   {isSaved(u._id) && <Bookmark className="w-4 h-4 text-link fill-primary" aria-label="Saved" />}
                </div>
                <h4 className="text-card-title text-sm mb-1 group-hover:text-link dark:group-hover:text-primary-300 transition-colors line-clamp-1">{u.name}</h4>
                <p className="text-caption flex items-center gap-1 mb-5">
                  <MapPin className="w-3 h-3" aria-hidden="true" /> {u.city || "N/A"}, {u.state || "N/A"}
                </p>
                <Link to={`/universities/${u.slug}`} className="text-sm font-semibold text-link dark:text-primary-300 hover:underline flex items-center gap-1">
                  View profile <span aria-hidden="true">&rarr;</span>
                </Link>
              </motion.div>
            ))}
            {universitiesInSelected.length === 0 && (
               <div className="col-span-full py-20 text-center bg-light-card/50 dark:bg-dark-border/20 rounded-card border-2 border-dashed border-light-border dark:border-dark-border">
                  <Info className="w-8 h-8 text-light-muted dark:text-dark-muted mx-auto mb-3" aria-hidden="true" />
                  <p className="text-support">No universities found in {selectedState || "this area"} yet.</p>
               </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


