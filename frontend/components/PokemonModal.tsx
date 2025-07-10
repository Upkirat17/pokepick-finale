import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface PokemonModalProps {
  pokemon: any;
  onClose: () => void;
}

const statColors: { [key: string]: string } = {
  hp: 'bg-pink-400',
  attack: 'bg-red-500',
  defense: 'bg-blue-500',
  'special-attack': 'bg-purple-500',
  'special-defense': 'bg-green-500',
  speed: 'bg-yellow-500',
};

const statLabels: { [key: string]: string } = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
};

const typeColors: { [key: string]: string } = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-cyan-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-green-400',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
};

export default function PokemonModal({ pokemon, onClose }: PokemonModalProps) {
  if (!pokemon) return null;

  // State for region and generation
  const [generation, setGeneration] = useState<string | null>(null);

  // Fetch region and generation info
  useEffect(() => {
    let isMounted = true;
    async function fetchRegionAndGen() {
      // Get species info
      const speciesRes = await fetch(pokemon.species.url);
      if (!speciesRes.ok) return;
      const speciesData = await speciesRes.json();
      if (!isMounted) return;
      setGeneration(speciesData.generation?.name ? speciesData.generation.name.replace('generation-', 'Gen ').toUpperCase() : null);
    }
    fetchRegionAndGen();
    return () => { isMounted = false; };
  }, [pokemon]);

  // Only show front default and shiny sprites
  const spriteList = [
    { label: 'Front Default', url: pokemon.sprites.front_default },
    { label: 'Front Shiny', url: pokemon.sprites.front_shiny },
  ].filter(s => s.url);

  // State for selected sprite
  const [selectedSprite, setSelectedSprite] = useState(spriteList[0]);

  const safeSprite = (url: string | undefined) => url || '/placeholder.png';

  // Extract all stats
  const stats: { [key: string]: number } = {};
  pokemon.stats.forEach((s: any) => {
    stats[s.stat.name] = s.base_stat;
  });

  // Moves selection state
  const [selectedMoves, setSelectedMoves] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMoveToggle = (move: string) => {
    setSelectedMoves((prev) =>
      prev.includes(move)
        ? prev.filter((m) => m !== move)
        : prev.length < 4
        ? [...prev, move]
        : prev
    );
  };

  const handleAddToTeam = async () => {
    if (selectedMoves.length !== 4) {
      setError('Select exactly 4 moves.');
      return;
    }
    setError(null);
    setAdding(true);
    
    try {
      console.log('Adding Pokémon to team:', pokemon.name);
      console.log('Selected moves:', selectedMoves);
      
      const pokemonWithMoves = {
        ...pokemon,
        moves: selectedMoves,
        stats: {
          hp: pokemon.stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 0,
          attack: pokemon.stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 0,
          defense: pokemon.stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 0,
          'special-attack': pokemon.stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat || 0,
          'special-defense': pokemon.stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat || 0,
          speed: pokemon.stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 0,
        },
        image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
      };

      console.log('Sending request to backend...');
      const response = await fetch('http://localhost:4000/api/team/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemon: pokemonWithMoves }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        throw new Error(errorData.error || 'Failed to add Pokémon to team');
      }

      const result = await response.json();
      console.log('Success! Team updated:', result);

      // Close modal on success
      onClose();
      
      // Notify other components that team was updated
      window.dispatchEvent(new CustomEvent('teamUpdated'));

    } catch (err) {
      console.error('Error adding to team:', err);
      setError(err instanceof Error ? err.message : 'Failed to add Pokémon to team');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-3xl w-full p-6 relative overflow-y-auto max-h-[90vh] flex flex-col md:flex-row gap-8 border border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        {/* Left: Sprite and thumbnails */}
        <div className="flex flex-col items-center md:w-1/3 w-full">
          <Image
            src={safeSprite(selectedSprite.url)}
            alt={pokemon.name + ' sprite'}
            width={220}
            height={220}
            className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300 mt-1 mb-2">{selectedSprite.label}</span>
          <div className="flex flex-wrap gap-4 justify-center w-full">
            {spriteList.map((sprite, i) => (
              <button
                key={i}
                onClick={() => setSelectedSprite(sprite)}
                className={`flex flex-col items-center w-16 focus:outline-none ${selectedSprite.url === sprite.url ? 'ring-2 ring-blue-500' : ''}`}
                tabIndex={0}
                aria-label={sprite.label}
              >
                <Image
                  src={safeSprite(sprite.url)}
                  alt={pokemon.name + ' sprite'}
                  width={64}
                  height={64}
                  className="bg-gray-100 dark:bg-gray-800 rounded"
                />
                <span className="text-[10px] text-gray-600 dark:text-gray-300 text-center mt-1 break-words">
                  {sprite.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        {/* Right: Info */}
        <div className="flex flex-col gap-4 md:w-2/3 w-full">
          <h2 className="text-2xl font-bold capitalize text-gray-900 dark:text-white mb-2">
            {pokemon.name} <span className="text-gray-500">#{pokemon.id}</span>
          </h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {pokemon.types.map((t: any, i: number) => (
              <span
                key={i}
                className={`${typeColors[t.type.name] || 'bg-gray-400'} text-white px-2 py-1 rounded-full text-xs font-semibold uppercase`}
              >
                {t.type.name}
              </span>
            ))}
          </div>
          {/* Stats */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">Stats</h3>
            <div className="space-y-2">
              {Object.keys(statLabels).map((key) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-16">{statLabels[key]}</span>
                  <div className="flex-1 mx-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`${statColors[key] || 'bg-gray-400'} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${((stats[key] || 0) / 255) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-800 dark:text-white w-8 text-right">
                    {stats[key] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Moveset with selection */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">Select 4 Moves</h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {pokemon.moves.slice(0, 24).map((move: any, i: number) => {
                const moveName = move.move.name;
                const selected = selectedMoves.includes(moveName);
                return (
                  <button
                    key={i}
                    onClick={() => handleMoveToggle(moveName)}
                    className={`px-2 py-1 rounded text-xs capitalize border ${selected ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'} ${selectedMoves.length === 4 && !selected ? 'opacity-50 pointer-events-none' : ''}`}
                    disabled={adding}
                  >
                    {moveName}
                  </button>
                );
              })}
              {pokemon.moves.length === 0 && <span className="text-gray-500">No moves found.</span>}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{selectedMoves.length} / 4 selected</div>
            {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
          </div>
          {/* Add to Team Button */}
          <button
            onClick={handleAddToTeam}
            disabled={adding || selectedMoves.length !== 4}
            className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? 'Adding...' : 'Add to Team'}
          </button>
          {/* Moveset */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">Moveset</h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {pokemon.moves.slice(0, 24).map((move: any, i: number) => (
                <span key={i} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs capitalize">
                  {move.move.name}
                </span>
              ))}
              {pokemon.moves.length === 0 && <span className="text-gray-500">No moves found.</span>}
            </div>
          </div>
          {/* Other info */}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-200">
            <div><span className="font-semibold">Height:</span> {pokemon.height / 10} m</div>
            <div><span className="font-semibold">Weight:</span> {pokemon.weight / 10} kg</div>
            <div className="col-span-2"><span className="font-semibold">Abilities:</span> {pokemon.abilities.map((a: any) => a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1)).join(', ')}</div>
            <div><span className="font-semibold">Generation:</span> {generation || 'Unknown'}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 