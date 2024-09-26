'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayIcon, PauseIcon, SkipForwardIcon } from "lucide-react";
import animals from "@/animals.json";

export function AnimalCardComponent() {
  const [currentAnimal, setCurrentAnimal] = useState(() => Math.floor(Math.random() * animals.length))
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const getRandomAnimal = useCallback(() => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * animals.length);
    } while (newIndex === currentAnimal && animals.length > 1);
    return newIndex;
  }, [currentAnimal]);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.src = animals[currentAnimal].sound;
      audioRef.current.play().catch(() => {
        console.error("Fehler beim Abspielen des Sounds");
      });
      
      // Setze einen Timer, um nach 4 Sekunden zum nächsten Tier zu wechseln
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(nextAnimal, 4000);
    }
  }, [currentAnimal]);

  const nextAnimal = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentAnimal(getRandomAnimal());
  }, [getRandomAnimal]);

  useEffect(() => {
    audioRef.current = new Audio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const playAndSetTimer = () => {
        if (audioRef.current) {
          audioRef.current.src = animals[currentAnimal].sound;
          audioRef.current.play().catch(() => {
            console.error("Fehler beim Abspielen des Sounds");
          });
        }
        
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(nextAnimal, 8000);
      };

      playAndSetTimer();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  }, [currentAnimal, isPlaying, nextAnimal]);

  const startParade = () => {
    setIsPlaying(true);
  }

  const stopParade = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }

  const skipToNextAnimal = () => {
    nextAnimal();
    if (isPlaying) {
      setTimeout(playSound, 0);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-repeat" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2V6h4V4H6zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}} 
    >
      <Card className="w-[350px] bg-gradient-to-b from-blue-50 to-green-50 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <img
              src={animals[currentAnimal].image}
              alt={animals[currentAnimal].name}
              className="rounded-lg shadow-md w-full h-48 object-cover"
            />
            <h2 className="text-3xl font-bold text-primary">{animals[currentAnimal].name}</h2>
          </div>
        </CardContent>
        <CardFooter className="pb-6 pt-2">
          <Button 
            variant="ghost"
            onClick={isPlaying ? stopParade : startParade} 
            className={`w-full ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-semibold py-3 rounded-full transition-colors duration-300`}
          >
            {isPlaying ? (
              <>
                <PauseIcon className="mr-2 h-5 w-5" />
                Stoppe Tier Parade
              </>
            ) : (
              <>
                <PlayIcon className="mr-2 h-5 w-5" />
                Starte Tier Parade
              </>
            )}
          </Button>
          <Button
            onClick={skipToNextAnimal}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 ml-2 px-4 rounded-full transition-colors duration-300"
          >
            <SkipForwardIcon className="h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}