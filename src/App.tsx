/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  Thermometer, 
  Building2, 
  RefreshCcw, 
  ArrowUpCircle, 
  Info,
  Maximize2,
  AlertTriangle,
  MoveUp,
  MapPin
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

import { Building3D } from './components/Building3D';
import { calculateStackEffect, SimulationParams, StackEffectResult } from './lib/physics';
import { getBalnearioWeather, WeatherData } from './lib/weatherService';

const DEFAULT_PARAMS: SimulationParams = {
  floors: 30,
  floorHeight: 3.2,
  tempIn: 22,
  tempOut: 28,
  windSpeed: 5,
  windAngle: 0,
  nplRatio: 0.4,
};

export default function App() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [results, setResults] = useState<StackEffectResult[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'simulation' | 'tech'>('simulation');

  const updateSimulation = useCallback(() => {
    const data = calculateStackEffect(params);
    setResults(data);
  }, [params]);

  const resetData = async () => {
    setLoading(true);
    const data = await getBalnearioWeather();
    setWeather(data);
    setParams(prev => ({
      ...DEFAULT_PARAMS,
      tempOut: data.temp,
      windSpeed: data.windSpeed,
      windAngle: data.windDirection,
    }));
    setLoading(false);
  };

  useEffect(() => {
    resetData();
  }, []);

  useEffect(() => {
    updateSimulation();
  }, [updateSimulation]);

  const maxTotalP = Math.max(...results.map(r => Math.abs(r.totalPressure)));
  const maxStackP = Math.max(...results.map(r => Math.abs(r.stackPressure)));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">STACK EFFECT PRO</h1>
              <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Balneário Camboriú • Real-Time Systems
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={resetData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-sm font-medium border border-white/10 disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Reset Simulation
            </button>
            <div className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              v2.4.0-rev · ASHRAE 2024
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Params & Monitoring */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Weather Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Meteorologia Local</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse delay-75" />
              </div>
            </div>
            {weather ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <Thermometer className="text-orange-400 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{weather.temp.toFixed(1)}°C</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Temp. Exterior</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="text-2xl font-bold">{weather.windSpeed.toFixed(1)} m/s</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Vento Real</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <Wind className="text-cyan-400 w-6 h-6" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-10 animate-pulse bg-white/5 rounded-lg" />
            )}
          </motion.div>

          {/* Configuration */}
          <section className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl space-y-6">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-2">
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              DIMENSIONAMENTO TÉCNICO
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Número de Pavimentos</span>
                  <span className="font-mono text-cyan-400">{params.floors}</span>
                </div>
                <input 
                  type="range" min="10" max="100" value={params.floors}
                  onChange={e => setParams(p => ({ ...p, floors: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Pé Direito Médio (m)</span>
                  <span className="font-mono text-cyan-400">{params.floorHeight.toFixed(1)}m</span>
                </div>
                <input 
                  type="range" min="2.5" max="5.0" step="0.1" value={params.floorHeight}
                  onChange={e => setParams(p => ({ ...p, floorHeight: parseFloat(e.target.value) }))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Temp. Interna (°C)</label>
                  <input 
                    type="number" value={params.tempIn}
                    onChange={e => setParams(p => ({ ...p, tempIn: parseFloat(e.target.value) }))}
                    className="bg-transparent text-xl font-bold w-full outline-none"
                  />
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Temp. Externa (°C)</label>
                  <input 
                    type="number" value={params.tempOut}
                    onChange={e => setParams(p => ({ ...p, tempOut: parseFloat(e.target.value) }))}
                    className="bg-transparent text-xl font-bold w-full outline-none"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Plano Neutro (NPL)</span>
                  <span className="font-mono text-cyan-400">{(params.nplRatio * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" value={params.nplRatio}
                  onChange={e => setParams(p => ({ ...p, nplRatio: parseFloat(e.target.value) }))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </section>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="text-[10px] text-slate-500 uppercase mb-1">P. Chaminé Máx</div>
              <div className="text-2xl font-bold">{maxStackP.toFixed(1)} <span className="text-xs font-normal opacity-50">Pa</span></div>
            </div>
            <div className={`p-4 rounded-xl border ${maxTotalP > 50 ? 'bg-red-500/10 border-red-500/20 animate-pulse' : 'bg-white/5 border-white/10'}`}>
              <div className="text-[10px] text-slate-500 uppercase mb-1">Pressão Resultante</div>
              <div className="text-2xl font-bold">{maxTotalP.toFixed(1)} <span className="text-xs font-normal opacity-50">Pa</span></div>
              {maxTotalP > 50 && (
                <div className="text-[8px] text-red-400 mt-1 font-bold flex items-center gap-1 uppercase">
                  <AlertTriangle className="w-2 h-2" /> Atenção: Crítico
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right: Visualization & Charts */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Visualization Tab */}
          <div className="bg-black/40 rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden flex flex-col h-full min-h-[600px]">
            <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
              <button 
                onClick={() => setActiveTab('simulation')}
                className={`text-sm font-bold pb-2 transition-all ${activeTab === 'simulation' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
              >
                PROJETOR 3D
              </button>
              <button 
                onClick={() => setActiveTab('tech')}
                className={`text-sm font-bold pb-2 transition-all ${activeTab === 'tech' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
              >
                ANÁLISE VETORIAL
              </button>
            </div>

            <div className="flex-1 p-6 relative">
              <AnimatePresence mode="wait">
                {activeTab === 'simulation' ? (
                  <motion.div 
                    key="sim"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full h-full"
                  >
                    <Building3D params={params} />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="tech"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full space-y-8"
                  >
                    <div className="h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={results}>
                          <defs>
                            <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis 
                            dataKey="height" 
                            label={{ value: 'Altura (m)', position: 'insideBottomRight', offset: -5, fill: '#64748b' }} 
                            stroke="#64748b"
                          />
                          <YAxis 
                             stroke="#64748b"
                             label={{ value: 'Pressão (Pa)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', borderRadius: '8px' }}
                            itemStyle={{ color: '#06b6d4' }}
                          />
                          <Area type="monotone" dataKey="totalPressure" stroke="#06b6d4" fillOpacity={1} fill="url(#colorP)" strokeWidth={3} />
                          <Line type="monotone" dataKey="stackPressure" stroke="#8b5cf6" strokeDasharray="5 5" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Alt. Plano Neutro</p>
                          <p className="text-xl font-mono text-cyan-400">{(params.floors * params.floorHeight * params.nplRatio).toFixed(1)}m</p>
                        </div>
                        <ArrowUpCircle className="w-10 h-10 text-cyan-500/20" />
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Contribuição do Vento</p>
                          <p className="text-xl font-mono text-purple-400">{Math.max(...results.map(r => Math.abs(r.windPressure))).toFixed(1)} Pa</p>
                        </div>
                        <Wind className="w-10 h-10 text-purple-500/20" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-[11px] leading-relaxed text-slate-400">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold mb-2">
                        <Info className="w-3 h-3" /> FÓRMULA DE CÁLCULO (ASHRAE)
                      </div>
                      <code className="block bg-black/40 p-2 rounded mb-2 text-cyan-200">
                        ΔPs = (ρo - ρi) · g · (h - h_npl)
                      </code>
                      O efeito chaminé é provocado pela diferença de densidade entre o ar externo (ρo) e interno (ρi). Em Balneário Camboriú, as altas temperaturas de verão invertem o fluxo (Reverse Stack), enquanto o vento de sudeste pressuriza as fachadas frontais.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 mt-12 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold">
            © 2026 Engine de Pressurização Estrutural
          </div>
          <div className="flex gap-8 text-[10px] font-mono">
            <span>LLM-POWERED SIMULATION</span>
            <span>DATA-DRIVEN DESIGN</span>
            <span>CRYSTAL PHYSICS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
