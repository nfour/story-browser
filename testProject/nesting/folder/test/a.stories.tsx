import { observer, useLocalObservable } from 'mobx-react-lite'
import { useEffect } from 'react'

export default {
  title: 'aaaaaa',
}

export const a_test_story_1 = () => {
  return <>aaaa</>
}

export const observer_wrapped_component = observer(() => {
  const { v, setV } = useLocalObservable(() => ({
    v: 1,
    setV(v: number) {
      this.v = v
    },
  }))

  useEffect(() => {
    const t = setInterval(() => {
      setV(v + 1)
    }, 50)

    return () => clearTimeout(t)
  }, [])

  return <>{v}</>
})
