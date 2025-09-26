import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Heart,
  DollarSign,
  Gamepad2,
  Globe,
  UtensilsCrossed,
  Laptop,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';

// Enhanced topic categories with descriptions and examples
const TOPIC_TILES_DATA = {
  'Education': {
    icon: GraduationCap,
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Learning platforms, courses, and skill development',
    topics: ['education', 'books', 'productivity', 'career', 'freelancing'],
    examples: ['Online Course Platform', 'Digital Library', 'Career Coaching'],
    stats: { popularity: 95, trending: true }
  },
  'Health & Wellness': {
    icon: Heart,
    color: 'from-red-400 to-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Fitness, mental health, and wellness solutions',
    topics: ['health', 'fitness', 'meditation', 'beauty'],
    examples: ['Workout Tracker', 'Meditation App', 'Wellness Community'],
    stats: { popularity: 88, trending: true }
  },
  'Finance': {
    icon: DollarSign,
    color: 'from-green-400 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Financial services, investment, and money management',
    topics: ['finance', 'cryptocurrency', 'real estate'],
    examples: ['Budget Planner', 'Crypto Portfolio', 'Investment Platform'],
    stats: { popularity: 92, trending: true }
  },
  'Entertainment': {
    icon: Gamepad2,
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Games, media, and entertainment platforms',
    topics: ['entertainment', 'gaming', 'music', 'art'],
    examples: ['Gaming Community', 'Music Streaming', 'Art Marketplace'],
    stats: { popularity: 85, trending: false }
  },
  'Social Impact': {
    icon: Globe,
    color: 'from-teal-400 to-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Community building and social good initiatives',
    topics: ['sustainability', 'parenting', 'dating', 'pets'],
    examples: ['Eco-Friendly Marketplace', 'Parent Support Network', 'Pet Care'],
    stats: { popularity: 78, trending: true }
  },
  'Travel': {
    icon: MapPin,
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Travel planning, booking, and experience sharing',
    topics: ['travel'],
    examples: ['Trip Planner', 'Travel Blog', 'Local Experiences'],
    stats: { popularity: 82, trending: false }
  },
  'Food': {
    icon: UtensilsCrossed,
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Culinary experiences, recipes, and food services',
    topics: ['food', 'cooking', 'recipes'],
    examples: ['Recipe Sharing', 'Meal Planning', 'Restaurant Reviews'],
    stats: { popularity: 90, trending: true }
  },
  'Technology': {
    icon: Laptop,
    color: 'from-indigo-400 to-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Tech solutions, tools, and digital innovation',
    topics: ['technology', 'photography'],
    examples: ['SaaS Platform', 'Photo Editor', 'Dev Tools'],
    stats: { popularity: 96, trending: true }
  },
  'Local Services': {
    icon: Users,
    color: 'from-pink-400 to-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Community services and local business solutions',
    topics: ['home improvement', 'gardening', 'sports', 'fashion'],
    examples: ['Home Services', 'Local Sports League', 'Fashion Marketplace'],
    stats: { popularity: 75, trending: false }
  }
};

const TopicTiles = ({ selectedCategory, onCategorySelect, onTopicSelect, className = "" }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity', 'trending', 'alphabetical'

  const sortedCategories = Object.entries(TOPIC_TILES_DATA).sort((a, b) => {
    const [nameA, dataA] = a;
    const [nameB, dataB] = b;

    switch (sortBy) {
      case 'popularity':
        return dataB.stats.popularity - dataA.stats.popularity;
      case 'trending':
        return (dataB.stats.trending ? 1 : 0) - (dataA.stats.trending ? 1 : 0);
      case 'alphabetical':
        return nameA.localeCompare(nameB);
      default:
        return 0;
    }
  });

  const handleCategoryClick = (categoryName) => {
    onCategorySelect?.(categoryName);
  };

  const handleTopicClick = (topic) => {
    onTopicSelect?.(topic);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Explore Topics & Themes</h3>
          <Badge variant="secondary" className="text-xs">
            {Object.keys(TOPIC_TILES_DATA).length} categories
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="popularity">Sort by Popularity</option>
            <option value="trending">Sort by Trending</option>
            <option value="alphabetical">Sort Alphabetically</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none px-3"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tiles Grid/List */}
      <div className={viewMode === 'grid'
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
      }>
        {sortedCategories.map(([categoryName, categoryData]) => {
          const IconComponent = categoryData.icon;
          const isSelected = selectedCategory === categoryName;

          return (
            <Card
              key={categoryName}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-xl ${
                isSelected
                  ? 'ring-2 ring-blue-500 shadow-lg scale-105'
                  : 'hover:scale-102'
              } ${categoryData.borderColor} ${viewMode === 'list' ? 'md:flex md:items-center' : ''}`}
              onClick={() => handleCategoryClick(categoryName)}
            >
              <div className={`${categoryData.bgColor} ${viewMode === 'list' ? 'md:w-20 md:flex-shrink-0' : ''} p-6 ${viewMode === 'grid' ? 'rounded-t-lg' : 'rounded-l-lg md:rounded-l-lg md:rounded-t-none'}`}>
                <div className="flex items-center justify-center">
                  <div className={`p-4 rounded-full bg-gradient-to-br ${categoryData.color} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <CardContent className={`p-6 flex-1 ${viewMode === 'list' ? 'md:py-4' : ''}`}>
                <div className="space-y-3">
                  {/* Title and Stats */}
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {categoryName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {categoryData.stats.trending && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 fill-current text-yellow-500" />
                        {categoryData.stats.popularity}%
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {categoryData.description}
                  </p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2">
                    {categoryData.topics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="outline"
                        className="text-xs capitalize hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTopicClick(topic);
                        }}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  {/* Examples */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Popular Ideas:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categoryData.examples.map((example, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {categoryData.topics.length} topics available
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                      >
                        Explore <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TopicTiles;