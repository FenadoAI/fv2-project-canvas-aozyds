import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import axios from "axios";
import IdeaGenerator from "./components/IdeaGenerator";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Heart, Share } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

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
            <Button variant="ghost" size="sm" className="hover:text-red-500 hover:bg-red-50">
              <Heart className="w-4 h-4 mr-1" />
              {idea.upvotes}
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-blue-500 hover:bg-blue-50">
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-green-500 hover:bg-green-50">
              <Share className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    )}
  </Card>
);

const SharedIdeaPage = () => {
  const { shareHash } = useParams();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const response = await axios.get(`${API}/ideas/share/${shareHash}`);
        if (response.data.success) {
          setIdea(response.data.idea);
        }
      } catch (error) {
        console.error('Error fetching shared idea:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [shareHash]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading shared idea...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Idea not found</h2>
          <p className="mb-4">This shared idea doesn't exist or may have been removed.</p>
          <a href="/" className="text-blue-600 hover:underline">
            Go back to generator
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Shared Website Idea</h1>
        </div>
        <IdeaTile idea={idea} showActions={true} />
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-blue-600 hover:underline font-medium"
          >
            ← Generate more ideas
          </a>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return <IdeaGenerator />;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/idea/:shareHash" element={<SharedIdeaPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
