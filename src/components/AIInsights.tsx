import React, { useMemo } from 'react';
import { Network, BookOpen, Heart, Sparkles, Lightbulb, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '../lib/language-context';

interface AIInsightsProps {
  content: string;
}

interface ParsedSection {
  title: string;
  body: string;
  type: 'connections' | 'theology' | 'application' | 'general';
  parts: Array<{ type: 'text'; value: string } | { type: 'citation'; value: string }>;
}

const AIInsights: React.FC<AIInsightsProps> = ({ content }) => {
  const { t } = useLanguage();

  const splitCitations = (text: string): ParsedSection['parts'] => {
    const rawParts = text.split(/(\[\d+\])/g);
    return rawParts
      .filter(part => part.length > 0)
      .map(part => {
        if (/^\[\d+\]$/.test(part)) {
          return { type: 'citation', value: part.replace(/[\[\]]/g, '') };
        }
        return { type: 'text', value: part };
      });
  };

  const parseContent = (text: string): ParsedSection[] => {
      const headerRegex = /((?:Connections|Theological Significance|A Call for You|Powiązania|Znaczenie Teologiczne|Wezwanie dla Ciebie):?)/gi;
      const isHeader = (str: string) => /^(?:Connections|Theological Significance|A Call for You|Powiązania|Znaczenie Teologiczne|Wezwanie dla Ciebie):?$/i.test(str.trim());
      
      const parts = text.split(headerRegex).filter(p => p.trim());
      const sections: ParsedSection[] = [];

      let i = 0;
      while (i < parts.length) {
          const part = parts[i].trim();
          
          if (isHeader(part)) {
              const title = part.replace(/:$/, '').trim();
              let body = '';
              if (i + 1 < parts.length && !isHeader(parts[i+1])) {
                  body = parts[i+1].trim();
                  i++; // skip next as it is the body
              }
              
              let type: ParsedSection['type'] = 'general';
              const h = title.toLowerCase();
              if (h.includes('connections') || h.includes('powiązania')) type = 'connections';
              else if (h.includes('theological') || h.includes('znaczenie teologiczne')) type = 'theology';
              else if (h.includes('call for you') || h.includes('wezwanie')) type = 'application';

              if (body) {
                // Strip leading meaningless punctuation like bullets from the body
                const cleanBody = body.replace(/^[\*\s-]+/, '');
                sections.push({ title, body: cleanBody, type, parts: splitCitations(cleanBody) });
              }
          } else {
              // Ignore parts that are just markdown bullets or whitespace
              if (part && !/^[\*\s-]+$/.test(part)) {
                  const cleanPart = part.replace(/^[\*\s-]+/, '');
                  sections.push({ 
                      title: t?.main?.aiInsight || 'Spostrzeżenie AI', 
                      body: cleanPart, 
                      type: 'general', 
                      parts: splitCitations(cleanPart) 
                  });
              }
          }
          i++;
      }
      
      if (sections.length === 0 && text.trim()) {
           return [{ title: t?.main?.aiInsight || 'Przewidywana odpowiedź', body: text, type: 'general', parts: splitCitations(text) }];
      }
      return sections;
  };

  const sections = useMemo(() => parseContent(content), [content]);

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
              {section.parts.map((part, index) => {
                if (part.type === 'citation') {
                  return (
                    <sup key={index} className="inline-flex items-center justify-center w-5 h-5 ml-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 rounded-full border border-slate-200 cursor-pointer hover:bg-indigo-100 hover:text-indigo-600 hover:border-indigo-200 transition-colors -translate-y-1">
                      {part.value}
                    </sup>
                  );
                }
                return <span key={index}>{part.value}</span>;
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AIInsights;
