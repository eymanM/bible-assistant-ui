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
  const parseContent = (text: string): ParsedSection[] => {
    if (!text) return [];

    // Define markers for both languages
    // EN: Connections:, Theological Significance:, A Call for You:
    // PL: Powiązania:, Znaczenie Teologiczne:, Wezwanie dla Ciebie:
    
    // We will look for these headers. 
    // Since the structure is guaranteed to be 3 points, we can try to split by these headers.
    
    // Strategy: Split by known headers, capturing the header itself.
    // Regex to match one of the headers, case insensitive, at the start of a line.
    const headerRegex = /((?:Connections|Theological Significance|A Call for You|Powiązania|Znaczenie Teologiczne|Wezwanie dla Ciebie):)/gi;
    
    const parts = text.split(headerRegex).filter(p => p.trim());
    
    const sections: ParsedSection[] = [];
    
    for (let i = 0; i < parts.length; i += 2) {
      const header = parts[i]?.trim();
      let body = parts[i + 1]?.trim();
      
      if (header && body) {
        // Remove leading newline if present (per user request "if after point is enter, cut it")
        // .trim() handles whitespace, but let's be explicit if there are other artifacts.
        // Actually .trim() on the strings from split should be sufficient to remove surrounding newlines.
        
        // Determine type based on header content
        let type: ParsedSection['type'] = 'general';
        const h = header.toLowerCase();
        
        if (h.includes('connections') || h.includes('powiązania')) type = 'connections';
        else if (h.includes('theological') || h.includes('znaczenie teologiczne')) type = 'theology';
        else if (h.includes('call for you') || h.includes('wezwanie')) type = 'application';
        
        sections.push({
          title: header.replace(':', ''), // Remove colon for display title if desired, or keep it. Let's remove for cleaner look.
          body: body,
          type
        });
      }
    }
    
    // Fallback: If regex didn't find known headers (maybe prompt changed or partial response), 
    // treat as single block or try double newline split.
    if (sections.length === 0 && text.trim()) {
        const paragraphs = text.split(/\n\n+/);
        if (paragraphs.length === 3) {
             // Try to identify if they look like the expected 3 points even without exact headers matching regex
             // For now, simpler fallback: just valid text.
             // Or maybe we just display raw if parsing fails to avoid partial data loss.
             return [{ title: 'AI Insight', body: text, type: 'general' }];
        }
        return [{ title: 'AI Insight', body: text, type: 'general' }];
    }

    return sections;
  };

  const sections = parseContent(content);

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

  if (sections.length === 0) return null;

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
            <p className="text-slate-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap break-words pl-0.5">
              {section.body}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AIInsights;
