import { useState, useMemo } from 'react';
import { BookA, Search, ArrowLeft, Lightbulb, User, MessageSquareQuote } from 'lucide-react';
import { glossaryTerms, type GlossaryTerm } from './glossaryData';

/**
 * A searchable glossary covering the financial and mathematical concepts
 * underlying the simulator.
 */
export function Glossary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const filteredTerms = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return glossaryTerms.filter(item =>
      item.term.toLowerCase().includes(query) ||
      item.definition.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  if (selectedTerm) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12 h-full animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Header Navigation */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <button
            onClick={() => setSelectedTerm(null)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Glossary
          </button>
        </div>

        {/* Term Header */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-8 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <BookA size={120} />
          </div>
          <div className="flex flex-col gap-3 relative z-10">
            <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
              {selectedTerm.category}
            </span>
            <h2 className="text-3xl font-bold text-zinc-100">{selectedTerm.term}</h2>
            <p className="text-lg text-zinc-300 font-medium leading-relaxed max-w-3xl">
              {selectedTerm.definition}
            </p>
          </div>
        </div>

        {/* Deep Dive Content */}
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Deeper Meaning
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              {selectedTerm.deepDive.meaning}
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-emerald-400" />
              Real-World Analogy
            </h3>
            <p className="text-zinc-400 leading-relaxed italic border-l-2 border-emerald-500/30 pl-4">
              "{selectedTerm.deepDive.analogy}"
            </p>
          </div>

          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-purple-200 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              How Agents Use This
            </h3>
            <p className="text-purple-200/70 leading-relaxed">
              {selectedTerm.deepDive.agentUsage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12 h-full">
      {/* Header & Search */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 flex flex-col gap-6 shrink-0">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <BookA className="w-6 h-6 text-purple-400" />
            Quant Glossary
          </h3>
          <p className="text-zinc-400">
            A comprehensive dictionary of the jargon, mathematical concepts, and financial terminology used throughout the MARL Synthetic Economy. Click on any term to explore its deeper meaning, real-world analogies, and how the AI agents actually use it.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg leading-5 bg-zinc-950/50 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all sm:text-sm"
            placeholder="Search for terms, definitions, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin flex flex-col gap-4">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedTerm(item)}
              className="text-left bg-zinc-900/30 border border-white/5 rounded-lg p-5 flex flex-col gap-2 hover:bg-zinc-900/60 hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <h4 className="text-lg font-bold text-zinc-200 group-hover:text-purple-300 transition-colors">{item.term}</h4>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {item.category}
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                {item.definition}
              </p>
              <div className="mt-2 text-xs font-semibold text-purple-400/70 group-hover:text-purple-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to explore deep dive <ArrowLeft className="w-3 h-3 rotate-180" />
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-3">
            <Search className="h-8 w-8 opacity-50" />
            <p>No terms found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
