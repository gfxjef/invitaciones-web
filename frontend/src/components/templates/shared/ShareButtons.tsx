/**
 * Share Buttons Component
 *
 * WHY: Reusable share functionality that can be used across different templates
 * with customizable styling and share options.
 */

'use client';

import { useState } from 'react';
import { Share2, Copy, MessageCircle } from 'lucide-react';
import { ShareButtonsProps } from '@/types/template';

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  data,
  colors,
  url,
  title,
  description,
  hashtag,
  className = ''
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: description,
        url,
      });
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowShareMenu(false);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareToWhatsApp = () => {
    const message = `${title} ${description ? `- ${description}` : ''} ${url} ${hashtag ? hashtag : ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToTwitter = () => {
    const tweetText = `${title} ${description ? `- ${description}` : ''} ${hashtag ? hashtag : ''}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleShare}
        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        style={{
          backgroundColor: `${colors.primary}20`,
          backdropFilter: 'blur(8px)'
        }}
      >
        <Share2 className="w-5 h-5" style={{ color: colors.text }} />
      </button>

      {showShareMenu && (
        <div
          className="absolute top-14 left-0 bg-white rounded-lg shadow-lg p-2 min-w-[200px] z-10"
          style={{ backgroundColor: colors.background }}
        >
          <button
            onClick={copyToClipboard}
            className="w-full text-left px-3 py-2 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors"
            style={{ color: colors.text }}
          >
            <Copy className="w-4 h-4" />
            {copied ? '¡Copiado!' : 'Copiar enlace'}
          </button>

          <button
            onClick={shareToWhatsApp}
            className="w-full text-left px-3 py-2 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors"
            style={{ color: colors.text }}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>

          <button
            onClick={shareToFacebook}
            className="w-full text-left px-3 py-2 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors"
            style={{ color: colors.text }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>

          <button
            onClick={shareToTwitter}
            className="w-full text-left px-3 py-2 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors"
            style={{ color: colors.text }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </button>
        </div>
      )}
    </div>
  );
};