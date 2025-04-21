import React from 'react';
import { NewspaperIcon, GithubIcon, TwitterIcon, LinkedinIcon } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <NewspaperIcon className="h-7 w-7 text-primary-400" />
              <span className="ml-2 text-xl font-bold">AdyaNews</span>
            </div>
            <p className="text-neutral-400 max-w-md">
              Stay informed with the latest news from around the world, 
              personalized for your interests and delivered in a beautiful, 
              easy-to-read format.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  <TwitterIcon className="h-5 w-5" />
                </a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  <GithubIcon className="h-5 w-5" />
                </a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  <LinkedinIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-8 mt-8 text-center text-neutral-500 text-sm">
          <p>© {new Date().getFullYear()} AdyaNews. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;