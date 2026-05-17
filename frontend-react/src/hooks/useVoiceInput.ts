import { useRef, useState, useCallback } from 'react'

interface UseVoiceInputReturn {
  listening: boolean
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
  error: string | null
}

export function useVoiceInput(
  onTranscript: (text: string) => void
): UseVoiceInputReturn {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startListening = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Pick a MIME type the browser supports
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'].find(
        (t) => MediaRecorder.isTypeSupported(t)
      ) ?? 'audio/webm'

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        // Stop all mic tracks
        stream.getTracks().forEach((t) => t.stop())

        const blob = new Blob(chunksRef.current, { type: mimeType })
        if (blob.size < 1000) return // too short — ignore

        try {
          const arrayBuffer = await blob.arrayBuffer()
          const response = await fetch('/api/stt', {
            method: 'POST',
            headers: {
              'Content-Type': mimeType,
              'X-Audio-Size': blob.size.toString(),
            },
            body: arrayBuffer,
          })

          if (!response.ok) {
            const txt = await response.text()
            throw new Error(`STT failed: ${txt}`)
          }

          const data = await response.json()
          const transcript = (data.transcript as string)?.trim()
          if (transcript) onTranscript(transcript)
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'STT error'
          setError(msg)
          console.error('[useVoiceInput]', msg)
        }

        setListening(false)
      }

      recorder.start()
      mediaRef.current = recorder
      setListening(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Mic access denied'
      setError(msg)
      setListening(false)
    }
  }, [onTranscript])

  const stopListening = useCallback(() => {
    if (mediaRef.current?.state === 'recording') {
      mediaRef.current.stop()
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening()
    } else {
      startListening()
    }
  }, [listening, startListening, stopListening])

  return { listening, startListening, stopListening, toggleListening, error }
}
