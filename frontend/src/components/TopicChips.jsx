import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GraduationCap,
  Heart,
  DollarSign,
  Gamepad2,
  Globe,
  UtensilsCrossed,
  Laptop,
  MapPin,
  X,
  Filter,
  Sparkles
} from 'lucide-react';

// Organized topic categories based on the backend topics
const TOPIC_CATEGORIES = {
  'Education': {
    icon: GraduationCap,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    topics: ['education', 'books', 'productivity', 'career', 'freelancing']
  },
  'Health & Wellness': {
    icon: Heart,
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    topics: ['health', 'fitness', 'meditation', 'beauty']
  },
  'Finance': {
    icon: DollarSign,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    topics: ['finance', 'cryptocurrency', 'real estate']
  },
  'Entertainment': {
    icon: Gamepad2,
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    topics: ['entertainment', 'gaming', 'music', 'art']
  },
  'Social Impact': {
    icon: Globe,
    color: 'bg-teal-500',
    hoverColor: 'hover:bg-teal-600',
    topics: ['sustainability', 'parenting', 'dating', 'pets']
  },
  'Travel': {
    icon: MapPin,
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    topics: ['travel']
  },
  'Food': {
    icon: UtensilsCrossed,
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    topics: ['food', 'cooking', 'recipes']
  },
  'Technology': {
    icon: Laptop,
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
    topics: ['technology', 'photography']
  },
  'Local Services': {
    icon: MapPin,
    color: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
    topics: ['home improvement', 'gardening', 'sports', 'fashion']
  }
};

const TopicChips = ({ selectedTopics = [], onTopicSelect, className = "" }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const handleCategoryClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryName);
    }
  };

  const handleTopicSelect = (topic) => {
    onTopicSelect?.(topic);
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    onTopicSelect?.(null); // Clear all selected topics
  };

  const displayCategories = showAllCategories ?
    Object.entries(TOPIC_CATEGORIES) :
    Object.entries(TOPIC_CATEGORIES).slice(0, 6);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Browse by Category</h3>
        </div>

        {(selectedCategory || selectedTopics.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Category Chips Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {displayCategories.map(([categoryName, categoryData]) => {
          const IconComponent = categoryData.icon;
          const isSelected = selectedCategory === categoryName;

          return (
            <Card
              key={categoryName}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleCategoryClick(categoryName)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-3 rounded-full text-white ${categoryData.color} ${categoryData.hoverColor} transition-colors`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h4 className="font-medium text-sm text-gray-800 leading-tight">
                    {categoryName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {categoryData.topics.length} topics
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {Object.keys(TOPIC_CATEGORIES).length > 6 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="rounded-full"
          >
            {showAllCategories ? 'Show Less' : 'Show All Categories'}
          </Button>
        </div>
      )}

      {/* Expanded Category Topics */}
      {selectedCategory && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {React.createElement(TOPIC_CATEGORIES[selectedCategory].icon, {
                className: "w-5 h-5"
              })}
              {selectedCategory} Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {TOPIC_CATEGORIES[selectedCategory].topics.map((topic) => {
                const isTopicSelected = selectedTopics.includes(topic);

                return (
                  <Badge
                    key={topic}
                    variant={isTopicSelected ? "default" : "secondary"}
                    className={`cursor-pointer transition-all duration-200 capitalize px-3 py-1 text-sm ${
                      isTopicSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        : 'hover:bg-gray-200 hover:shadow-sm'
                    }`}
                    onClick={() => handleTopicSelect(topic)}
                  >
                    {topic.replace(/([A-Z])/g, ' $1').trim()}
                    {isTopicSelected && <Sparkles className="w-3 h-3 ml-1" />}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Topics Summary */}
      {selectedTopics.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">
                  Selected Topics ({selectedTopics.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="text-xs text-green-700 border-green-300 capitalize"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TopicChips;