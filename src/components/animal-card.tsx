'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayIcon, PauseIcon, SkipForwardIcon } from "lucide-react"

const animals = [
  { name: "Löwe", image: "/img/loewe.jpg", sound: "/sounds/bbc-lion.mp3" },
  { name: "Elefant", image: "/placeholder.svg?height=200&width=300", sound: "trumpet.mp3" },
  { name: "Affe", image: "/placeholder.svg?height=200&width=300", sound: "chatter.mp3" },
  { name: "Hund", image: "/placeholder.svg?height=200&width=300", sound: "bark.mp3" },
  { name: "Katze", image: "/placeholder.svg?height=200&width=300", sound: "meow.mp3" },
]

export function AnimalCardComponent() {
  const [currentAnimal, setCurrentAnimal] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.src = animals[currentAnimal].sound;
      audioRef.current.play().catch(() => {
        // Wenn der Sound nicht geladen werden kann, warte 1 Sekunde und gehe zum nächsten Tier
        setTimeout(() => {
          //setIsPlaying(false);
          setCurrentAnimal((prev) => (prev + 1) % animals.length);
        }, 1000);
      });
      setIsPlaying(true);
    }
  }, [currentAnimal]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setIsPlaying(false);
      setCurrentAnimal((prev) => (prev + 1) % animals.length);
    };

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      playSound();
    }
  }, [currentAnimal, isPlaying, playSound]);

  const startParade = () => {
    setIsPlaying(true);
  }

  const stopParade = () => {
    setIsPlaying(false);
    setCurrentAnimal(0);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }

  const skipToNextAnimal = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentAnimal((prev) => (prev + 1) % animals.length);
    if (isPlaying) {
      setTimeout(playSound, 0);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-repeat" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2H36zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}} 
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
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-full transition-colors duration-300"
          >
            <SkipForwardIcon className="h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}