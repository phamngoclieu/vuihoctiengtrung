import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../lib/i18n.jsx'

export function useRecorder() {
  const { l } = useLanguage()
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const [status, setStatus] = useState('idle')
  const [recording, setRecording] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => () => {
    if (recording?.url) URL.revokeObjectURL(recording.url)
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [recording])

  async function start() {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError(l('Trình duyệt này chưa hỗ trợ thu âm trực tiếp.', 'This browser does not support direct recording.', '此浏览器不支持直接录音。'))
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      })
      recorder.addEventListener('stop', () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        setRecording((previous) => {
          if (previous?.url) URL.revokeObjectURL(previous.url)
          return { blob, url: URL.createObjectURL(blob), mimeType: blob.type }
        })
        stream.getTracks().forEach((track) => track.stop())
        setStatus('ready')
      })
      recorder.start()
      recorderRef.current = recorder
      setStatus('recording')
    } catch {
      setError(l('Không thể dùng micro. Hãy kiểm tra quyền truy cập micro của trình duyệt.', 'Unable to use the microphone. Check your browser microphone permission.', '无法使用麦克风，请检查浏览器的麦克风权限。'))
      setStatus('idle')
    }
  }

  function stop() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  function reset() {
    setRecording((previous) => {
      if (previous?.url) URL.revokeObjectURL(previous.url)
      return null
    })
    setStatus('idle')
    setError(null)
  }

  return { status, recording, error, start, stop, reset }
}
