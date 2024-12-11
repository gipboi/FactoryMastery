import { useState, useRef, useEffect, MutableRefObject } from 'react'

export default function useIntersectionObserver(
  ref: MutableRefObject<Element | null>,
  options: Record<string, unknown> = {},
  forward: boolean = true
) {
  const [element, setElement] = useState<Element | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const observer = useRef<null | IntersectionObserver>(null)

  const cleanOb = () => {
    if (observer.current) {
      observer.current.disconnect()
    }
  }

  useEffect(() => {
    setElement(ref.current)
  }, [ref])

  useEffect(() => {
    if (element) {
      cleanOb()
      const ob = (observer.current = new IntersectionObserver(
        ([entry]) => {
          const isElementIntersecting = entry.isIntersecting
          if (!forward) {
            setIsIntersecting(isElementIntersecting)
          } else if (forward && !isIntersecting && isElementIntersecting) {
            setIsIntersecting(isElementIntersecting)
            cleanOb()
          }
        },
        { ...options }
      ))
      ob.observe(element)
    }

    return () => {
      cleanOb()
    }
  }, [element, options])

  return isIntersecting
}
