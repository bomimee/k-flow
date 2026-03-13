"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ModernNavigation from '@/app/components/ModernNavigation';
import type { VocabularyItem } from '@/app/types/vocabulary';
import { TTMIK_LEVELS, TTMIKLevel } from '@/app/types/level';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import GrammarLessonModal from '@/app/components/GrammarLessonModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function WeeklyStudyPlanPage() {
  const { level, week } = useParams();
  const searchParams = useSearchParams();
  const vocabCount = parseInt(searchParams.get('vocab') || '20', 10);
  const grammarCount = parseInt(searchParams.get('grammar') || '2', 10);

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [grammarPoints, setGrammarPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const pdfPrintRef = useRef<HTMLDivElement>(null);

  // Grammar Modal State
  const [isGrammarModalOpen, setIsGrammarModalOpen] = useState(false);
  const [selectedGrammar, setSelectedGrammar] = useState<string | null>(null);

  useEffect(() => {
    // Fetch random vocabulary according to count and level
    const fetchStudyData = async () => {
      try {
        const weekNum = parseInt(week as string, 10) || 1;
        
        // Fetch Vocab
        const vocabRes = await fetch(`${API_BASE_URL}/api/vocabulary?level=${level}&limit=${vocabCount}&week=${weekNum}`);
        if (vocabRes.ok) {
          const vocabData = await vocabRes.json();
          setVocabulary(vocabData);
        }
        
        // Fetch Actual Grammar from DB
        const grammarRes = await fetch(`${API_BASE_URL}/api/grammar?level=${level}`);
        if (grammarRes.ok) {
            const grammarData = await grammarRes.json();
            const titles = grammarData.map((g: any) => g.title);
            
            // Calculate indices to show based on week
            const numPoints = grammarCount;
            const startIndex = Math.max(0, (weekNum - 1) * numPoints) % Math.max(1, titles.length);
            const selectedPoints = titles.slice(startIndex, startIndex + numPoints);
            
            if (selectedPoints.length === 0 && titles.length > 0) {
              setGrammarPoints([titles[0]]);
            } else {
              setGrammarPoints(selectedPoints);
            }
        }
      } catch (err) {
        console.error("Failed to fetch study data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudyData();
  }, [level, week, vocabCount, grammarCount]);

  const parsedLevel = parseInt(level as string, 10) as TTMIKLevel;

  const handleDownloadPDF = async () => {
    if (!pdfPrintRef.current) return;
    setDownloading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const pageElements = pdfPrintRef.current.querySelectorAll('.pdf-page-element');
      
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`K_Flow_Level_${level}_Week_${week}_Plan.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  // Chunk vocabulary for PDF (First page has title/grammar, so it holds fewer items)
  const VOCAB_PER_PAGE_FIRST = 5;
  const VOCAB_PER_PAGE_REST = 7;
  const vocabPages = [];

  if (vocabulary.length > 0) {
    vocabPages.push(vocabulary.slice(0, VOCAB_PER_PAGE_FIRST));
    let remaining = vocabulary.slice(VOCAB_PER_PAGE_FIRST);
    while (remaining.length > 0) {
      vocabPages.push(remaining.slice(0, VOCAB_PER_PAGE_REST));
      remaining = remaining.slice(VOCAB_PER_PAGE_REST);
    }
  } else {
    vocabPages.push([]); // Ensure at least one page
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ModernNavigation />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Level {level} - Week {week} Study Plan
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Master these vocabulary words and grammar points this week.
            </p>
          </div>
          <button 
            onClick={handleDownloadPDF}
            disabled={loading || downloading}
            className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wide shadow-md transition-all hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="text-xl">📄</span>
            )}
            Download PDF
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
              <span className="text-blue-500">🧩</span> Grammar Points
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grammarPoints.map((gp, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    setSelectedGrammar(gp);
                    setIsGrammarModalOpen(true);
                  }}
                  className="bg-gray-50 border border-gray-100 p-4 rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{gp}</h3>
                  <p className="text-gray-500 text-sm mt-1">Study and practice this topic (Click to open lesson)</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-green-500">📚</span> Weekly Vocabulary
              </h2>
              <p className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Interactive: Hover to reveal meaning
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : vocabulary.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vocabulary.map((vocab, i) => (
                  <div 
                    key={vocab.id || i}
                    className="group border border-gray-100 rounded-xl p-5 hover:border-blue-200 transition-colors shadow-sm cursor-pointer relative overflow-hidden bg-white"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                        {vocab.partOfSpeech || vocab.category || "Vocabulary"}
                      </div>
                      {vocab.hanja && (
                        <span className="text-gray-400 text-sm font-medium">{vocab.hanja}</span>
                      )}
                    </div>

                    <div className="mb-4">
                      <h3 className="text-3xl font-black text-gray-900 mb-1">{vocab.korean}</h3>
                      <p className="text-sm text-gray-400 font-mono tracking-wide">[{vocab.pronunciation}]</p>
                    </div>

                    {/* Word Reveal Hover Effect container */}
                    <div className="relative mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      {/* Placeholder hint text */}
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-400 group-hover:opacity-0 transition-opacity duration-300">
                        Hover to reveal
                      </div>
                      
                      {/* Actual blurred content */}
                      <div className="blur-md opacity-20 group-hover:blur-none group-hover:opacity-100 transition-all duration-300">
                        <p className="text-gray-800 font-bold mb-1 text-lg">{vocab.meaning}</p>
                        {vocab.exampleSentence && (
                          <div className="text-sm">
                            <p className="text-gray-700">{vocab.exampleSentence}</p>
                            <p className="text-gray-500 italic mt-0.5">{vocab.exampleTranslation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-500">No words found for this level. Increase your level or retry!</p>
              </div>
            )}
          </div>
          
        </div>
      </main>

      {/* Hidden Printable Notebook Template for PDF Generation */}
      <div className="fixed top-[-9999px] left-[-9999px] z-[-1] pointer-events-none flex flex-col gap-10">
        <div ref={pdfPrintRef}>
          {vocabPages.map((pageVocab, pageIndex) => (
            <div 
              key={pageIndex} 
              className="pdf-page-element bg-white p-12 text-black font-sans w-[800px] h-[1131px] flex flex-col justify-start mb-8 shadow-sm"
            >
              {pageIndex === 0 && (
                <>
                  {/* Notebook Header */}
                  <div className="flex justify-between items-end border-b-4 border-gray-800 pb-4 mb-8 shrink-0">
                    <h1 className="text-4xl font-extrabold tracking-tight">K-Flow Study Note</h1>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-700">Level {level} - Week {week}</p>
                      <p className="text-sm text-gray-500 mt-1">Date: ____________</p>
                    </div>
                  </div>

                  {/* Grammar Section */}
                  <div className="mb-10 shrink-0">
                    <h2 className="text-xl font-bold bg-gray-100 px-4 py-2 inline-block mb-4 border-l-4 border-gray-800 tracking-wide uppercase">
                      Grammar Points
                    </h2>
                    <div className="space-y-3">
                      {grammarPoints.map((gp, i) => (
                        <div key={i} className="flex gap-4 items-start text-lg">
                          <span className="font-bold text-gray-400">{i + 1}.</span>
                          <span className="text-gray-800 border-b border-dashed border-gray-300 flex-1 pb-1">{gp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Vocabulary Section */}
              <div className="flex-1">
                {pageIndex === 0 && (
                  <h2 className="text-xl font-bold bg-gray-100 px-4 py-2 inline-block mb-4 border-l-4 border-gray-800 tracking-wide uppercase">
                    Vocabulary List
                  </h2>
                )}
                <div className="space-y-6">
                  {pageVocab.map((vocab, i) => (
                    <div key={i} className="border-b border-gray-200 pb-5">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-2xl font-black text-black">{vocab.korean}</span>
                        <span className="text-gray-500 font-mono tracking-widest text-sm">[{vocab.pronunciation}]</span>
                        <span className="text-lg text-gray-800 font-medium ml-2">- {vocab.meaning}</span>
                      </div>
                      {vocab.exampleSentence && (
                        <div className="pl-4 border-l-4 border-indigo-200 bg-indigo-50/50 p-3 text-gray-700 text-sm mt-2 rounded-r-lg">
                          <p className="font-bold text-indigo-900 mb-1">{vocab.exampleSentence}</p>
                          <p className="italic text-gray-600">{vocab.exampleTranslation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer text: Page number */}
              <div className="mt-auto pt-6 border-t border-gray-200 text-center font-bold text-gray-400 uppercase tracking-widest text-sm shrink-0">
                Page {pageIndex + 1} of {vocabPages.length}
              </div>
            </div>
          ))}
        </div>
      </div>

      <GrammarLessonModal 
        isOpen={isGrammarModalOpen}
        onClose={() => setIsGrammarModalOpen(false)}
        grammarTitle={selectedGrammar}
      />
    </div>
  );
}
