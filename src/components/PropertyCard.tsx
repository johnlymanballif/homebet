'use client';

import { useState } from 'react';
import { Property } from '@/types/game';
import { formatPrice, formatNumber } from '@/lib/utils';
import { getPropertyTypeColor } from '@/lib/gameLogic';
import { Bed, Bath, Square, Trees, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PropertyCardProps {
  property: Property;
  hidePrice?: boolean;
}

export default function PropertyCard({ property, hidePrice = false }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const addressLine = (() => {
    const addr: any = property.address as any;
    if (typeof addr === 'string') return addr;
    if (addr && typeof addr === 'object') {
      return addr.line || addr.address || addr.street || `${addr.city || ''}`.trim();
    }
    return 'Unknown address';
  })();

const descriptionText = (() => {
  const d: any = property.description as any;
  if (typeof d === 'string') return d;
  if (d && typeof d === 'object') {
    const parts: string[] = [];
    if (d.beds) parts.push(`${d.beds} beds`);
    if (d.beds_max) parts.push(`up to ${d.beds_max} beds`);
    if (d.beds_min) parts.push(`at least ${d.beds_min} beds`);
    if (d.baths_consolidated || d.baths) parts.push(`${d.baths_consolidated || d.baths} baths`);
    if (d.baths_max) parts.push(`up to ${d.baths_max} baths`);
    if (d.baths_min) parts.push(`at least ${d.baths_min} baths`);
    if (d.sqft) parts.push(`${d.sqft} sqft`);
    if (d.sqft_max) parts.push(`up to ${d.sqft_max} sqft`);
    if (d.sqft_min) parts.push(`at least ${d.sqft_min} sqft`);
    if (d.lot_sqft) parts.push(`${d.lot_sqft} lot sqft`);
    return parts.length ? parts.join(' • ') : 'No description available';
  }
  return 'No description available';
})();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Image Carousel */}
      <div className="relative h-64 md:h-80 bg-gray-200">
        <img
          src={(property.images && property.images[currentImageIndex]) || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'}
          alt={addressLine}
          className="w-full h-full object-cover"
        />
        
        {/* Image Navigation */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Property Type Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${getPropertyTypeColor(property.propertyType)}`}>
          {property.propertyType}
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {property.images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        {/* Address */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {addressLine} {property.source === 'mock' && (
            <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full bg-gray-200 text-gray-700 align-middle">(DEMO)</span>
          )}
        </h3>
        <p className="text-gray-600 mb-4">
          {String(property.city)}{property.state ? `, ${String(property.state)}` : ''} {String(property.zipCode || '')}
        </p>

        {/* Price (if not hidden) */}
        {!hidePrice && (
          <div className="mb-4">
            <p className="text-3xl font-bold text-primary-600">
              {formatPrice(property.price)}
            </p>
          </div>
        )}

        {/* Key Features Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <Bed className="w-5 h-5 text-gray-400" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <Bath className="w-5 h-5 text-gray-400" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <Square className="w-5 h-5 text-gray-400" />
            <span>{formatNumber(property.squareFeet)} sqft</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <Trees className="w-5 h-5 text-gray-400" />
            <span>{formatNumber(property.lotSize)} sqft lot</span>
          </div>
        </div>

        {/* Year Built */}
        <div className="flex items-center space-x-2 text-gray-700 mb-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span>Built in {property.yearBuilt}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4">{descriptionText}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {property.features.map((feature, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
