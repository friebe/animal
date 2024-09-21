'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayIcon, PauseIcon, SkipForwardIcon } from "lucide-react"
import ml5 from 'ml5'

const animals = [
  { name: "Löwe", image: "/img/loewe.jpg", sound: "/sounds/bbc-lion.mp3"},
  { name: "Elefant", image: "/img/elefant.jpg", sound: "/sounds/bbc-elefant.mp3"},
  { name: "Affe", image: "/img/affe.jpg", sound: "chatter.mp3" },
  { name: "Hund", image: "/img/hund.jpg", sound: "bark.mp3" },
  { name: "Katze", image: "/img/katze.jpg", sound: "meow.mp3" },
]

export function AnimalCardComponent() {
  const [currentAnimal, setCurrentAnimal] = useState(() => Math.floor(Math.random() * animals.length))
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState<string>('')
  const imageRef = useRef<HTMLImageElement>(null)
  const classifierRef = useRef<any>(null)

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
      
      // Setze einen Timer, um nach 8 Sekunden zum nächsten Tier zu wechseln
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(nextAnimal, 8000);
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

  useEffect(() => {
    let isMounted = true;

    if (!classifierRef.current) {
      ml5.imageClassifier('MobileNet').then((classifier:any) => {
        if (isMounted) {
          classifierRef.current = classifier;
          console.log('Klassifizierer geladen');
          // Führe die erste Analyse durch, wenn das Bild bereits geladen ist
          if (imageRef.current) {
            analyzeImage(imageRef.current);
          }
        }
      });
    }

    return () => {
      isMounted = false;
      // Cleanup-Funktion, falls nötig
    };
  }, []);

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      if (img.complete) {
        analyzeImage(img);
      } else {
        img.onload = () => analyzeImage(img);
      }
    }
  }, [currentAnimal]);

  const analyzeImage = useCallback((img: HTMLImageElement) => {
    if (classifierRef.current) {
      classifierRef.current.classify(img, (error: any, results: any) => {
        if (error) {
          console.error("Fehler bei der Bildklassifizierung:", error);
          setImageAnalysis("Analyse fehlgeschlagen");
        } else if (results && results.length > 0) {
          console.log("Klassifizierungsergebnisse:", results);
          const fullLabel = results[0].label;
          const animalName = fullLabel.split(',')[0].trim(); // Extrahiert den Namen vor dem Komma
          setImageAnalysis(`${animalName}`);
        } else {
          setImageAnalysis("Keine Ergebnisse gefunden");
        }
      });
    } else {
      console.log("Klassifizierer noch nicht geladen");
      setImageAnalysis("Klassifizierer wird geladen...");
    }
  }, []);

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      if (img.complete) {
        if (img.naturalWidth === 0) {
          setImageAnalysis("Bild konnte nicht geladen werden");
        } else {
          analyzeImage(img);
        }
      } else {
        img.onload = () => analyzeImage(img);
        img.onerror = () => setImageAnalysis("Bild konnte nicht geladen werden");
      }
    }
  }, [currentAnimal, analyzeImage]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-repeat" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2V6h4V4H6zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}} 
    >
      <Card className="items-start w-[350px] bg-gradient-to-b from-blue-50 to-green-50 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <img
              ref={imageRef}
              src={animals[currentAnimal].image}
              alt={animals[currentAnimal].name}
              className="rounded-lg shadow-md w-full h-48 object-cover"
              crossOrigin="anonymous"
            />
            <h2 className="text-2xl font-bold text-primary">{imageAnalysis}</h2>
          </div>
        </CardContent>
        <CardFooter className="pb-6 pt-2">
          <Button 
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