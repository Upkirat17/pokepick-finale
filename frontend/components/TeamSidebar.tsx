'use client';

import React, { useState, useEffect } from 'react';

interface TeamPokemon {
  id: number;
  name: string;
  image: string;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    'special-attack': number;
    'special-defense': number;
    speed: number;
  };
  moves: string[];
}

export default function TeamSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [team, setTeam] = useState<TeamPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team from backend
  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/team');
      if (!response.ok) throw new Error('Failed to fetch team');
      const data = await response.json();
      setTeam(data.team || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  // Remove Pokémon from team
  const removeFromTeam = async (id: number) => {
    try {
      const response = await fetch('http://localhost:4000/api/team/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to remove Pokémon');
      const data = await response.json();
      setTeam(data.team || []);
      // Notify other components
      window.dispatchEvent(new CustomEvent('teamUpdated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove Pokémon');
    }
  };

  // Clear entire team
  const clearTeam = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/team/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to clear team');
      const data = await response.json();
      setTeam(data.team || []);
      // Notify other components
      window.dispatchEvent(new CustomEvent('teamUpdated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear team');
    }
  };

  // Load team on mount
  useEffect(() => {
    fetchTeam();
    
    // Listen for team updates from other components
    const handleTeamUpdate = () => {
      fetchTeam();
    };
    
    window.addEventListener('teamUpdated', handleTeamUpdate);
    
    return () => {
      window.removeEventListener('teamUpdated', handleTeamUpdate);
    };
  }, []);

  return (
    <aside className={`bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 ${collapsed ? 'w-14' : 'w-72'} flex flex-col min-h-screen shadow-lg relative`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <span className={`font-bold text-lg text-gray-800 dark:text-white transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>My Team</span>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-300 ${collapsed ? 'absolute left-1/2 transform -translate-x-1/2' : 'ml-2'}`}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          )}
        </button>
      </div>
      <div className={`flex-1 p-4 transition-opacity duration-300 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm mb-2">{error}</div>
        ) : team.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center">Your team is empty.</div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {team.length}/6 Pokémon
            </div>
            {team.map((pokemon) => (
              <div key={pokemon.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={pokemon.image || '/placeholder.png'}
                      alt={pokemon.name}
                      className="w-8 h-8 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.png';
                      }}
                    />
                    <span className="font-medium text-sm capitalize text-gray-800 dark:text-white">
                      {pokemon.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromTeam(pokemon.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    title="Remove from team"
                  >
                    ×
                  </button>
                </div>
                <div className="flex gap-1 mb-2">
                  {pokemon.types.map((type, index) => (
                    <span
                      key={index}
                      className="text-xs px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 uppercase"
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div className="font-medium mb-1">Moves:</div>
                  <div className="space-y-1">
                    {pokemon.moves.map((move, index) => (
                      <div key={index} className="capitalize">{move}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {team.length > 0 && (
              <button
                onClick={clearTeam}
                className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded-lg transition-colors"
              >
                Clear Team
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
} 