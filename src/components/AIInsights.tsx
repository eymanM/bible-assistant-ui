import React from 'react';
import { Network, BookOpen, Heart, Sparkles, Lightbulb, Link as LinkIcon } from 'lucide-react';

interface AIInsightsProps {
  content: string;
}

interface ParsedSection {
  title: string;
  body: string;
  type: 'connections' | 'theology' | 'application' | 'general';
}

const AIInsights: React.FC<AIInsightsProps> = ({ content }) => {
  // Parsing logic for [1], [2] citations
  const renderWithCitations = (text: string) => {
    // Regex to match [number]
    const parts = text.split(/(\[\d+\])/g);
    
    return parts.map((part, index) => {
      if (part.match(/^\[\d+\]$/)) {
        const num = part.replace(/[\[\]]/g, '');
        return (
          <sup key={index} className="inline-flex items-center justify-center w-5 h-5 ml-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 rounded-full border border-slate-200 cursor-pointer hover:bg-indigo-100 hover:text-indigo-600 hover:border-indigo-200 transition-colors -translate-y-1">
            {num}
          </sup>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const parseContent = (text: string): ParsedSection[] => {
      const headerRegex = /((?:Connections|Theological Significance|A Call for You|Powiązania|Znaczenie Teologiczne|Wezwanie dla Ciebie):)/gi;
      const parts = text.split(headerRegex).filter(p => p.trim());
      const sections: ParsedSection[] = [];

      for (let i = 0; i < parts.length; i += 2) {
        const header = parts[i]?.trim();
        let body = parts[i + 1]?.trim();
        if (header && body) {
             let type: ParsedSection['type'] = 'general';
             const h = header.toLowerCase();
             if (h.includes('connections') || h.includes('powiązania')) type = 'connections';
             else if (h.includes('theological') || h.includes('znaczenie teologiczne')) type = 'theology';
             else if (h.includes('call for you') || h.includes('wezwanie')) type = 'application';

             sections.push({ title: header.replace(':', ''), body, type });
        }
      }
      
      if (sections.length === 0 && text.trim()) {
           return [{ title: 'Przewidywana odpowiedź', body: text, type: 'general' }];
      }
      return sections;
  };

  const sections = parseContent(content);

  if (sections.length === 0) return null;

  const getSectionStyle = (type: ParsedSection['type']) => {
    switch (type) {
      case 'connections':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          icon: LinkIcon, 
        };
      case 'theology':
        return {
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          icon: BookOpen,
        };
      case 'application':
        return {
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          icon: Heart,
        };
      default:
        return {
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
          icon: Sparkles,
        };
    }
  };

  return (
    <div className="space-y-6 w-full">
      {sections.map((section, idx) => {
        const style = getSectionStyle(section.type);
        const Icon = style.icon;
        
        return (
          <div key={idx} className="group">
            <h3 className={`flex items-center gap-2 font-semibold text-sm md:text-base ${style.iconColor} mb-2`}>
              <span className={`p-1.5 rounded-lg ${style.iconBg} inline-flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4`} />
              </span>
              {section.title}
            </h3>
            <p className="text-slate-700 leading-relaxed text-base md:text-base whitespace-pre-wrap break-words pl-0.5">
              {renderWithCitations(section.body)}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AIInsights;
