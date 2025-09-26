import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  Copy,
  Heart,
  Share,
  Sparkles,
  TrendingUp,
  Clock,
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

const IdeaGenerator = () => {
  const [currentIdea, setCurrentIdea] = useState(null);
  const [popularIdeas, setPopularIdeas] = useState([]);
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('generate'); // 'generate', 'popular', 'recent'

  useEffect(() => {
    loadPopularIdeas();
    loadRecentIdeas();
  }, []);

  const generateNewIdea = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/ideas/generate`);
      if (response.data.success) {
        setCurrentIdea(response.data.idea);
        toast({
          title: "New idea generated!",
          description: "A fresh website idea has been created for you.",
        });
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to generate idea",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating idea:', error);
      toast({
        title: "Error",
        description: "Failed to generate new idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const upvoteIdea = async (ideaId) => {
    try {
      const response = await axios.post(`${API}/ideas/${ideaId}/upvote`);
      if (response.data.success) {
        // Update current idea if it's the one being upvoted
        if (currentIdea && currentIdea.id === ideaId) {
          setCurrentIdea({ ...currentIdea, upvotes: response.data.upvotes });
        }

        // Update in popular/recent lists
        setPopularIdeas(prev =>
          prev.map(idea =>
            idea.id === ideaId
              ? { ...idea, upvotes: response.data.upvotes }
              : idea
          )
        );
        setRecentIdeas(prev =>
          prev.map(idea =>
            idea.id === ideaId
              ? { ...idea, upvotes: response.data.upvotes }
              : idea
          )
        );

        toast({
          title: "Upvoted!",
          description: "Thanks for supporting this idea!",
        });
      }
    } catch (error) {
      console.error('Error upvoting idea:', error);
      toast({
        title: "Error",
        description: "Failed to upvote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyIdea = async (ideaText) => {
    try {
      await navigator.clipboard.writeText(ideaText);
      toast({
        title: "Copied!",
        description: "Idea copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareIdea = (shareUrl) => {
    const fullUrl = `${window.location.origin}${shareUrl}`;
    if (navigator.share) {
      navigator.share({
        title: 'Website Idea',
        text: currentIdea?.idea_text,
        url: fullUrl,
      });
    } else {
      navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Share link copied!",
        description: "Share URL copied to clipboard",
      });
    }
  };

  const loadPopularIdeas = async () => {
    try {
      const response = await axios.get(`${API}/ideas/popular?limit=10`);
      if (response.data.success) {
        setPopularIdeas(response.data.ideas);
      }
    } catch (error) {
      console.error('Error loading popular ideas:', error);
    }
  };

  const loadRecentIdeas = async () => {
    try {
      const response = await axios.get(`${API}/ideas/recent?limit=10`);
      if (response.data.success) {
        setRecentIdeas(response.data.ideas);
      }
    } catch (error) {
      console.error('Error loading recent ideas:', error);
    }
  };

  const IdeaTile = ({ idea, showActions = true }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg leading-relaxed font-medium">
              {idea.idea_text}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {idea.topic}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {idea.theme}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      {showActions && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => upvoteIdea(idea.id)}
                className="hover:text-red-500 hover:bg-red-50"
              >
                <Heart className="w-4 h-4 mr-1" />
                {idea.upvotes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyIdea(idea.idea_text)}
                className="hover:text-blue-500 hover:bg-blue-50"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => shareIdea(idea.share_url)}
                className="hover:text-green-500 hover:bg-green-50"
              >
                <Share className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Lightbulb className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Website Idea Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get inspired with creative website concepts combining popular platforms with unique themes and niches.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1 bg-white rounded-full shadow-md">
            <Button
              variant={view === 'generate' ? 'default' : 'ghost'}
              onClick={() => setView('generate')}
              className="rounded-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </Button>
            <Button
              variant={view === 'popular' ? 'default' : 'ghost'}
              onClick={() => setView('popular')}
              className="rounded-full"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Popular
            </Button>
            <Button
              variant={view === 'recent' ? 'default' : 'ghost'}
              onClick={() => setView('recent')}
              className="rounded-full"
            >
              <Clock className="w-4 h-4 mr-2" />
              Recent
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {view === 'generate' && (
          <div className="space-y-8">
            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={generateNewIdea}
                disabled={loading}
                size="lg"
                className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Sparkles className="w-6 h-6 mr-2" />
                {loading ? 'Generating...' : 'Generate New Idea'}
              </Button>
            </div>

            {/* Current Idea */}
            {currentIdea && (
              <div className="max-w-2xl mx-auto">
                <IdeaTile idea={currentIdea} />
              </div>
            )}

            {/* Fenado CTA */}
            <div className="text-center">
              <Separator className="my-8" />
              <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-orange-200">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  Love your idea? Make it reality!
                </h3>
                <p className="text-gray-600 mb-4">
                  Turn your website concept into a live site with Fenado's AI-powered platform.
                </p>
                <Button
                  asChild
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <a
                    href="https://fenado.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Build with Fenado
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Popular Ideas */}
        {view === 'popular' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">Most Popular Ideas</h2>
            {popularIdeas.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {popularIdeas.map((idea) => (
                  <IdeaTile key={idea.id} idea={idea} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No ideas yet. Be the first to generate one!</p>
              </div>
            )}
          </div>
        )}

        {/* Recent Ideas */}
        {view === 'recent' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">Latest Ideas</h2>
            {recentIdeas.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {recentIdeas.map((idea) => (
                  <IdeaTile key={idea.id} idea={idea} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No recent ideas. Generate the first one!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaGenerator;