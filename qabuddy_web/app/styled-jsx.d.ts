import 'react'

// styled-jsx adds `jsx` / `global` boolean props to <style>; declare them for TS.
declare module 'react' {
  interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }
}
