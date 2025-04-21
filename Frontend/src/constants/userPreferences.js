import { MonitorIcon, BriefcaseIcon, HeartPulseIcon, FlaskConicalIcon, TreesIcon as TreeIcon, RocketIcon, TrendingUpIcon } from 'lucide-react';

// Standard language options throughout the app
export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'de', label: 'German' },
  { id: 'it', label: 'Italian' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'ru', label: 'Russian' },
  { id: 'zh', label: 'Chinese' },
  { id: 'ja', label: 'Japanese' },
  { id: 'ko', label: 'Korean' },
  { id: 'ar', label: 'Arabic' },
  { id: 'hi', label: 'Hindi' },
];

// Standard interest options throughout the app
export const INTERESTS = [
  { id: 'technology', label: 'Technology', icon: MonitorIcon },
  { id: 'business', label: 'Business', icon: BriefcaseIcon },
  { id: 'health', label: 'Health', icon: HeartPulseIcon },
  { id: 'science', label: 'Science', icon: FlaskConicalIcon },
  { id: 'environment', label: 'Environment', icon: TreeIcon },
  { id: 'space', label: 'Space', icon: RocketIcon },
  { id: 'economy', label: 'Economy', icon: TrendingUpIcon },
];